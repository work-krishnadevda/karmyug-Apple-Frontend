import { useEffect, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

export const useLocation = (apiKey) => {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLocation = async () => {
      if (!('geolocation' in navigator)) {
        setError('Geolocation is not supported by your browser.')
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
            // console.log("position",position); // Debug log - removed for production
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Default address: Ratlam  Madhya Pradesh India', // temporary address
          }
               setLocation(coords) // after billing the api will work fine comment this line and uncomment below code
          //  console.log("coords",coords);
          //   const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${apiKey}`;
          //     const res = await fetch(url);
          //       const re= await res.json()
          //     if (res.data.results.length > 0) {
          //       return res.data.results[0].formatted_address;
          //     }
          try {
            // Load Google Maps JS API
            const loader = new Loader({
              apiKey: apiKey,
              libraries: ['places'],
            })
            await loader.load()

            const geocoder = new window.google.maps.Geocoder()
            const response = await geocoder.geocode({
              location: {
                lat: coords.latitude,
                lng: coords.longitude,
              },
            })
            if (response.results && response.results.length > 0) {
              coords.address = response.results[0].formatted_address
            } else {
              coords.address = 'Unknown location'
            }

            setLocation(coords)
          } catch (err) {
            console.error('Error fetching address:', err)
            setError('Failed to get address.')
          }
        },
        (err) => {
          setError('Location permission denied. Please enable location.')
        },
      )
    }

    fetchLocation()
  }, [apiKey])

  return { location, error }
}
