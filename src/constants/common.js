import axios from 'axios'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import BasicProvider from './BasicProvider'
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer'
import moment from 'moment'

const normalizeRoleName = (roleName) => {
  const normalized = roleName?.toLowerCase()
  return normalized === 'tenant_admin' ? 'admin' : normalized
}

export const checkRole = (roleName, admin) => {
  if (admin && admin.role) {
    const targetRole = normalizeRoleName(roleName)
    return admin?.role?.some((role) => normalizeRoleName(role.name) === targetRole)
  }
  return false
}

export function hasAccess(userRole, roles, showForAll = false) {
  // If roles array is empty or showForAll is true, grant access to all users
  if (showForAll || (roles && roles.length === 0)) {
    return true
  }

  if (Array.isArray(userRole) && roles) {
    return userRole.some((userRoleItem) => {
      const userRoleName = normalizeRoleName(userRoleItem?.name)
      return roles.some((role) => userRoleName === normalizeRoleName(role))
    })
  }
  return false
}

export function convertUtcToDateWithTime(utcDateString) {
  const utcDate = new Date(utcDateString)
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }

  const formattedDateTime = utcDate.toLocaleDateString('en-US', options)
  return formattedDateTime
}

export const handleDownload = async (fullUrl) => {
  try {
    const response = await axios.get(fullUrl, {
      responseType: 'blob',
    })

    const contentType = String(response?.headers?.['content-type'] || '').toLowerCase()
    const contentDisposition = String(response?.headers?.['content-disposition'] || '')

    const extFromType = (() => {
      if (contentType.includes('application/pdf')) return '.pdf'
      if (
        contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      )
        return '.xlsx'
      if (contentType.includes('application/vnd.ms-excel')) return '.xls'
      if (
        contentType.includes(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        )
      )
        return '.docx'
      if (contentType.includes('application/msword')) return '.doc'
      if (contentType.includes('image/jpeg')) return '.jpg'
      if (contentType.includes('image/png')) return '.png'
      return ''
    })()

    const getFileNameFromDisposition = () => {
      const starMatch = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
      if (starMatch?.[1]) return decodeURIComponent(starMatch[1])
      const plainMatch = contentDisposition.match(/filename\s*=\s*"([^"]+)"/i)
      if (plainMatch?.[1]) return plainMatch[1]
      const plainNoQuoteMatch = contentDisposition.match(/filename\s*=\s*([^;]+)/i)
      if (plainNoQuoteMatch?.[1]) return plainNoQuoteMatch[1].trim()
      return ''
    }

    const getFileNameFromUrl = () => {
      try {
        const parsed = new URL(fullUrl)
        const pathName = parsed.pathname || ''
        const raw = pathName.split('/').pop() || 'download'
        return decodeURIComponent(raw)
      } catch {
        const clean = String(fullUrl || '').split('?')[0]
        return decodeURIComponent(clean.split('/').pop() || 'download')
      }
    }

    const sanitizeFileName = (name) =>
      String(name || 'download')
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
        .trim()

    let fileName = sanitizeFileName(getFileNameFromDisposition() || getFileNameFromUrl())

    if (!/\.[a-z0-9]{2,6}$/i.test(fileName) && extFromType) {
      fileName = `${fileName}${extFromType}`
    }

    const lowerType = contentType.toLowerCase()
    if (
      lowerType.includes('application/json') ||
      lowerType.includes('text/html') ||
      lowerType.includes('application/xml') ||
      lowerType.includes('text/xml')
    ) {
      throw new Error('Invalid or expired file URL (non-binary response)')
    }

    const ext = (fileName.match(/\.([a-z0-9]{2,6})$/i)?.[1] || '').toLowerCase()
    const bytes = new Uint8Array(await response.data.slice(0, 8).arrayBuffer())
    const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 // %PDF
    const isZipBased = bytes[0] === 0x50 && bytes[1] === 0x4b // PK
    const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    const isPng =
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47

    if (ext === 'pdf' && !isPdf) throw new Error('Downloaded file is not a valid PDF')
    if (['xlsx', 'xlsm', 'docx', 'zip'].includes(ext) && !isZipBased) {
      throw new Error('Downloaded office file is invalid/corrupted')
    }
    if ((ext === 'jpg' || ext === 'jpeg') && !isJpg) {
      throw new Error('Downloaded file is not a valid JPG image')
    }
    if (ext === 'png' && !isPng) throw new Error('Downloaded file is not a valid PNG image')

    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: contentType || 'application/octet-stream' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName || 'download')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    // customSuccessMSG(dispatch, 'File Downloaded Successfully !!')
  } catch (error) {
    console.error('Error downloading file:', { url: fullUrl, message: error?.message, error })
    throw error
  }
}

export const keysMatchingHelper = async (initialValues) => {
  const updatedFinance = (initialValues?.finance_name?.fields || []).map((item) => {
    let updatedItem = { ...item }
    const matchedData = Object.entries(initialValues).find(([key, value]) => item.title === key)

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const options = { day: 'numeric', month: 'short', year: 'numeric' }
      return date.toLocaleDateString('en-GB', options)
    }

    if (
      matchedData &&
      matchedData[1] !== undefined &&
      matchedData[1] !== null &&
      matchedData[1] !== ''
    ) {
      if (
        ['date_initiation_bank', 'date_initiation_RA', 'mortaged_month_year'].includes(
          matchedData[0],
        )
      ) {
        updatedItem.value = formatDate(matchedData[1])
      } else {
        updatedItem.value = matchedData[1]
      }
    } else if (initialValues.additional_fields && Array.isArray(initialValues.additional_fields)) {
      const additionalField = initialValues.additional_fields.find((field) => {
        return field?.role?.toLowerCase() === item?.role?.toLowerCase()
      })
      if (
        additionalField &&
        additionalField[item.title] !== undefined &&
        additionalField[item.title] !== null &&
        additionalField[item.title] !== ''
      ) {
        if (
          ['date_initiation_bank', 'date_initiation_RA', 'mortaged_month_year'].includes(item.title)
        ) {
          updatedItem.value = formatDate(additionalField[item.title])
        } else {
          updatedItem.value = additionalField[item.title]
        }
      } else {
        updatedItem.value = ''
      }
    } else {
      updatedItem.value = ''
    }

    return updatedItem
  })

  return updatedFinance
}

const findMatchingAttachment = (data) => {
  const hasMatchingRole = (attachment, bankRoles) => {
    // Normalize bankRoles to always be an array
    const normalizedBankRoles = Array.isArray(bankRoles) ? bankRoles : [bankRoles]

    // Normalize the attachment roles to handle both array and object cases
    let normalizedAttachmentRoles = []
    if (Array.isArray(attachment?.admin?.role)) {
      normalizedAttachmentRoles = attachment.admin.role
    } else if (attachment?.admin?.role && typeof attachment.admin.role === 'object') {
      normalizedAttachmentRoles = [attachment.admin.role]
    }

    // If either roles array is missing or empty, return false
    if (!normalizedAttachmentRoles.length || !normalizedBankRoles.length) return false

    // Extract the role names from bankRoles for comparison
    const bankRoleNames = normalizedBankRoles.map((role) => role.name)

    // Check if any of the attachment roles match the bank role names
    return normalizedAttachmentRoles.some((role) => bankRoleNames.includes(role.name))
  }

  const bankRoles = data.bank_submitted_by?.by?.role || []

  const attachments = [
    { type: 'dm_attechment', value: data.dm_attechment },
    { type: 'rc_attechment', value: data.rc_attechment },
    { type: 'lcto_attechment', value: data.lcto_attechment },
    { type: 'cto_attechment', value: data.cto_attechment },
  ]

  if (data.case_revise === '1') {
    const latestAttachment = attachments
      .filter((item) => item?.value)
      .sort((a, b) => new Date(b.value?.timestamp) - new Date(a.value?.timestamp))[0]

    return latestAttachment
  }

  for (const attachmentItem of attachments) {
    if (hasMatchingRole(attachmentItem?.value, bankRoles)) {
      return attachmentItem
    }
  }

  return null
}

export const downloadFinalReportZip = async (data, setIsLoadingSpinner, dispatch) => {
  try {
    setIsLoadingSpinner(true)

    if (data) {
      // List table rows often lack full nested data; fetch full case when needed for ZIP
      let caseData = data
      const hasFullCaseData =
        data?.finance_name?.featured_image?.filepath &&
        (data?.dm_attechment || data?.rc_attechment || data?.lcto_attechment || data?.cto_attechment)
      if (data._id && !hasFullCaseData) {
        try {
          const res = await new BasicProvider(`cases/show/${data._id}`, dispatch).getRequest()
          caseData = res?.data ?? res
        } catch (e) {
          console.error('Error fetching case details for ZIP:', e)
          dispatch({ type: 'set', validations: ['Missing required data for ZIP creation'] })
          setIsLoadingSpinner(false)
          return
        }
      }

      let fullUrl = `${process.env.REACT_APP_NODE_URL}/${caseData?.finance_name?.featured_image?.filepath}`
      let zipName = `${caseData?.applicant_name}-${caseData?.finance_name?.name}` || 'final-report'
      const matchingAttachmentItem = findMatchingAttachment(caseData)
      const matchingAttachment = matchingAttachmentItem?.value || null
      const selectedAttachmentType = matchingAttachmentItem?.type || 'unknown'

      let json = {
        pdf_url: fullUrl,
        data: [],
        images: caseData.fe_images_data,
        images_2: caseData.dm_images_data,
        page: caseData?.finance_name?.images_page_no,
        addon_data: caseData.case_addons,
        header_image: `${process.env.REACT_APP_NODE_URL}/${caseData?.ra_branch?.featured_image?.filepath}`,
      }

      let response2
      try {
        response2 = await new BasicProvider('cases/genrate/report', dispatch).postRequest(json)
      } catch (apiErr) {
        console.error('Report API error:', apiErr)
        dispatch({
          type: 'set',
          validations: ['Report generation failed. Please try again.'],
        })
        setIsLoadingSpinner(false)
        return
      }

      // Backend may return { data: "error message" } on timeout/failure instead of { data: { file_url } }
      const reportPayload = response2?.data
      const fileUrl =
        (typeof reportPayload === 'object' && reportPayload !== null && reportPayload.file_url) ||
        (typeof reportPayload === 'object' &&
        reportPayload !== null &&
        typeof reportPayload?.data === 'object' &&
        reportPayload?.data?.file_url
          ? reportPayload.data.file_url
          : null)

      if (!fileUrl) {
        const backendError =
          typeof reportPayload === 'string' ? reportPayload : reportPayload?.message || ''
        dispatch({
          type: 'set',
          validations: [
            backendError
              ? 'Report generation failed. Please try again later.'
              : 'Report generation failed. Missing file URL.',
          ],
        })
        setIsLoadingSpinner(false)
        return
      }

      if (!matchingAttachment) {
        dispatch({
          type: 'set',
          validations: ['No matching attachment found for this case. ZIP cannot be created.'],
        })
        setIsLoadingSpinner(false)
        return
      }

      const resolvedAttachmentUrl =
        matchingAttachment?.download_url ||
        caseData?.attachment_download_urls?.[selectedAttachmentType] ||
        ''

      if (!resolvedAttachmentUrl) {
        dispatch({
          type: 'set',
          validations: ['Attachment unavailable or unauthorized.'],
        })
        console.error('[ZIP DEBUG] Missing attachment signed URL', {
          caseId: caseData?._id,
          attachmentKey: selectedAttachmentType,
          urlUsed: resolvedAttachmentUrl,
        })
      }

      const extensionFromContentType = (contentType = '') => {
        const normalized = String(contentType).toLowerCase()
        if (normalized.includes('application/pdf')) return '.pdf'
        if (
          normalized.includes(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          )
        )
          return '.xlsx'
        if (normalized.includes('application/vnd.ms-excel')) return '.xls'
        if (
          normalized.includes(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          )
        )
          return '.docx'
        if (normalized.includes('application/msword')) return '.doc'
        if (normalized.includes('image/jpeg')) return '.jpg'
        if (normalized.includes('image/png')) return '.png'
        if (normalized.includes('image/webp')) return '.webp'
        if (normalized.includes('image/gif')) return '.gif'
        return ''
      }
      const getNameFromUrl = (url = '') => {
        try {
          const cleanUrl = String(url || '').split('?')[0]
          return cleanUrl.split('/').pop() || 'file'
        } catch {
          return 'file'
        }
      }
      const replaceExtension = (name, nextExt) => {
        const base = String(name || 'file').replace(/\.[a-z0-9]{2,6}$/i, '')
        return `${base}${nextExt || ''}`
      }
      const isFileLikeContentType = (contentType = '') => {
        const normalized = String(contentType).toLowerCase()
        if (!normalized) return false
        if (normalized.includes('application/json') || normalized.includes('text/html')) return false
        return (
          normalized.includes('application/pdf') ||
          normalized.includes('image/') ||
          normalized.includes('application/octet-stream') ||
          normalized.includes('application/vnd.openxmlformats-officedocument') ||
          normalized.includes('application/vnd.ms-excel') ||
          normalized.includes('application/msword') ||
          normalized.includes('application/zip')
        )
      }
      const toByteSize = (value) => {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : 0
      }

      const zip = new JSZip()
      const filesToZip = [
        {
          label: 'Generated report',
          url: fileUrl,
          fallbackName: 'report',
          attachmentKey: 'generated_report',
          required: true,
        },
      ]

      if (resolvedAttachmentUrl) {
        filesToZip.unshift({
          label: 'Attachment',
          url: resolvedAttachmentUrl,
          fallbackName: `${selectedAttachmentType || 'attachment'}_file`,
          attachmentKey: selectedAttachmentType,
          required: false,
        })
      }

      for (const fileItem of filesToZip) {
        const response = await fetch(fileItem.url)
        const contentType = response.headers.get('content-type') || ''
        const contentLength = response.headers.get('content-length')
        const debugData = {
          caseId: caseData?._id,
          selectedAttachmentType,
          label: fileItem.label,
          resolvedUrl: fileItem.url,
          httpStatus: response.status,
          contentType,
          responseSize: toByteSize(contentLength),
        }

        if (response.status !== 200 || !isFileLikeContentType(contentType)) {
          console.error('[ZIP DEBUG] Invalid file response', {
            caseId: caseData?._id,
            attachmentKey: fileItem?.attachmentKey || selectedAttachmentType,
            urlUsed: fileItem.url,
            status: response.status,
            contentType,
          })
          if (fileItem.required) {
            dispatch({
              type: 'set',
              validations: ['Attachment unavailable or unauthorized.'],
            })
            setIsLoadingSpinner(false)
            return
          }
          dispatch({
            type: 'set',
            validations: ['Attachment unavailable or unauthorized.'],
          })
          continue
        }

        const blob = await response.blob()
        debugData.responseSize = blob?.size || debugData.responseSize
        const ext = extensionFromContentType(contentType)
        const nameFromUrl = getNameFromUrl(fileItem.url)
        let fileName = nameFromUrl && nameFromUrl !== 'file' ? nameFromUrl : fileItem.fallbackName
        if (ext) {
          fileName = replaceExtension(fileName, ext)
        }
        zip.file(fileName, blob)
      }

      zip
        .generateAsync({ type: 'blob' })
        .then((content) => {
          const safeZipName = `${String(zipName)
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
            .trim() || 'final-report'}.zip`
          saveAs(content, safeZipName)
          setIsLoadingSpinner(false)
        })
        .catch((error) => {
          console.error('Error creating ZIP file:', error)
          console.error('[ZIP DEBUG] ZIP generation failed', {
            caseId: caseData?._id,
            selectedAttachmentType,
          })
          dispatch({
            type: 'set',
            validations: ['Attachment unavailable or unauthorized. Please refresh and try again.'],
          })
          setIsLoadingSpinner(false)
        })
    }
  } catch (error) {
    console.error('Error fetching files:', error)
    console.error('[ZIP DEBUG] Outer ZIP flow failed', {
      caseId: data?._id,
      errorMessage: error?.message,
    })
    dispatch({
      type: 'set',
      validations: ['Attachment unavailable or unauthorized. Please refresh and try again.'],
    })
    setIsLoadingSpinner(false)
  } finally {
    setIsLoadingSpinner(false)
  }
}

export const downloadExcelCsvReport = async (data) => {
  const keysInExcel = [
    'date_initiation_bank',
    'date_initiation_RA',
    'finance_name_perent',
    'finance_name',
    'applicant_name',
    'los_number',
    'contact_number_1',
    'contact_number_2',
    'contact_number_3',
    'address',
    'location',
    'case_of_branch',
    'case_type',
    'ra_branch',
    'product_name',
    'product_type',
    'latitude',
    'longitude',
    'engineers',
    'group',
    "remark"
  ]
  // Helper function to format the date
  const formatDate = (timestamp) => {
    if (timestamp) {
      const date = new Date(timestamp);
      return date.toISOString().split('T')[0]; // Returns only the date in YYYY-MM-DD format
    }
    return 'NA'; // If no date is available, return 'NA'
  }

  // Function to handle empty or undefined values
  const handleEmptyValue = (value) => {
    return value ? value : 'NA'; // Replace empty or undefined with 'NA'
  }

  const filteredData = {}

  // keysInExcel.forEach((key) => {
  //   if (data[key] !== undefined) {
  //     filteredData[key] = data[key]?.name || data[key] || ''
  //   }
  // })
  keysInExcel.forEach((key) => {
    if (data[key] !== undefined) {
      // Format date columns
      if (key.includes('date')) {
        filteredData[key] = formatDate(data[key]);
      } else {
        filteredData[key] = handleEmptyValue(data[key]?.name || data[key]);
      }
    } else {
      // If the key doesn't exist in data, return 'NA'
      filteredData[key] = 'NA';
    }
  })

  const excelData = [filteredData]

  const ws = XLSX.utils.json_to_sheet(excelData)
  const columnWidths = [
    { wpx: 150 }, // Adjust width for each column
    { wpx: 150 },
    { wpx: 200 },
    { wpx: 200 },
    { wpx: 200 },
    { wpx: 150 },
    { wpx: 150 },
    { wpx: 150 },
    { wpx: 200 },
    { wpx: 200 },
    { wpx: 200 },
    { wpx: 200 },
    { wpx: 150 },
    { wpx: 150 },
    { wpx: 150 },
    { wpx: 150 },
    { wpx: 150 }
  ]


  ws['!cols'] = columnWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

  const file = new Blob([excelBuffer], { type: 'application/octet-stream' })

  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(file, `${filteredData?.applicant_name || 'applicant'}.xlsx`)
  } else {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(file)
    link.download = `${filteredData?.applicant_name || 'applicant'}.xlsx`
    link.click()
  }


}
export const FEFormatePDfCreate = async (showCaseData) => {

  // console.log('finance anme', showCaseData?.finance_name?.name);
  Font.register({
    family: 'Roboto',
    src: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap',
  })

  const styles = StyleSheet.create({
    page: {
      padding: 20,
      fontSize: 12,
    },
    section: {
      marginBottom: 10,
    },
    header: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#000000',
    },
    content: {
      fontSize: 11,
      marginBottom: 5,
    },
    table: {
      display: 'table',
      width: 'auto',
      borderStyle: 'solid',
      borderWidth: 1,
      marginVertical: 10,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
    },
    tableHeader: {
      backgroundColor: '#f0f0f0',
      fontWeight: 'bold',
    },
    tableCell: {
      padding: 5,
      borderRightWidth: 1,
      flex: 1,
    },
    label: {
      color: '#73B43C',
      fontSize: 11,
      marginBottom: 2,
    },
    value: {
      fontSize: 11,
      marginBottom: 2,
    },
  })

  // const stripHtml = (html) => html.replace(/<[^>]*>?/gm, '') || "-";

  const stripHtml = (html) => {
    if (typeof html === 'string') {
      return html.replace(/<[^>]*>?/gm, '') || "-";
    }
    return "-";
  };

  const DataRow = ({ label, value }) => (
    <View style={{ marginBottom: 5, flexDirection: 'row', alignItems: 'center' }}>
      <Text style={styles.label}>{label} : </Text>
      <Text style={styles.value}>{value || ' - '}</Text>
    </View>
  )



  return (
    <Document>
      <Page style={styles.page}>
        <Text
          style={{
            backgroundColor: '#a30303', // Background color for the header
            color: '#fff', // Text color
            fontSize: 16, // Font size
            fontWeight: 'bold', // Bold font
            textAlign: 'center', // Center-align text
            padding: 10, // Add some padding for better appearance
            marginBottom: 20, // Margin at the bottom of the header
            width: '100%', // Full width
          }}
        >
          FE Format Document
        </Text>
        <Text style={{ ...styles.header, fontSize: 16, textAlign: 'center', marginBottom: 15 }}>
          Personal Information
        </Text>

        {/* First Section - Basic Information */}
        <View style={styles.section}>
          <Text style={styles.subHeader}>Basic Information</Text>
          <DataRow label="Applicant Name" value={showCaseData?.applicant_name} />

          <DataRow label="Applicant Mobile Number" value={showCaseData?.contact_number_1} />
          <DataRow label="Person Meet At Site Name" value={showCaseData?.person_meet_at_site_name} />
          <DataRow label="Person Meet At Site Mobile Number" value={showCaseData?.person_meet_at_site_mobile} />
          <DataRow label="Finance Name" value={showCaseData?.finance_name?.name} />
          {/* <DataRow label="Created Date" value={showCaseData?.created_at} /> */}
          <DataRow label="Created Date" value={moment(showCaseData?.created_at).format('DD MMM YYYY')} />


        </View>

        {/* Second Section - Additional Details */}
        <View style={styles.section}>
          {/* <Text style={styles.subHeader}>Additional Details</Text> */}
          <DataRow label="Person Meet At Site Relation" value={showCaseData?.person_meet_at_site_relation} />
          <DataRow label="Type Of Property" value={showCaseData?.type_of_property} />
          <DataRow label="Current use of property" value={showCaseData?.current_use_property} />
          <DataRow label="Local Address Verification" value={showCaseData?.address_verification} />
          {/* <DataRow label="Applicant Contact Number 2" value={showCaseData?.contact_number_2} /> */}
          <DataRow label="House Name/Building Name" value={showCaseData?.house_builing_name} />
          <DataRow label="Wing or Block Name" value={showCaseData?.wing_block_name} />
          <DataRow label="Street Name" value={showCaseData?.street_name} />
        </View>

        {/* Occupancy Section */}

        {/* Address Section */}
        <View style={styles.section}>
          {/* <Text style={styles.subHeader}>Address Information</Text> */}
          <DataRow label="House./Plot Number" value={showCaseData?.house_plot_no} />
          <DataRow label="Village/Colony" value={showCaseData?.village_colony} />
          <DataRow label="Ward Number" value={showCaseData?.ward_no} />
          <DataRow label="City" value={showCaseData?.city} />
          <DataRow label="Tehsil" value={showCaseData?.teh} />
          <DataRow label="District" value={showCaseData?.dist} />
          <DataRow label="State" value={showCaseData?.state} />
          <DataRow label="Pin" value={showCaseData?.pin} />
          <DataRow label="Landmark" value={showCaseData?.landmark} />
          {/* <DataRow label="Address" value={showCaseData?.address} /> */}
        </View>


        <View style={styles.section}>
          <Text style={styles.subHeader}>Occupancy Details</Text>
          <DataRow label="Occupant" value={showCaseData?.occupant} />

          {/* Conditional Occupied Section */}
          {showCaseData?.occupant === 'Occupied' && (
            <>
              <DataRow label="Self Occupied" value={showCaseData?.self_occupied} />
              <DataRow label="Tenure" value={showCaseData?.tenure} />
            </>
          )}

          {/* Conditional Vacant Section */}
          {showCaseData?.occupant === 'Vacant' && (
            <DataRow label="Property Vacant From Last Month" value={showCaseData?.self_occupied} />
          )}
        </View>


        {/* Conditional Tenant Section */}
        {showCaseData?.occupant === 'tenant' && showCaseData?.tenant_details?.length > 0 && (
          <View style={styles.section}>
            {/* <Text style={styles.subHeader}>Tenant Details</Text> */}
            {showCaseData.tenant_details.map((item, index) => (
              <View key={index} style={styles.section}>
                <DataRow label="Tenant Name" value={item.tenant_name} />
                <DataRow label="Relation" value={item.tenant_relation} />
                <DataRow
                  label="Tenant Date"
                  value={moment(item.tenant_date).format('DD MMM YYYY')}
                />
                <DataRow label="Exp/Rent" value={item.exp_rent} />
              </View>
            ))}
          </View>
        )}

        {/* Conditional Vacant Plot/Land Section */}
        {showCaseData?.location_type === 'vacant plot/land' && (
          <View style={styles.section}>
            <Text style={styles.subHeader}>Vacant Plot/Land Details</Text>
            <DataRow label="Construction Stage" value={showCaseData?.construction_stage} />
            <DataRow
              label="Dimensions"
              value={`${showCaseData?.dimension?.length ?? '-'} x ${showCaseData?.dimension?.width ?? '-'}`}
            />
            <DataRow label="Land Area" value={showCaseData?.land_area} />
            <DataRow label="Remark" value={showCaseData?.floors_and_dimentions_remarks} />

            {showCaseData?.is_under_renovation === '1' && (
              <>
                <DataRow label="Under Renovation" value="Yes" />
                <DataRow
                  label="Construction At Site"
                  value={showCaseData?.construction_at_site?.map(item => item.name).join(', ')}
                />
              </>
            )}
          </View>
        )}


        {/* 
        ////////////////////////////////////////////////////////////////////////// */}
        <Text style={{ ...styles.header, fontSize: 16, textAlign: 'center', marginBottom: 15 }}>
          4 Boundries Information
        </Text>

        {/* Display General Information */}
        {/* <DataRow label="Property Hold Type" value={showCaseData?.type_of_property} /> */}
        <DataRow label="Proximity" value={showCaseData?.proximity} />
        <DataRow label="East" value={showCaseData?.east} />
        <DataRow label="West" value={showCaseData?.west} />
        <DataRow label="North" value={showCaseData?.north} />
        <DataRow label="South" value={showCaseData?.south} />
        <DataRow label="If Not Matching Reason" value={showCaseData?.not_match_reason} />

        {/* {showCaseData?.occupant === 'Occupied' && (
            <>
              <DataRow label="Occupant" value={showCaseData?.occupant} />
              <DataRow label="Self Occupied" value={showCaseData?.self_occupied} />
              <DataRow label="Tenure" value={showCaseData?.tenure} />
            </>
          )}

          {showCaseData?.occupant === 'Vacant' && (
            <DataRow label="Property Vacant From Last Month" value={showCaseData?.self_occupied} />
          )} 
          {showCaseData?.location_type === 'vacant plot/land' && (
            <View style={styles.section}>
              <DataRow label="Construction Stage" value={showCaseData?.construction_stage} />
              <DataRow label="Dimensions" value={`${showCaseData?.dimension?.length} x ${showCaseData?.dimension?.width}`} />
              <DataRow label="Land Area" value={showCaseData?.land_area} />
              <DataRow label="Remark" value={showCaseData?.floors_and_dimentions_remarks} />
              {showCaseData?.is_under_renovation === '1' && (
                <>
                  <DataRow label="Under Renovation" value="Yes" />
                  <DataRow label="Construction At Site" value={showCaseData?.construction_at_site?.map(item => item.name).join(', ')} />
                </>
              )}
            </View>
          )} */}




        {/* //////////////////////////////////////////////////////////////////// */}

        <Text style={{ ...styles.header, fontSize: 16, textAlign: 'center', marginBottom: 15 }}>
          Floors and Dimensions
        </Text>

        {/* Basic Info */}
        <DataRow label="Type of Property" value={showCaseData?.location_type ?? '-'} />
        <DataRow label="Sub Type Property" value={showCaseData?.sub_location_type ?? '-'} />

        {/* Vacant Plot/Land Section */}
        {showCaseData.location_type === 'vacant plot/land' && (
          <View style={styles.section}>
            <DataRow label="Construction Stage" value={showCaseData.construction_stage} />
            <DataRow
              label="Construction at site"
              value={showCaseData.construction_at_site?.map((item) => item.name).join(', ')}
            />
            <DataRow
              label="Dimensions"
              value={`${showCaseData.dimension?.length || '-'} X ${showCaseData.dimension?.width || '-'
                }`}
            />
            <DataRow label="Land Area" value={showCaseData.land_area} />
            <DataRow label="Remark" value={showCaseData.floors_and_dimentions_remarks} />

            {showCaseData.is_under_renovation === '1' && (
              <>
                <DataRow label="Under Renovation" value="Yes" />
                <DataRow
                  label="Construction At Site"
                  value={showCaseData.construction_at_site?.map((item) => item.name).join(', ')}
                />
              </>
            )}
          </View>
        )}

        {/* Commercial, Residential, Educational, Industrial Section */}
        {['residential', 'commercial', 'eductaional', 'industrial'].includes(
          showCaseData?.location_type,
        ) && (
            <>
              {/* Land & Building Section */}
              {showCaseData?.sub_location_type === 'land and building' && (
                <View style={styles.section}>
                  <DataRow
                    label="Number of Wings Available"
                    value={showCaseData.number_of_wings_available}
                  />
                  <DataRow label="Shape Type" value={showCaseData.shape_type} />
                  <DataRow
                    label="Property Dimensions"
                    value={`${showCaseData.dimension?.length || '-'} X ${showCaseData.dimension?.width || '-'
                      }`}
                  />
                  <DataRow label="Land area (in sqft)" value={showCaseData.land_area} />
                  <DataRow label="Number of Floor" value={showCaseData.no_of_floors == 0 ? 'Ground' : `G+${showCaseData.no_of_floors}` ?? '-'} />
                  <DataRow label="BUA Rate" value={showCaseData.bua_rate} />
                  <DataRow label="Land Rate" value={showCaseData.land_rate} />
                  <DataRow
                    label="Exteriors"
                    value={showCaseData.exteriors?.map((item) => item.name).join(', ')}
                  />
                  {/* <DataRow label="Located On Floor" value={showCaseData.located_on_floor} /> */}
                  <DataRow label="Com/Basement/Other" value={showCaseData.is_basement} />

                  {/* Floor Details Table */}
                  {showCaseData.no_of_floors >= 0 && (
                    <View style={styles.section}>
                      <Text style={styles.header}>Floor Details</Text>
                      <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                          <Text style={styles.tableCell}>Floor Name</Text>
                          <Text style={styles.tableCell}>Built-Up Dimension</Text>
                          <Text style={styles.tableCell}>Land Area (IN Sqft)</Text>
                          <Text style={styles.tableCell}>Interiors</Text>
                          <Text style={styles.tableCell}>Details Of Floor</Text>
                        </View>
                        {showCaseData.floor_wise_details?.map((item, i) => (
                          <View style={styles.tableRow} key={i}>
                            <Text style={styles.tableCell}>{i === 0 ? 'Ground' : `G+${i}`}</Text>
                            <Text style={styles.tableCell}>
                              {item.builtuplength > 0 || item.builtupwidth > 0
                                ? `${item.builtupwidth}X${item.builtuplength}`
                                : ' - '}
                            </Text>
                            <Text style={styles.tableCell}>{item.bua || ' - '}</Text>
                            <Text style={styles.tableCell}>
                              {item?.interiors?.map((interior) => interior.name).join(', ') ||
                                ' - '}
                            </Text>
                            <Text style={styles.tableCell}>{item.noofrooms || ' - '}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Basement Details Table */}
                  {showCaseData.no_of_basement > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.header}>Basement Details</Text>
                      <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                          <Text style={styles.tableCell}>Details Of Basement</Text>
                          <Text style={styles.tableCell}>Built-Up Dimension</Text>
                          <Text style={styles.tableCell}>Land Area (IN Sqft)</Text>
                        </View>
                        {showCaseData.basement_wise_details?.map((item, i) => (
                          <View style={styles.tableRow} key={i}>
                            <Text style={styles.tableCell}>{item.basementdetails}</Text>
                            <Text style={styles.tableCell}>
                              {`${item.builtupwidth || ' - '} X ${item.builtuplength || ' - '}`}
                            </Text>
                            <Text style={styles.tableCell}>{item.bua || ' - '}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {showCaseData.is_stilt > 0 && (
                    <DataRow label="Stilt" value={showCaseData.stilt} />
                  )}

                  {showCaseData.is_mezzanine > 0 && (
                    <DataRow label="Mezzanine" value={showCaseData.mezzanine} />
                  )}

                  {showCaseData.is_property_under_construction === '1' && (
                    <>
                      <DataRow label="Under Construction At Site" value="Yes" />
                      <DataRow
                        label="Under Construction At Site"
                        value={showCaseData.under_construction_at_site
                          ?.map((item) => item.name)
                          .join(', ')}
                      />
                    </>
                  )}

                  <DataRow label="Carpet Area (in sqft)" value={showCaseData.carpet_rate} />
                  <DataRow label="Lift" value={showCaseData.lift} />
                  {showCaseData.lift === 'yes' && (
                    <DataRow label="No of Lift" value={showCaseData.no_of_lifts} />
                  )}
                  <DataRow label="Remark" value={showCaseData.floors_and_dimentions_remarks} />
                </View>
              )}

              {/* Flat/Multistory Building Section */}
              {showCaseData?.sub_location_type === 'flat/multistory building' && (
                <View style={styles.section}>
                  <DataRow label="Name of wing" value={showCaseData.name_of_wing} />
                  <DataRow
                    label="No. Of Wing/Building"
                    value={showCaseData.no_of_wing_or_building}
                  />
                  <DataRow
                    label="Unit/ Flat Situated On Wing"
                    value={showCaseData.flat_situated_on_wing}
                  />
                  <DataRow
                    label="No. Of Floors In Wing"
                    value={showCaseData.multistory_no_of_floors
                      ?.map((item) => item.name)
                      .join(', ')}
                  />
                  <DataRow
                    label="Unit/ Flat Situated On Floor"
                    value={showCaseData.located_on_floor?.[0]?.name}
                  />
                  <DataRow
                    label="No. Of Unit/ Flat Are Available On Visited Floor"
                    value={showCaseData.other_flats_on_visited_floor}
                  />
                  <DataRow
                    label="Built-Up Dimension"
                    value={`${showCaseData.builup_with_dimention?.length || '-'} X ${showCaseData.builup_with_dimention?.width || '-'
                      }`}
                  />
                  <DataRow
                    label="Bulid Land Area (IN Sqft)"
                    value={showCaseData.builup_with_dimention?.dimension}
                  />
                  <DataRow
                    label="Super Build Area (IN Sqft)"
                    value={showCaseData.multistory_land_rate}
                  />
                  <DataRow label="Carpet Area (in sqft)" value={showCaseData.carpet_rate} />
                  <DataRow label="Lift" value={showCaseData.lift} />
                  {showCaseData.lift === 'yes' && (
                    <DataRow label="No of Lift" value={showCaseData.no_of_lifts} />
                  )}
                  <DataRow label="Details Of Flat" value={showCaseData.details_of_flat} />
                  <DataRow
                    label="Interiors"
                    value={showCaseData.interior?.map((item) => item.name).join(', ')}
                  />

                  {showCaseData.is_under_renovation === '1' && (
                    <DataRow label="Under Renovation" value="Yes" />
                  )}

                  <DataRow label="No of Basement" value={showCaseData.no_of_basement} />

                  {/* Basement Details Table for Flat/Multistory */}
                  {showCaseData.no_of_basement > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.header}>Basement Details</Text>
                      <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                          <Text style={styles.tableCell}>Details Of Basement</Text>
                          <Text style={styles.tableCell}>Built-Up Dimension</Text>
                          <Text style={styles.tableCell}>Land Area (IN Sqft)</Text>
                        </View>
                        {showCaseData.basement_wise_details?.map((item, i) => (
                          <View style={styles.tableRow} key={i}>
                            <Text style={styles.tableCell}>{item.basementdetails}</Text>
                            <Text style={styles.tableCell}>
                              {`${item.builtupwidth || '-'} X ${item.builtuplength || '-'}`}
                            </Text>
                            <Text style={styles.tableCell}>{item.bua || '-'}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {showCaseData.is_stilt > 0 && (
                    <DataRow label="Stilt" value={showCaseData.stilt} />
                  )}
                  {showCaseData.is_mezzanine > 0 && (
                    <DataRow label="Mezzanine" value={showCaseData.mezzanine} />
                  )}

                  <DataRow label="Loading %" value={showCaseData.loding_in_percentage} />
                  <DataRow
                    label="BUA Rate (Per Sqft)"
                    value={showCaseData.flat_per_sqrt_rate_bua}
                  />
                  <DataRow
                    label="SBUA Rate (Per Sqft)"
                    value={showCaseData.flat_per_sqrt_rate_sbua}
                  />
                  <DataRow
                    label="Unit Rate"
                    value={showCaseData.flat_multistory_building_unit_rate}
                  />
                  <DataRow label="Remark" value={showCaseData.floors_and_dimentions_remarks} />
                </View>
              )}
            </>
          )}

        {/* //////////////////////////////////////////////////////////////////// */}

        <Text style={{ ...styles.header, fontSize: 16, textAlign: 'center', marginBottom: 15 }}>
          Development and Scope Information
        </Text>

        {/* Display General Information */}
        <DataRow
          label="Postive Point"
          value={showCaseData?.positive_point?.map((item) => item.name).join(', ') ?? '-'}
        />
        <DataRow
          label="Negative Point"
          value={showCaseData?.negative_point?.map((item) => item.name).join(', ') ?? '-'}
        />
        <DataRow
          label="Additional Amenities Like"
          value={
            showCaseData?.additional_amenities_like?.map((item) => item.name).join(', ') ?? '-'
          }
        />
        <DataRow label="Community Dominated" value={showCaseData?.community_dominated ?? '-'} />

        {showCaseData?.community_dominated === 'yes' && (
          <DataRow
            label="Community Dominated Details"
            value={showCaseData?.community_dominated_details ?? '-'}
          />
        )}

        <DataRow label="Age Of The Property (Years)" value={showCaseData?.age_of_property ?? '-'} />
        <DataRow label="Life Of The Propery (Years)" value={showCaseData?.life_of_property ?? '-'} />
        <DataRow label="Development Of Area" value={showCaseData?.development_of_area ?? '-'} />
        <DataRow label="Habitation" value={showCaseData?.habitation ?? '-'} />
        <DataRow label="If Property Mortgaged" value={showCaseData?.property_mortaged ?? '-'} />

        {showCaseData?.property_mortaged === 'yes' && (
          <>
            <DataRow
              label="Property Mortgaged Month/Year"
              value={moment(showCaseData?.mortaged_month_year).format('MMM YYYY') ?? '-'}
            />
            <DataRow label="Mortgaged Bank" value={showCaseData?.mortaged_bank_name ?? '-'} />
          </>
        )}

        {/* //////////////////////////////////////////////////////////////////// */}
        <Text style={{ ...styles.header, fontSize: 16, textAlign: 'center', marginBottom: 15 }}>
          Distance From
        </Text>

        <DataRow label="Road Type" value={showCaseData?.road_type} />

        {/* Wall to Wall Road Width */}
        <DataRow label="Wall To Wall Road Width" value={showCaseData?.wall_to_wall_road_width} />

        {/* Road Center To Wall Width */}
        <DataRow
          label="Road Center To Wall Width"
          value={showCaseData?.road_center_to_wall_width}
        />

        {/* Highway Name & No. and Dist */}
        <DataRow
          label="Highway Name & No. And Dist."
          value={showCaseData?.highway_name_and_no_dist}
        />

        {/* City Center KM */}
        <DataRow label="City Center KM" value={showCaseData?.city_centre_km} />

        {/* Hospital KM */}
        <DataRow label="Hospital KM" value={showCaseData?.hospital_km} />

        {/* Railway Station KM */}
        <DataRow label="Railway Station KM" value={showCaseData?.railway_station_km} />

        {/* Bus Stand KM */}
        <DataRow label="Bus Stand KM" value={showCaseData?.bus_stand_km} />

        {/* Any Government Office */}
        <DataRow label="Any Govt. Office" value={showCaseData?.any_govt_office} />

        {/* Other */}
        <DataRow label="Other" value={showCaseData?.other} />

        {/* //////////////////////////////////////////////////////////////////// */}
        <Text style={{ ...styles.header, fontSize: 16, textAlign: 'center', marginBottom: 15 }}>
          {/*  */}
          Rate and Lat-Long Information
        </Text>

        <DataRow label="Verified Market Rate (In Sqft)" value={showCaseData?.market_rate} />
        <DataRow label="Whole Rented Amount" value={showCaseData?.rental_rate} />
        <DataRow label="Person Name Verified Through" value={showCaseData?.verified_thru_name} />
        <DataRow
          label="Latitude, Longitude"
          value={`${showCaseData?.latitude_by_fe ?? ' - '}, ${showCaseData?.longitude_by_fe ?? ' - '
            }`}
        />

        <DataRow label="Contact Verified Through" value={showCaseData?.verified_thru_contact} />
        <DataRow label="Remark" value={showCaseData?.rate_and_lat_long_remarks} />

        <View style={{ marginBottom: 5, flexDirection: 'row' }}>
          <Text style={styles.label}>Required Photo Check:</Text>
          <Text style={styles.value}>
            {showCaseData?.required_photos_check.selfie && 'Selfie, '}
            {showCaseData?.required_photos_check.e_bill && 'E-Bill, '}
            {showCaseData?.required_photos_check.map && 'Map, '}
            {showCaseData?.required_photos_check.applicant_selfie && 'Applicant Selfie, '}
            {showCaseData?.required_photos_check.property_selfie && 'Property Selfie, '}
            {showCaseData?.required_photos_check.drow && 'Drow, '}
            {Object.values(showCaseData?.required_photos_check || {}).every((val) => !val) && '-'}
          </Text>
        </View>

        <Text style={{ ...styles.header, fontSize: 16, textAlign: 'center', marginBottom: 15 }}>
          Re-Visit/Case Details
        </Text>

        {/* FE Note Content */}
        <View style={styles.content}>
          {/* <Text style={styles.label}>Re-Visit/Case Details:</Text>
          <Text>{showCaseData?.visit_region_fe ?? ' - '}</Text> */}

          <DataRow label="RemarkRe-Visit/Case Details" value={showCaseData?.visit_region_fe} />

        </View>


        <Text style={{ ...styles.header, fontSize: 16, textAlign: 'center', marginBottom: 15 }}>
          FE Note
        </Text>

        <View style={styles.content}>
          <DataRow
            label="Note"
            value={stripHtml(showCaseData.fe_note)}
          />
        </View>
      </Page>
    </Document>
  )

}

