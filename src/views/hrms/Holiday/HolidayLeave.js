import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CRow,
  CCol,
  CFormInput,
  CModal,
  CModalHeader,
  CModalTitle,
  CForm,
  CModalBody,
  CModalFooter,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import { Calendar, PlusCircle, Send, Edit, Trash2, Eye } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import BasicProvider from 'src/constants/BasicProvider'

export default function HolidayCalendar() {
  const [templates, setTemplates] = useState([])
  const [holidays, setHolidays] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showHolidayModal, setShowHolidayModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showHolidayDeleteConfirm, setShowHolidayDeleteConfirm] = useState(false)
  const [holidayToDeleteId, setHolidayToDeleteId] = useState(null)
  const [form, setForm] = useState({ date: '', reason: '', type: 'Full Day' })
  const [editHolidayId, setEditHolidayId] = useState(null)
  const [editTemplateId, setEditTemplateId] = useState(null)
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [templateName, setTemplateName] = useState('')

  const templateProvider = new BasicProvider('holiday-templates')
  const holidayProvider = new BasicProvider('holidays')

  // Helper function to check if a date is in the past
  const isPastDate = (dateString) => {
    if (!dateString) return false
    const holidayDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    holidayDate.setHours(0, 0, 0, 0)
    return holidayDate < today
  }

  useEffect(() => {
    fetchTemplates()
    fetchAllHolidays()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await new BasicProvider('holiday-templates').getRequest()
      setTemplates(res.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load templates')
    }
  }

  const fetchAllHolidays = async () => {
    try {
      const res = await holidayProvider.getRequest()
      setHolidays(res.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load holidays')
    }
  }

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return toast.error('Enter template name')

    try {
      if (editTemplateId) {
        await new BasicProvider(`holiday-templates/${editTemplateId}`).patchRequest({
          name: templateName.trim(),
        })
        toast.success('Template Updated!')
      } else {
        await templateProvider.postRequest({ name: templateName.trim() })
        toast.success('Template Created!')
      }
      setTemplateName('')
      setEditTemplateId(null)
      setShowTemplateModal(false)
      fetchTemplates()
    } catch (err) {
      console.error(err)
      toast.error('Error saving template')
    }
  }

  const confirmDeleteTemplate = (template) => {
    setEditTemplateId(template._id)
    setShowDeleteConfirm(true)
  }

  const deleteTemplate = async () => {
    try {
      await new BasicProvider(`holiday-templates/${editTemplateId}`).deleteRealRequest()
      toast.success('Template Deleted!')
      setShowDeleteConfirm(false)
      setEditTemplateId(null)
      fetchTemplates()
      if (selectedTemplate?._id === editTemplateId) setSelectedTemplate(null)
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const handleAddHoliday = async () => {
    if (!form.date || !form.reason) {
      toast.error('Please fill date and reason')
      return
    }
    if (!selectedTemplate) {
      toast.error('Select a template first')
      return
    }

    // If editing, check if the original holiday is in the past
    if (editHolidayId) {
      const holidayToEdit = holidays.find((h) => h._id === editHolidayId)
      if (holidayToEdit && isPastDate(holidayToEdit.date)) {
        toast.error('Cannot edit past holidays')
        setShowHolidayModal(false)
        setEditHolidayId(null)
        setForm({ date: '', reason: '', type: 'Full Day' })
        return
      }
    }

    // Check if date is in the past
    const selectedDate = new Date(form.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      toast.error('Cannot select past dates')
      return
    }

    try {
      if (editHolidayId) {
        await new BasicProvider(`holidays/${editHolidayId}`).patchRequest({
          date: form.date,
          name: form.reason,
          description: form.type,
          template_id: [selectedTemplate._id],
        })
        toast.success('Holiday Updated')
      } else {
        await new BasicProvider('holidays').postRequest({
          template_id: [selectedTemplate._id],
          date: form.date,
          name: form.reason,
          description: form.type,
        })
        toast.success('Holiday Added')
      }

      await fetchAllHolidays()
      setForm({ date: '', reason: '', type: 'Full Day' })
      setEditHolidayId(null)
      setShowHolidayModal(false)
    } catch (err) {
      console.error(err)
      toast.error('Error saving holiday')
    }
  }

  const confirmDeleteHoliday = (holidayId) => {
    // Check if holiday is in the past
    const holidayToDelete = holidays.find((h) => h._id === holidayId)
    if (holidayToDelete && isPastDate(holidayToDelete.date)) {
      toast.error('Cannot delete past holidays')
      return
    }
    setHolidayToDeleteId(holidayId)
    setShowHolidayDeleteConfirm(true)
  }

  const deleteHoliday = async () => {
    if (!holidayToDeleteId) return toast.error('Holiday ID missing')
    
    try {
      await new BasicProvider(`holidays/${holidayToDeleteId}`).deleteRealRequest()
      await fetchAllHolidays()
      toast.success('Holiday Deleted')
      setShowHolidayDeleteConfirm(false)
      setHolidayToDeleteId(null)
    } catch {
      toast.error('Failed to delete')
    }
  }

  const sendCalendar = () => {
    if (!selectedEmployees.length) {
      toast.error('Select at least one employee')
      return
    }
    toast.success('Calendar Sent Successfully ')
    setShowSendModal(false)
  }

  const filteredHolidays = selectedTemplate
    ? holidays.filter((h) => h.template_id?.includes(selectedTemplate._id))
    : []

  const totalFull = filteredHolidays.filter((h) => h.description === 'Full Day').length
  const totalHalf = filteredHolidays.filter((h) => h.description === 'Half Day').length

  return (
    <div className="p-4">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold d-flex align-items-center gap-2">
          <Calendar size={22} /> Holiday Calendar Management
        </h3>
        <CButton
          color="primary"
          onClick={() => {
            setTemplateName('')
            setEditTemplateId(null)
            setShowTemplateModal(true)
          }}
        >
          + Create Template
        </CButton>
      </div>

      {/* TEMPLATE CARDS */}
      <CRow className="g-3">
        {templates.map((t) => (
          <CCol xs={12} md={4} key={t._id}>
            <CCard className="p-3 border" style={{ position: 'relative' }}>
              <h5>{t.name} Calendar</h5>
              <p className="text-muted mb-2">
                {holidays.filter((h) => h.template_id?.includes(t._id)).length} holidays added
              </p>
              <div className="d-flex gap-2">
                <CButton color="info" size="sm" onClick={() => setSelectedTemplate(t)}>
                  <Eye size={14} className="me-1" /> View
                </CButton>
                <CButton
                  color="warning"
                  size="sm"
                  onClick={() => {
                    setEditTemplateId(t._id)
                    setTemplateName(t.name)
                    setShowTemplateModal(true)
                  }}
                >
                  <Edit size={14} className="me-1" /> Edit
                </CButton>
                <CButton color="danger" size="sm" onClick={() => confirmDeleteTemplate(t)}>
                  <Trash2 size={14} className="me-1" /> Delete
                </CButton>
              </div>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* HOLIDAY TABLE (View Mode) */}
      {selectedTemplate && (
        <>
          <div className="d-flex justify-content-between align-items-center mt-4">
            <h5>{selectedTemplate.name} Holidays</h5>
            <div>
              <CButton color="success" className="me-2" onClick={() => setShowHolidayModal(true)}>
                <PlusCircle size={16} className="me-1" /> Add Holiday
              </CButton>
              {/* <CButton color="info" onClick={() => setShowSendModal(true)}>
                <Send size={16} className="me-1" /> Send Calendar
              </CButton> */}
            </div>
          </div>

          <p className="text-muted mt-2">
            Total: {filteredHolidays.length} | Full Day: {totalFull} | Half Day: {totalHalf}
          </p>

          <CCard className="mt-3">
            <CCardBody>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Reason</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHolidays.map((h) => {
                    const isPast = isPastDate(h.date)
                    return (
                      <tr key={h._id}>
                        <td>{h.date}</td>
                        <td>{h.name}</td>
                        <td>{h.description}</td>
                        <td>
                          <CButton
                            color="warning"
                            size="sm"
                            className="me-2"
                            disabled={isPast}
                            onClick={() => {
                              if (isPast) {
                                toast.error('Cannot edit past holidays')
                                return
                              }
                              setForm({
                                date: h.date,
                                reason: h.name,
                                type: h.description || 'Full Day',
                              })
                              setEditHolidayId(h._id)
                              setShowHolidayModal(true)
                            }}
                            title={isPast ? 'Cannot edit past holidays' : 'Edit holiday'}
                          >
                            <Edit size={14} />
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            disabled={isPast}
                            onClick={() => confirmDeleteHoliday(h._id)}
                            title={isPast ? 'Cannot delete past holidays' : 'Delete holiday'}
                          >
                            <Trash2 size={14} />
                          </CButton>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CCardBody>
          </CCard>
        </>
      )}

      {/* CREATE / EDIT TEMPLATE MODAL */}
      <CModal visible={showTemplateModal} onClose={() => setShowTemplateModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>{editTemplateId ? 'Edit Template' : 'Create Template'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type="text"
            placeholder="Enter Template Name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="mb-3"
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowTemplateModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSaveTemplate}>
            {editTemplateId ? 'Update' : 'Create'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* DELETE CONFIRMATION MODAL */}
      <CModal visible={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>Are you sure you want to delete this template?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={deleteTemplate}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>

      {/* HOLIDAY DELETE CONFIRMATION MODAL */}
      <CModal visible={showHolidayDeleteConfirm} onClose={() => setShowHolidayDeleteConfirm(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>Do you want to delete this holiday?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowHolidayDeleteConfirm(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={deleteHoliday}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ADD / EDIT HOLIDAY MODAL */}
      <CModal visible={showHolidayModal} onClose={() => setShowHolidayModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>{editHolidayId ? 'Edit Holiday' : 'Add Holiday'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type="date"
            className="mb-2"
            value={form.date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <CFormInput
            placeholder="Reason"
            className="mb-2"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
          <AppFormSelect
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="mb-3"
          >
            <option>Full Day</option>
            <option>Half Day</option>
          </AppFormSelect>
          <CButton color="primary" onClick={handleAddHoliday}>
            {editHolidayId ? 'Update' : 'Add'} Holiday
          </CButton>
        </CModalBody>
      </CModal>

      {/* SEND CALENDAR MODAL */}
      <CModal visible={showSendModal} onClose={() => setShowSendModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Send Calendar to Employees</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            placeholder="Enter Employee Emails (comma separated)"
            value={selectedEmployees.join(', ')}
            onChange={(e) => setSelectedEmployees(e.target.value.split(',').map((x) => x.trim()))}
            className="mb-3"
          />
          <CButton color="success" onClick={sendCalendar}>
            Send Calendar
          </CButton>
        </CModalBody>
      </CModal>
    </div>
  )
}

