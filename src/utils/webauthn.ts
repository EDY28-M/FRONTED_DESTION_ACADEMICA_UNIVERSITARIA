// Browser-safe Base64Url conversion without Node Buffer dependency
export const bufferToBase64url = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};

export const base64urlToBuffer = (base64string: string): ArrayBuffer => {
    // Add padding if needed
    const padded = base64string.padEnd(base64string.length + (4 - base64string.length % 4) % 4, '=');
    const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
};

// Recursive helper to convert options from Server (Base64Url) to Client (ArrayBuffer)
export const preformatMakeCredReq = (makeCredReq: any) => {
    makeCredReq.challenge = base64urlToBuffer(makeCredReq.challenge);
    makeCredReq.user.id = base64urlToBuffer(makeCredReq.user.id);

    // Decode excludeCredentials ids
    if (makeCredReq.excludeCredentials) {
        for (let i = 0; i < makeCredReq.excludeCredentials.length; i++) {
            makeCredReq.excludeCredentials[i].id = base64urlToBuffer(makeCredReq.excludeCredentials[i].id);
        }
    }
    return makeCredReq;
};

export const preformatGetAssertionReq = (getAssertionReq: any) => {
    getAssertionReq.challenge = base64urlToBuffer(getAssertionReq.challenge);

    // Decode allowCredentials ids
    if (getAssertionReq.allowCredentials) {
        for (let i = 0; i < getAssertionReq.allowCredentials.length; i++) {
            getAssertionReq.allowCredentials[i].id = base64urlToBuffer(getAssertionReq.allowCredentials[i].id);
        }
    }
    return getAssertionReq;
};
