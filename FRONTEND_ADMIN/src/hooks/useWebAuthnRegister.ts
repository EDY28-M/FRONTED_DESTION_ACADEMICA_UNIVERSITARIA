import { useState } from 'react';
import { preformatMakeCredReq, bufferToBase64url } from '../utils/webauthn';

// Configure this to match your backend URL if different
// const API_BASE_URL = 'http://localhost:5173/api/webauthn'; 

export const useWebAuthnRegister = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const register = async (email: string, nickname?: string) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Get Options
            console.log('[WebAuthn] Step 1: Getting registration options for', email);
            const resOptions = await fetch(`/api/webauthn/register/options`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, nickname })
            });
            console.log('[WebAuthn] Step 1 response status:', resOptions.status);

            if (!resOptions.ok) {
                const err = await resOptions.json().catch(() => ({}));
                console.error('[WebAuthn] Step 1 failed:', err);
                throw new Error(err.detail || err.message || 'Failed to get registration options');
            }

            const data = await resOptions.json();
            console.log('[WebAuthn] Step 1 data received:', data);

            const { options, challengeKey } = data;
            if (!options) {
                throw new Error('No options received from server');
            }

            console.log('[WebAuthn] Step 2: Creating credential with browser API');
            console.log('[WebAuthn] Options RP:', options.rp);
            console.log('[WebAuthn] Options User:', options.user);

            const publicKey = preformatMakeCredReq(options);
            console.log('[WebAuthn] Formatted publicKey for browser:', publicKey);

            // 2. Create Credentials (Browser) - THIS SHOULD TRIGGER THE FINGERPRINT PROMPT
            const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential;
            console.log('[WebAuthn] Step 2 credential created:', credential);

            if (!credential) throw new Error('Credential creation failed');

            const attestationResponse = {
                id: credential.id,
                rawId: bufferToBase64url(credential.rawId),
                type: credential.type,
                response: {
                    attestationObject: bufferToBase64url((credential.response as AuthenticatorAttestationResponse).attestationObject),
                    clientDataJSON: bufferToBase64url(credential.response.clientDataJSON)
                }
            };

            // 3. Verify
            console.log('[WebAuthn] Step 3: Verifying with backend');
            const resVerify = await fetch(`/api/webauthn/register/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flowKey: challengeKey, attestationResponse })
            });

            if (!resVerify.ok) {
                const err = await resVerify.json().catch(() => ({}));
                console.error('[WebAuthn] Step 3 failed:', err);
                throw new Error(err.message || 'Verification failed');
            }

            console.log('[WebAuthn] Registration complete!');
            return { success: true, errorMessage: null };
        } catch (err: any) {
            console.error('[WebAuthn] Error:', err);

            // Handle browser-specific errors
            let errorMessage = err.message;

            if (err.name === 'NotReadableError' || errorMessage.includes('credential manager')) {
                errorMessage = 'Esta huella/FaceID ya está registrada en este dispositivo. Usa el botón de login para ingresar.';
            } else if (err.name === 'InvalidStateError' || errorMessage.includes('already registered')) {
                errorMessage = 'Ya tienes una credencial registrada. Usa el login con huella/FaceID.';
            } else if (err.name === 'NotAllowedError') {
                errorMessage = 'Operación cancelada o no permitida por el usuario.';
            } else if (err.name === 'SecurityError') {
                errorMessage = 'Error de seguridad. Verifica que estés en una conexión HTTPS segura.';
            }

            setError(errorMessage);
            return { success: false, errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { register, loading, error };
};
