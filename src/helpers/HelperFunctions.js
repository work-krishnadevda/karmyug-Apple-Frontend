import BasicProvider from 'src/constants/BasicProvider'

class HelperFunction {
  static async getData(endpoint, page, perPage) {
    try {
      const url = `${endpoint}?page=${page}&count=${perPage}`

      const data = await new BasicProvider(url).getRequest()
      return data
    } catch (error) {
      console.log(error)
    }
  }

  static async trashData(endpoint, data) {
    try {
      // console.log(endpoint)
      const url = `${endpoint}/multi/trash`
      return await new BasicProvider(url).patchRequest({ ids: data })
    } catch (error) {
      console.error(error)
    }
  }

  static async postData(endpoint, data) {
    try {
      const url = `${endpoint}`
      console.log('-=---=-=-==-=-url', url)

      return await new BasicProvider(url).postRequest({ ids: data })
    } catch (error) {
      console.error(error)
    }
  }

  static async patchData(endpoint, data) {
    try {
      const url = `${endpoint}`

      return await new BasicProvider(url).patchRequest({ id: data })
    } catch (error) {
      console.error(error)
    }
  }

  static async deleteData(endpoint, data) {
    try {
      // console.log(endpoint)
      const url = `${endpoint}/multi/delete`
      const response = await new BasicProvider(url).deleteRequest({ ids: data })
      return response
    } catch (error) {
      console.error(error)
    }
  }

  static convertToQueryString = (data) => {
    const queryParams = Object.keys(data)
      .filter((key) => data[key] !== '') // Exclude empty values
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join('&')

    return queryParams
  }

  static isJSON(value) {
    if (value instanceof File) {
      // console.log(value)
      return false
    }
    if (value instanceof Date) {
      return false
    }
    if (typeof value === 'object') {
      return true
    }

    if (typeof value === 'number' || !isNaN(Number(value))) {
      return false
    }
    if (typeof value === 'string') {
      return false
    }

    try {
      const parsedValue = JSON.parse(value)
      return typeof parsedValue === 'object' && parsedValue !== null
    } catch (error) {
      console.log(error.response)
      return false
    }
  }
  //****================= create slug for any title,name,heading ===================****//
  static createSlug(title) {
    const slug = title
      .toLowerCase() // Convert the title to lowercase
      .replace(/\s+/g, '-') // Replace whitespace characters with hyphens
      .replace(/[^\w\-]+/g, '') // Remove any non-word characters except hyphens
      .replace(/\-\-+/g, '-') // Replace multiple consecutive hyphens with a single hyphen
      .replace(/^-+|-+$/g, '') // Remove any leading or trailing hyphens

    return slug
  }
}

export default HelperFunction
