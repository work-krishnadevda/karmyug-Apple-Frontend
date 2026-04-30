import BasicProvider from 'src/constants/BasicProvider'

export const fetchCategories = async ({ type, categoryId }) => {
  try {
    // console.log("type", type)
    const response = await new BasicProvider(`cms/categories/get-childrentree/${type}`).getRequest()
    const dataArrays = Object.values(response.data)
    // console.log(dataArrays)
    const modifiedCategoryData = {}

    Object.keys(response.data).forEach((key, index) => {
      modifiedCategoryData[key] = mapDataForDropdown(dataArrays[index], categoryId)
    })

    return modifiedCategoryData
  } catch (error) {
    console.error(error)
  }
}

export function mapDataForDropdown(data, selectedCategoryIds = []) {
  if (!data || data.length === 0) {
    return [] // Return an empty array when data is empty
  }
  // console.log(selectedCategoryIds)
  return data.map((item) => {
    const isChecked = selectedCategoryIds.includes(item._id) // Check if category is selected

    // Recursive call to handle children
    const children = mapDataForDropdown(item.children, selectedCategoryIds, isChecked || isChecked)

    const isExpanded = isChecked || children.some((child) => child.expanded)

    return {
      text: item.name,
      value: item._id,
      type: item.type,
      state: {
        selected: isChecked, // Node 1 will be checked initially
        opened: isExpanded,
      },
      children: children,
      class: 'blog',
    }
  })
}

// export const extractNamesFromTree = (tree) =>
//   tree.reduce((names, { value, text, children }) => {
//     names.push([value, text])
//     if (children && children.length > 0) {
//       const childNames = extractNamesFromTree(children)
//       names.push(...childNames)
//     }
//     return names
//   }, [])


export const extractNamesFromTree = (tree, depth = 0) =>
  tree.reduce((names, { value, text, children }) => {
    const currentText = '-'.repeat(depth) + ' ' + text;
    names.push([value, currentText]);

    if (children && children.length > 0) {
      const childNames = extractNamesFromTree(children, depth + 1);
      names.push(...childNames);
    }

    return names;
  }, []);

