const { default: HelperFunction } = require('./HelperFunctions')
const { validateInput } = require('./validationHelper')

export default async function handleSubmitHelper(initialValues, validationRules, dispatch) {
  var formData = new FormData()
  Object.keys(initialValues).forEach((key) => {
    if (
      key !== 'featured' &&
      key !== 'gallery' &&
      key !== 'variant_images' &&
      key !== 'featured_image' &&
      key !== 'dm_attechment' &&
      key !== 'rc_attechment' &&
      key !== 'lcto_attechment' &&
      key !== 'cto_attechment'
    ) {
      if (initialValues[key]) {
        formData.append(
          key,
          HelperFunction.isJSON(initialValues[key])
            ? JSON.stringify(initialValues[key])
            : initialValues[key],
        )
      }
    }

    // if (
    //   key == 'featured_image' &&
    //   initialValues['featured_image'] !== '' &&
    //   initialValues['featured_image'] !== null
    // ) {
    //   formData.append(`featured_image`, initialValues['featured_image'])
    // }

    if (key === 'featured_image' && initialValues['featured_image']) {
      if (initialValues['featured_image'] instanceof File) {
        formData.append('featured_image', initialValues['featured_image']);
      } else if (typeof initialValues['featured_image'] === 'object') {
        formData.append('featured_image', JSON.stringify(initialValues['featured_image']));
      } else {
        formData.append('featured_image', initialValues['featured_image']);
      }
    }

    if (
      key == 'dm_attechment' &&
      initialValues['dm_attechment'] !== '' &&
      initialValues['dm_attechment'] !== null
    ) {
      formData.append(`dm_attechment`, initialValues['dm_attechment'])
    }
    if (
      key == 'rc_attechment' &&
      initialValues['rc_attechment'] !== '' &&
      initialValues['rc_attechment'] !== null
    ) {
      formData.append(`rc_attechment`, initialValues['rc_attechment'])
    }
    if (
      key == 'lcto_attechment' &&
      initialValues['lcto_attechment'] !== '' &&
      initialValues['lcto_attechment'] !== null
    ) {
      formData.append(`lcto_attechment`, initialValues['lcto_attechment'])
    }
    if (
      key == 'cto_attechment' &&
      initialValues['cto_attechment'] !== '' &&
      initialValues['cto_attechment'] !== null
    ) {
      formData.append(`cto_attechment`, initialValues['cto_attechment'])
    }

    if (key == 'featured') {
      formData.append(`featured`, initialValues.featured)
    }
    if (!initialValues.dm_remarks && key == 'dm_remarks') {
      formData.append(`dm_remarks`, initialValues.dm_remarks)
    }
    if (initialValues.password == '' && key == 'password') {
      formData.append(`password`, initialValues.password)
    }
  })



  var validations = validateInput(initialValues, validationRules)
  if (validations.length > 0) {
    dispatch({ type: 'set', validations: validations })
    return false
  }
  dispatch({ type: 'set', validations: [] })
  return formData

}



// const { default: HelperFunction } = require('./HelperFunctions');
// const { validateInput } = require('./validationHelper');

// export default async function handleSubmitHelper(initialValues, validationRules, dispatch) {
//   const formData = new FormData();

//   // Define sets for exclusions and file keys
//   const EXCLUDED_KEYS = new Set(['featured', 'gallery', 'variant_images', 'featured_image', 'isTaxable']);
//   const FILE_KEYS = new Set(['featured_image', 'dm_attechment', 'rc_attechment', 'lcto_attechment', 'cto_attechment']);

//   // Process initialValues
//   Object.keys(initialValues).forEach((key) => {
//     if (EXCLUDED_KEYS.has(key)) {
//       // Handle specific keys with custom logic
//       if (key === 'gallery' && initialValues[key].length > 0) {
//         initialValues[key].forEach(file => formData.append('gallery', file));
//       } else if (key === 'variant_images' && initialValues[key].length > 0) {
//         initialValues[key].forEach(file => formData.append('variant_images', file));
//       } else if (key === 'isTaxable') {
//         formData.append('isTaxable', initialValues[key]);
//       } else if (key === 'featured') {
//         formData.append('featured', initialValues[key]);
//       } else if (!initialValues.dm_remarks && key === 'dm_remarks') {
//         formData.append('dm_remarks', initialValues[key]);
//       } else if (initialValues.password === '' && key === 'password') {
//         formData.append('password', initialValues[key]);
//       }
//     } else if (FILE_KEYS.has(key)) {
//       if (initialValues[key] !== '' && initialValues[key] !== null) {
//         formData.append(key, initialValues[key]);
//       }
//     } else {
//       if (initialValues[key]) {
//         formData.append(
//           key,
//           HelperFunction.isJSON(initialValues[key])
//             ? JSON.stringify(initialValues[key])
//             : initialValues[key]
//         );
//       }
//     }
//   });

//   // Perform validations
//   const validations = validateInput(initialValues, validationRules);
//   if (validations.length > 0) {
//     dispatch({ type: 'set', validations });
//     return false;
//   }
//   dispatch({ type: 'set', validations: [] });

//   return formData;
// }

