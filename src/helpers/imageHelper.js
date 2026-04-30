export const ImageHelper = (e, previewId) => {
  const files = e.target.files

  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const reader = new FileReader()

      reader.onloadend = () => {
        // Create a new image element for each file
        const imageElement = document.createElement('img')
        imageElement.src = reader.result
        imageElement.className = 'img_pre'
        imageElement.style.display = 'block' // Add some styling to separate images

        var element = document.getElementById(previewId)
        if (
          element != null &&
          element != undefined &&
          element.hasChildNodes() &&
          files.length == 1
        ) {
          element.innerHTML = ''
        }
        // console.log(previewId)

        // console.log(imageElement);
        // Append each image to the specified preview container
        document.getElementById(previewId)?.appendChild(imageElement)
      }

      reader.readAsDataURL(file)
    }
  }
  return files
}

export const MultiImageHelper = (e, setInitialValues, initialValues) => {
  // console.log(initialValues)
  const files = e.target.files
  const fileArray = []
  if (files && files.length > 5) {
    alert('You can only select 5 gallery images')

    return false
  }
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const reader = new FileReader()

      reader.onloadend = () => {
        fileArray.push(reader.result)
        if (fileArray.length === files.length) {
          setInitialValues((prevValues) => ({
            ...prevValues,
            gallery: [...prevValues.gallery, ...files],
          }))
        }
      }

      reader.readAsDataURL(file)
    }
  }
  return files
}

// export const variantImageHelper = (e, setInitialValues, initialValues, rowIndex) => {
//     const files = e.target.files;
//     const fileArray = [];
  
//     if (files && files.length > 5) {
//       alert('You can only select up to 5 variant images');
//       return false;
//     }
  
//     if (files && files.length > 0) {
//       for (let i = 0; i < files.length; i++) {
//         const file = files[i];
//         const reader = new FileReader();
  
//         reader.onloadend = () => {
//           fileArray.push(reader.result);
  
//           if (fileArray.length === files.length) {
//             setInitialValues((prevValues) => {
//               const updatedImages = [...prevValues.variant_images];
//               updatedImages[rowIndex] = fileArray;
//               return { ...prevValues, variant_images: updatedImages };
//             });
//           }
//         };
  
//         reader.readAsDataURL(file);
//       }
//     }
  
//     return files;
//   };



  export const variantImageHelper = (e) => {
    const files = e.target.files
  
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const reader = new FileReader()
        reader.readAsDataURL(file)
      }
    }
    return files
  }