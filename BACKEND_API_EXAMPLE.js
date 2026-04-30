/**
 * BACKEND API IMPLEMENTATION  
 *   
 */

// ============= routes/announcements.js =============

router.put('/announcements/:id/mark-read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { staff_id, viewed_at } = req.body

    if (!staff_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'staff_id is required' 
      })
    }

    // Check if announcement exists
    const announcement = await Announcement.findById(id)
    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      })
    }

    // Create or update read record
    const readRecord = await AnnouncementRead.findOneAndUpdate(
      { announcement_id: id, staff_id: staff_id },
      {
        announcement_id: id,
        staff_id: staff_id,
        viewed_at: viewed_at || new Date(),
        updated_at: new Date()
      },
      { upsert: true, new: true }
    )

    res.json({
      success: true,
      message: 'Announcement marked as read',
      data: readRecord
    })
  } catch (error) {
    console.error('Error marking announcement as read:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark announcement as read',
      error: error.message 
    })
  }
})


// ============= Bulk Mark as Read =============

router.put('/announcements/mark-read-bulk', authenticateToken, async (req, res) => {
  try {
    const { staff_id, announcement_ids, viewed_at } = req.body

    if (!staff_id || !Array.isArray(announcement_ids) || announcement_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'staff_id and announcement_ids array are required'
      })
    }

    // Bulk create/update read records
    const operations = announcement_ids.map(id => ({
      updateOne: {
        filter: { 
          announcement_id: id, 
          staff_id: staff_id 
        },
        update: {
          $set: {
            announcement_id: id,
            staff_id: staff_id,
            viewed_at: viewed_at || new Date(),
            updated_at: new Date()
          }
        },
        upsert: true
      }
    }))

    const result = await AnnouncementRead.bulkWrite(operations)

    res.json({
      success: true,
      count: result.upsertedCount + result.modifiedCount,
      message: `${result.upsertedCount + result.modifiedCount} announcements marked as read`
    })
  } catch (error) {
    console.error('Error marking announcements as read (bulk):', error)
    res.status(500).json({
      success: false,
      message: 'Failed to mark announcements as read',
      error: error.message
    })
  }
})


// ============= Get Unread Count =============

router.get('/announcements/unread-count/:staffId', authenticateToken, async (req, res) => {
  try {
    const { staffId } = req.params

    // Get all announcements for this staff
    const announcements = await Announcement.find({
      $or: [
        { target_roles: { $in: [req.user.role] } },
        { staff: staffId },
        { is_published: true }
      ],
      schedule_at: { $lte: new Date() }
    }).select('_id is_read')

    // Get read records
    const readRecords = await AnnouncementRead.find({
      staff_id: staffId,
      announcement_id: { $in: announcements.map(a => a._id) }
    }).select('announcement_id')

    const readIds = new Set(readRecords.map(r => r.announcement_id.toString()))
    const unreadCount = announcements.filter(a => !readIds.has(a._id.toString())).length

    res.json({
      success: true,
      count: unreadCount,
      total: announcements.length
    })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    })
  }
})


// ============= Get Unread Announcements =============

router.get('/announcements/unread/:staffId', authenticateToken, async (req, res) => {
  try {
    const { staffId } = req.params

    // Get announcements for this staff
    const announcements = await Announcement.find({
      $or: [
        { target_roles: { $in: [req.user.role] } },
        { staff: staffId },
        { is_published: true }
      ],
      schedule_at: { $lte: new Date() }
    })

    // Get read records
    const readRecords = await AnnouncementRead.find({
      staff_id: staffId,
      announcement_id: { $in: announcements.map(a => a._id) }
    }).select('announcement_id')

    const readIds = new Set(readRecords.map(r => r.announcement_id.toString()))

    // Filter unread
    const unreadAnnouncements = announcements.filter(a => 
      !readIds.has(a._id.toString())
    )

    res.json({
      success: true,
      data: unreadAnnouncements
    })
  } catch (error) {
    console.error('Error fetching unread announcements:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread announcements',
      error: error.message
    })
  }
})


// ============= Get Read Status =============

router.get('/announcements/:id/read-status/:staffId', authenticateToken, async (req, res) => {
  try {
    const { id, staffId } = req.params

    const readRecord = await AnnouncementRead.findOne({
      announcement_id: id,
      staff_id: staffId
    })

    res.json({
      success: true,
      is_read: !!readRecord,
      read_at: readRecord?.viewed_at || null
    })
  } catch (error) {
    console.error('Error fetching read status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch read status',
      error: error.message
    })
  }
})


// ============= Update Existing Endpoint =============
// GET /api/announcements/staff/:staffId - UPDATED

router.get('/announcements/staff/:staffId', authenticateToken, async (req, res) => {
  try {
    const { staffId } = req.params

    // Get announcements for this staff
    const announcements = await Announcement.find({
      $or: [
        { target_roles: { $in: [req.user.role] } },
        { staff: staffId },
        { is_published: true }
      ],
      schedule_at: { $lte: new Date() }
    })

    // Get read records
    const readRecords = await AnnouncementRead.find({
      staff_id: staffId,
      announcement_id: { $in: announcements.map(a => a._id) }
    }).lean()

    const readMap = new Map(
      readRecords.map(r => [r.announcement_id.toString(), r])
    )

    // Add is_read field to each announcement
    const enrichedAnnouncements = announcements.map(ann => {
      const readRecord = readMap.get(ann._id.toString())
      return {
        ...ann.toObject(),
        is_read: !!readRecord,
        viewed_at: readRecord?.viewed_at || null
      }
    })

    res.json({
      success: true,
      data: enrichedAnnouncements
    })
  } catch (error) {
    console.error('Error fetching staff announcements:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements',
      error: error.message
    })
  }
})


// ============= models/AnnouncementRead.js =============

const announcementReadSchema = new mongoose.Schema({
  announcement_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Announcement',
    required: true,
    index: true
  },
  staff_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true,
    index: true
  },
  viewed_at: {
    type: Date,
    default: () => new Date(),
    index: true
  },
  created_at: {
    type: Date,
    default: () => new Date()
  },
  updated_at: {
    type: Date,
    default: () => new Date()
  }
}, { timestamps: true })

// Unique compound index
announcementReadSchema.index({ announcement_id: 1, staff_id: 1 }, { unique: true })

module.exports = mongoose.model('AnnouncementRead', announcementReadSchema)


// ============= Database Migration =============

// migration/add_announcement_read_tracking.js

const mongoose = require('mongoose')

async function migrate() {
  try {
    console.log('Starting migration: Add announcement read tracking...')

    // Create AnnouncementRead collection
    const db = mongoose.connection.db
    
    try {
      await db.createCollection('announcement_reads')
      console.log('✓ Created announcement_reads collection')
    } catch (err) {
      if (err.codeName === 'NamespaceExists') {
        console.log('✓ announcement_reads collection already exists')
      } else {
        throw err
      }
    }

    // Create indexes
    const announcementReads = db.collection('announcement_reads')
    
    await announcementReads.createIndex({ announcement_id: 1, staff_id: 1 }, { unique: true })
    console.log('✓ Created unique index on announcement_id and staff_id')

    await announcementReads.createIndex({ staff_id: 1 })
    console.log('✓ Created index on staff_id')

    await announcementReads.createIndex({ viewed_at: 1 })
    console.log('✓ Created index on viewed_at')

    console.log('\n✓ Migration completed successfully!')
  } catch (error) {
    console.error('✗ Migration failed:', error)
    throw error
  }
}

module.exports = migrate


// ============= Usage =============
/*
 * How to use in your existing routes:
 * 
 * const announcementRoutes = require('./routes/announcements')
 * app.use('/api', announcementRoutes)
 * 
 * Then these endpoints will be available:
 * - PUT /api/announcements/:id/mark-read
 * - PUT /api/announcements/mark-read-bulk
 * - GET /api/announcements/unread-count/:staffId
 * - GET /api/announcements/unread/:staffId
 * - GET /api/announcements/:id/read-status/:staffId
 * - GET /api/announcements/staff/:staffId (UPDATED)
 */
