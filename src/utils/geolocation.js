import { locationActions } from "../store/shopping-cart/locationSlice";

export const fetchLocation = (dispatch) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const errMsg = "Geolocation is not supported by your browser.";
      dispatch(locationActions.fetchFailure(errMsg));
      reject(errMsg);
      return;
    }

    dispatch(locationActions.fetchStart());

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode using OpenStreetMap's Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          const fullAddress = data.display_name || "Unknown location";
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.suburb || addr.state || "Unknown City";

          const result = {
            address: fullAddress,
            city: city,
            coords: { lat: latitude, lng: longitude }
          };

          dispatch(locationActions.fetchSuccess(result));
          resolve(result);
        } catch (error) {
          const errMsg = "Failed to fetch address details. Please enter manually.";
          dispatch(locationActions.fetchFailure(errMsg));
          reject(errMsg);
        }
      },
      (error) => {
        let errMsg = "Unable to retrieve your location.";
        if (error.code === error.PERMISSION_DENIED) {
          errMsg = "Location permission denied. Please allow location access or type address manually.";
        }
        dispatch(locationActions.fetchFailure(errMsg));
        reject(errMsg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};
