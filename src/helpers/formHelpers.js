import BasicProvider from 'src/constants/BasicProvider'

export const useEffectFormData = async (requestUrl, values, isEditMode) => {

    const initialValues = {}
    Object.keys(values).forEach((key) => {

        if (key === 'display_from') {
            initialValues[key] = Date.now()
        } else {
            initialValues[key] = values[key] ? values[key] : ''
        }
    })

    if (isEditMode) {
        try {
            const response = await new BasicProvider(requestUrl).getRequest()
            const keys = Object.keys(response.data)
            const filteredKeys = keys.filter((key) => key in initialValues)
            filteredKeys.forEach((key) => {
                if (response.data[key] === null || response.data[key] === 'null') {
                    response.data[key] = ''
                }
                if (key === 'display_from') {
                    response.data[key] = new Date(response.data[key])
                }
                if (key === 'categories' && response.data[key] !== null && response.data[key].length > 0) {
                    response.data[key] = response.data[key].map((category) => category._id)
                }
                if (key === 'tag_id' && response.data[key] !== null && response.data[key].length > 0) {
                    response.data[key] = response.data[key].map((tag) => tag._id)
                }

                initialValues[key] = response.data[key]
            })
        } catch (error) {
            throw error
        }
    }

    return initialValues
}
