import { useState } from 'react';
import { preformatGetAssertionReq, bufferToBase64url } from '../utils/webauthn';

// En producción usa VITE_API_URL, en desarrollo usa ruta relativa (proxy de Vite)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const useWebAuthnLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // expectedRole: 'admin' | 'docente' | 'estudiante' - valida que el usuario tenga este rol
    const login = async (email?: string, expectedRole?: string) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Get Options
            console.log('[WebAuthn Login] Step 1: Getting login options');
            const resOptions = await fetch(`${API_BASE_URL}/webauthn/login/options`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (!resOptions.ok) {
                const err = await resOptions.json().catch(() => ({}));
                throw new Error(err.detail || 'Failed to get login options');
            }

            const { options, challengeKey } = await resOptions.json();
            console.log('[WebAuthn Login] Step 1 complete, got options');
            const publicKey = preformatGetAssertionReq(options);

            // 2. Get Assertion (Browser)
            console.log('[WebAuthn Login] Step 2: Getting assertion from browser');
            const credential = await navigator.credentials.get({ publicKey }) as PublicKeyCredential;
            if (!credential) throw new Error('Credential retrieval failed');
            console.log('[WebAuthn Login] Step 2 complete, got credential');

            const assertionResponse = {
                id: credential.id,
                rawId: bufferToBase64url(credential.rawId),
                type: credential.type,
                response: {
                    authenticatorData: bufferToBase64url((credential.response as AuthenticatorAssertionResponse).authenticatorData),
                    clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
                    signature: bufferToBase64url((credential.response as AuthenticatorAssertionResponse).signature),
                    userHandle: (credential.response as AuthenticatorAssertionResponse).userHandle ? bufferToBase64url((credential.response as AuthenticatorAssertionResponse).userHandle!) : null
                }
            };

            // 3. Verify (with expectedRole for role validation)
            console.log('[WebAuthn Login] Step 3: Verifying with backend, expectedRole:', expectedRole);
            const resVerify = await fetch(`${API_BASE_URL}/webauthn/login/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flowKey: challengeKey, assertionResponse, expectedRole })
            });

            if (!resVerify.ok) {
                const err = await resVerify.json().catch(() => ({}));
                console.error('[WebAuthn Login] Step 3 failed:', err);
                throw new Error(err.message || 'Verification failed');
            }

            const data = await resVerify.json();
            console.log('[WebAuthn Login] Step 3 complete, response:', data);

            // The backend returns { token, refreshToken, usuario, ... }
            return data;

        } catch (err: any) {
            console.error('[WebAuthn Login] Error:', err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    };
    return { login, loading, error };
};
