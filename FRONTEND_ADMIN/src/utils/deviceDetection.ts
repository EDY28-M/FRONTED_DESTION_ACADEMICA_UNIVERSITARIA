// Obtener información del dispositivo y navegador
export const getDeviceInfo = () => {
  const ua = navigator.userAgent
  let deviceType = 'Escritorio'
  let browserName = 'Desconocido'
  let osName = 'Desconocido'

  // Detectar tipo de dispositivo
  if (/mobile/i.test(ua)) {
    deviceType = 'Móvil'
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = 'Tablet'
  }

  // Detectar navegador
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browserName = 'Chrome'
  } else if (ua.includes('Firefox')) {
    browserName = 'Firefox'
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browserName = 'Safari'
  } else if (ua.includes('Edg')) {
    browserName = 'Edge'
  } else if (ua.includes('Opera') || ua.includes('OPR')) {
    browserName = 'Opera'
  }

  // Detectar sistema operativo
  if (ua.includes('Windows')) {
    osName = 'Windows'
  } else if (ua.includes('Mac')) {
    osName = 'macOS'
  } else if (ua.includes('Linux')) {
    osName = 'Linux'
  } else if (ua.includes('Android')) {
    osName = 'Android'
  } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
    osName = 'iOS'
  }

  return {
    deviceType,
    browser: browserName,
    os: osName,
    userAgent: ua,
    fingerprint: generateFingerprint()
  }
}

// Generar una huella digital única del dispositivo
const generateFingerprint = () => {
  const ua = navigator.userAgent
  const screen = `${window.screen.width}x${window.screen.height}`
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const language = navigator.language
  
  const fingerprint = `${ua}-${screen}-${timezone}-${language}`
  return btoa(fingerprint).substring(0, 32)
}

// Obtener ubicación aproximada (solo país/ciudad si está disponible)
export const getLocationInfo = async (): Promise<string> => {
  try {
    // Usar API gratuita de geolocalización por IP
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()
    
    if (data.city && data.country_name) {
      return `${data.city}, ${data.country_name}`
    } else if (data.country_name) {
      return data.country_name
    }
    return 'Ubicación desconocida'
  } catch (error) {
    console.error('Error obteniendo ubicación:', error)
    return 'Ubicación desconocida'
  }
}

// Comparar si es un dispositivo nuevo
export const isNewDevice = (currentFingerprint: string): boolean => {
  const knownDevices = JSON.parse(localStorage.getItem('known_devices') || '[]')
  return !knownDevices.includes(currentFingerprint)
}

// Registrar dispositivo conocido
export const registerDevice = (fingerprint: string) => {
  const knownDevices = JSON.parse(localStorage.getItem('known_devices') || '[]')
  if (!knownDevices.includes(fingerprint)) {
    knownDevices.push(fingerprint)
    localStorage.setItem('known_devices', JSON.stringify(knownDevices))
  }
}

// Comparar si es una nueva ubicación
export const isNewLocation = (currentLocation: string): boolean => {
  const lastLocation = localStorage.getItem('last_login_location')
  return lastLocation !== currentLocation
}

// Registrar ubicación de inicio de sesión
export const registerLocation = (location: string) => {
  localStorage.setItem('last_login_location', location)
}
