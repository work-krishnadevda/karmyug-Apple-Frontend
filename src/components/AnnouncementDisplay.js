import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CAlert,
  CSpinner,
  CBadge,
  CButton,
  CCollapse
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilChevronBottom, cilChevronTop } from '@coreui/icons'
import BasicProvider from 'src/constants/BasicProvider'
import 'src/assets/css/announcements.css'

const AnnouncementDisplay = ({ showAll = false, limit = 3 }) => {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedItems, setExpandedItems] = useState(new Set())

  // Fetch announcements
  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const response = await new BasicProvider('announcements').getRequest()
      const allAnnouncements = response.data || []
      
      // Sort by priority and date
      const sortedAnnouncements = allAnnouncements.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, normal: 1 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        return new Date(b.createdAt) - new Date(a.createdAt)
      })

      setAnnouncements(showAll ? sortedAnnouncements : sortedAnnouncements.slice(0, limit))
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [showAll, limit])

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger'
      case 'medium': return 'warning'
      case 'normal': return 'info'
      default: return 'secondary'
    }
  }

  // Toggle expand/collapse
  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  if (loading) {
    return (
      <CCard>
        <CCardBody className="text-center">
          <CSpinner />
          <p className="mt-2">Loading announcements...</p>
        </CCardBody>
      </CCard>
    )
  }

  if (announcements.length === 0) {
    return null // Don't show anything if no announcements
  }

  return (
    <CCard>
      <CCardHeader className="d-flex align-items-center">
        <CIcon icon={cilBell} className="me-2" />
        <h6 className="mb-0">Latest Announcements</h6>
        {!showAll && announcements.length > 0 && (
          <CBadge color="primary" className="ms-auto">
            {announcements.length}
          </CBadge>
        )}
      </CCardHeader>
      <CCardBody>
        <div className="announcement-list">
          {announcements.map((announcement, index) => {
            const isExpanded = expandedItems.has(announcement._id)
            const isLongMessage = announcement.message.length > 100
            
            return (
              <div 
                key={announcement._id} 
                className={`announcement-item mb-3 p-3 border rounded ${
                  announcement.priority === 'high' ? 'border-danger' : 
                  announcement.priority === 'medium' ? 'border-warning' : 'border-info'
                }`}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <h6 className="mb-0 me-2">{announcement.title}</h6>
                      <CBadge color={getPriorityColor(announcement.priority)}>
                        {announcement.priority}
                      </CBadge>
                    </div>
                    
                    <div className="announcement-message">
                      {isLongMessage && !isExpanded ? (
                        <>
                          <p className="text-muted mb-2">
                            {announcement.message.substring(0, 100)}...
                          </p>
                          <CButton
                            color="link"
                            size="sm"
                            onClick={() => toggleExpanded(announcement._id)}
                            className="p-0"
                          >
                            Read more <CIcon icon={cilChevronBottom} />
                          </CButton>
                        </>
                      ) : (
                        <>
                          <p className="text-muted mb-2">{announcement.message}</p>
                          {isLongMessage && (
                            <CButton
                              color="link"
                              size="sm"
                              onClick={() => toggleExpanded(announcement._id)}
                              className="p-0"
                            >
                              Show less <CIcon icon={cilChevronTop} />
                            </CButton>
                          )}
                        </>
                      )}
                    </div>
                    
                    <small className="text-muted">
                      By: {announcement.createdBy} | 
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CCardBody>
    </CCard>
  )
}

export default AnnouncementDisplay
