// // cookieHelpers.js

// import Cookies from 'js-cookie'

// export const handleSelectedRowChange = async (moduleName) => {
//   const paginationCookie = Cookies.get('rowsPerPage')

//   if (paginationCookie) {
//     const parsedPaginationCookie = JSON.parse(paginationCookie)
//     if (!parsedPaginationCookie.hasOwnProperty(moduleName)) {
//       await setSelectedRowForModule(moduleName, 20)
//     }
//   } else {
//     await setSelectedRowForModule(moduleName, 20)
//   }
//   return await getSelectedRowForModule(moduleName)
// }

// export const setSelectedRowForModule = async (module, rowId) => {
//   const moduleData = getModuleData()
//   moduleData[module] = rowId
//   Cookies.set('rowsPerPage', JSON.stringify(moduleData))
// }

// export const getSelectedRowForModule = async (module) => {
//   const moduleData = getModuleData()
//   return moduleData[module]
// }

// const getModuleData = () => {
//   const selectedRowsCookie = Cookies.get('rowsPerPage')
//   return selectedRowsCookie ? JSON.parse(selectedRowsCookie) : {}
// }

// cookieHelpers.js

import Cookies from 'js-cookie'

export const handleSelectedRowChange = async (moduleName) => {
  const paginationCookie = Cookies.get('rowsPerPage')

  if (paginationCookie) {
    const parsedPaginationCookie = JSON.parse(paginationCookie)
    if (!parsedPaginationCookie.hasOwnProperty(moduleName)) {
      await setSelectedRowForModule(moduleName, 20)
    }
  } else {
    await setSelectedRowForModule(moduleName, 20)
  }
  return await getSelectedRowForModule(moduleName)
}

export const setSelectedRowForModule = async (module, rowId) => {
  const moduleData = getModuleData()
  moduleData[module] = rowId
  Cookies.set('rowsPerPage', JSON.stringify(moduleData))
}

export const getSelectedRowForModule = async (module) => {
  const moduleData = getModuleData()
  return moduleData[module]
}

const getModuleData = () => {
  const selectedRowsCookie = Cookies.get('rowsPerPage')
  return selectedRowsCookie ? JSON.parse(selectedRowsCookie) : {}
}
