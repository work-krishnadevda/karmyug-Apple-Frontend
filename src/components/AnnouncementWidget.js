import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormTextarea,
  CAlert,
  CSpinner,
  CBadge
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import BasicProvider from 'src/constants/BasicProvider'
import { useSelector } from 'react-redux'
import 'src/assets/css/announcements.css'

let ADMIN = process.env.REACT_APP_ADMIN
let HR = process.env.REACT_APP_HR

const AnnouncementWidget = () => {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'normal'
  })
  const [alert, setAlert] = useState({ show: false, message: '', type: '' })

  const loggedinUserRole = useSelector((state) => state?.userRole)
  const isAdminOrHR = loggedinUserRole?.name === ADMIN || loggedinUserRole?.name === HR

  // Fetch announcements
  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const response = await new BasicProvider('announcements').getRequest()
      setAnnouncements(response.data || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
      setAlert({
        show: true,
        message: 'Failed to fetch announcements',
        type: 'danger'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingAnnouncement 
        ? `announcements/${editingAnnouncement._id}`
        : 'announcements'
      
      const method = editingAnnouncement ? 'putRequest' : 'postRequest'
      
      const response = await new BasicProvider(url)[method]({
        ...formData,
        createdBy: loggedinUserRole?.name,
        createdAt: new Date().toISOString()
      })

      setAlert({
        show: true,
        message: editingAnnouncement 
          ? 'Announcement updated successfully!' 
          : 'Announcement created successfully!',
        type: 'success'
      })

      setShowModal(false)
      setEditingAnnouncement(null)
      setFormData({ title: '', message: '', priority: 'normal' })
      fetchAnnouncements()
    } catch (error) {
      console.error('Error saving announcement:', error)
      setAlert({
        show: true,
        message: 'Failed to save announcement',
        type: 'danger'
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle edit
  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      message: announcement.message,
      priority: announcement.priority
    })
    setShowModal(true)
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return
    }

    setLoading(true)
    try {
      await new BasicProvider(`announcements/${id}`).deleteRequest()
      setAlert({
        show: true,
        message: 'Announcement deleted successfully!',
        type: 'success'
      })
      fetchAnnouncements()
    } catch (error) {
      console.error('Error deleting announcement:', error)
      setAlert({
        show: true,
        message: 'Failed to delete announcement',
        type: 'danger'
      })
    } finally {
      setLoading(false)
    }
  }

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger'
      case 'medium': return 'warning'
      case 'normal': return 'info'
      default: return 'secondary'
    }
  }

  return (
    <div>
      {alert.show && (
        <CAlert
          color={alert.type}
          dismissible
          onClose={() => setAlert({ show: false, message: '', type: '' })}
        >
          {alert.message}
        </CAlert>
      )}

      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <CIcon icon={cilBell} className="me-2" />
                <h5 className="mb-0">Announcements</h5>
              </div>
              {isAdminOrHR && (
                <CButton
                  color="primary"
                  onClick={() => {
                    setEditingAnnouncement(null)
                    setFormData({ title: '', message: '', priority: 'normal' })
                    setShowModal(true)
                  }}
                >
                  <CIcon icon={cilPlus} className="me-1" />
                  Add Announcement
                </CButton>
              )}
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <div className="text-center">
                  <CSpinner />
                  <p>Loading announcements...</p>
                </div>
              ) : announcements.length === 0 ? (
                <div className="text-center text-muted">
                  <CIcon icon={cilBell} size="3xl" className="mb-3" />
                  <p>No announcements yet</p>
                </div>
              ) : (
                <div className="announcement-list">
                  {announcements.map((announcement) => (
                    <div key={announcement._id} className="announcement-item mb-3 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <h6 className="mb-0 me-2">{announcement.title}</h6>
                            <CBadge color={getPriorityColor(announcement.priority)}>
                              {announcement.priority}
                            </CBadge>
                          </div>
                          <p className="text-muted mb-2">{announcement.message}</p>
                          <small className="text-muted">
                            By: {announcement.createdBy} | 
                            {new Date(announcement.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        {isAdminOrHR && (
                          <div className="d-flex gap-2">
                            <CButton
                              color="outline-primary"
                              size="sm"
                              onClick={() => handleEdit(announcement)}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              color="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(announcement._id)}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Add/Edit Modal */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>
            {editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <CFormInput
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value.toUpperCase() })}
                placeholder="Enter announcement title"
                required
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Message</label>
              <CFormTextarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter announcement message"
                rows={4}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </CButton>
            <CButton color="primary" type="submit" disabled={loading}>
              {loading ? <CSpinner size="sm" /> : 'Save'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </div>
  )
}

export default AnnouncementWidget
