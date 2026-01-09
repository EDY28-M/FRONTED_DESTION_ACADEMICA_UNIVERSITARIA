/**
 * Helpers para WebAuthn API
 * Convierte entre Base64Url (API) y ArrayBuffer (WebAuthn)
 */

/**
 * Convierte Base64Url string a ArrayBuffer
 */
export function base64UrlToBuffer(base64Url: string): ArrayBuffer {
  // Convertir Base64Url a Base64 estándar
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  
  // Agregar padding si es necesario
  while (base64.length % 4) {
    base64 += '=';
  }
  
  // Decodificar a binary string
  const binaryString = atob(base64);
  
  // Convertir a ArrayBuffer
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes.buffer;
}

/**
 * Convierte ArrayBuffer a Base64Url string
 */
export function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binaryString = '';
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  
  const base64 = btoa(binaryString);
  // Convertir a Base64Url
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Convierte profundamente un objeto, transformando propiedades específicas de Base64Url a ArrayBuffer
 */
export function convertBase64UrlToArrayBuffer<T>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertBase64UrlToArrayBuffer(item)) as T;
  }
  
  if (typeof obj === 'string') {
    // Si parece Base64Url y es un campo conocido que debe ser ArrayBuffer
    if (obj.length > 20 && /^[A-Za-z0-9_-]+$/.test(obj)) {
      // No convertimos strings arbitrarios, solo los campos específicos
      return obj as T;
    }
    return obj as T;
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        
        // Campos que deben ser convertidos de Base64Url a ArrayBuffer
        if (
          key === 'id' ||
          key === 'credentialId' ||
          key === 'challenge' ||
          key === 'userHandle' ||
          key === 'clientDataJSON' ||
          key === 'authenticatorData' ||
          key === 'signature' ||
          key === 'attestationObject' ||
          key === 'clientData' ||
          key === 'rawId'
        ) {
          if (typeof value === 'string') {
            converted[key] = base64UrlToBuffer(value);
          } else {
            converted[key] = convertBase64UrlToArrayBuffer(value);
          }
        } else {
          converted[key] = convertBase64UrlToArrayBuffer(value);
        }
      }
    }
    
    return converted as T;
  }
  
  return obj;
}

/**
 * Convierte profundamente un objeto, transformando ArrayBuffers a Base64Url
 */
export function convertArrayBufferToBase64Url<T>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (obj instanceof ArrayBuffer || obj instanceof Uint8Array) {
    return bufferToBase64Url(obj instanceof Uint8Array ? obj.buffer : obj) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertArrayBufferToBase64Url(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        
        if (value instanceof ArrayBuffer || value instanceof Uint8Array) {
          converted[key] = bufferToBase64Url(value instanceof Uint8Array ? value.buffer : value);
        } else {
          converted[key] = convertArrayBufferToBase64Url(value);
        }
      }
    }
    
    return converted as T;
  }
  
  return obj;
}

/**
 * Verifica si WebAuthn está soportado en el navegador
 */
export function isWebAuthnSupported(): boolean {
  return typeof window !== 'undefined' &&
         'credentials' in navigator &&
         'create' in navigator.credentials &&
         'get' in navigator.credentials &&
         'PublicKeyCredential' in window;
}

/**
 * Obtiene el mensaje de error amigable
 */
export function getWebAuthnErrorMessage(error: Error): string {
  if (error.name === 'NotSupportedError') {
    return 'Tu navegador no soporta autenticación con passkeys. Por favor, usa un navegador moderno.';
  }
  
  if (error.name === 'InvalidStateError') {
    return 'Esta passkey ya está registrada. Por favor, usa una diferente.';
  }
  
  if (error.name === 'NotAllowedError') {
    return 'Operación cancelada o no permitida. Por favor, intenta nuevamente.';
  }
  
  if (error.name === 'SecurityError') {
    return 'Error de seguridad. Asegúrate de estar en un contexto seguro (HTTPS).';
  }
  
  if (error.name === 'UnknownError') {
    return 'Error desconocido. Por favor, intenta nuevamente.';
  }
  
  return error.message || 'Error al procesar la passkey. Por favor, intenta nuevamente.';
}
