/**
 * Extract coordinates from Google Maps URLs
 * Supports various Google Maps URL formats
 */

export const extractCoordinatesFromUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    // Pattern 1: Standard Google Maps URL with @lat,lng
    // e.g., https://www.google.com/maps/@30.0444,31.2357,15z
    const pattern1 = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const match1 = url.match(pattern1);
    if (match1) {
      return {
        lat: parseFloat(match1[1]),
        lng: parseFloat(match1[2])
      };
    }

    // Pattern 2: Google Maps URL with !3d and !4d
    // e.g., https://www.google.com/maps/place/...!3d30.0444!4d31.2357
    const pattern2 = /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/;
    const match2 = url.match(pattern2);
    if (match2) {
      return {
        lat: parseFloat(match2[1]),
        lng: parseFloat(match2[2])
      };
    }

    // Pattern 3: Google Maps URL with ll parameter
    // e.g., https://maps.google.com/?ll=30.0444,31.2357
    const pattern3 = /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const match3 = url.match(pattern3);
    if (match3) {
      return {
        lat: parseFloat(match3[1]),
        lng: parseFloat(match3[2])
      };
    }

    // Pattern 4: Google Maps URL with q parameter (coordinates)
    // e.g., https://maps.google.com/?q=30.0444,31.2357
    const pattern4 = /q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const match4 = url.match(pattern4);
    if (match4) {
      return {
        lat: parseFloat(match4[1]),
        lng: parseFloat(match4[2])
      };
    }

    // Pattern 5: Google Maps short URL (goo.gl or maps.app.goo.gl)
    // These would need to be resolved first, but for now we'll skip
    // Could be implemented with a backend service or API call

    return null;
  } catch (error) {
    console.error('Error extracting coordinates from URL:', error);
    return null;
  }
};

/**
 * Validate coordinates
 */
export const validateCoordinates = (coords) => {
  if (!coords || typeof coords !== 'object') {
    return false;
  }

  const { lat, lng } = coords;
  
  // Check if lat and lng are valid numbers
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return false;
  }

  // Check if coordinates are within valid ranges
  // Latitude: -90 to 90, Longitude: -180 to 180
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return false;
  }

  return true;
};

/**
 * Get default coordinates for Cairo, Egypt
 */
export const getDefaultCoordinates = () => ({
  lat: 30.0444,
  lng: 31.2357
});

/**
 * Format coordinates for display
 */
export const formatCoordinates = (coords) => {
  if (!validateCoordinates(coords)) {
    return 'Invalid coordinates';
  }

  return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
};