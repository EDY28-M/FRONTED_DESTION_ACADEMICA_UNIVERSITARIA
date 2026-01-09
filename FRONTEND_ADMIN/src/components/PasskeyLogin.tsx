import React, { useState } from 'react';
import { bufferToBase64Url, convertBase64UrlToArrayBuffer, isWebAuthnSupported, getWebAuthnErrorMessage } from '../lib/webauthn';
import { Fingerprint, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// En producción usa VITE_API_URL, en desarrollo usa ruta relativa (proxy de Vite)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface PasskeyLoginProps {
  email?: string;
  onSuccess?: () => void;
}

export const PasskeyLogin: React.FC<PasskeyLoginProps> = ({ email, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!isWebAuthnSupported()) {
    return null; // No mostrar si no está soportado
  }

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Paso 1: Solicitar opciones de login
      const optionsResponse = await fetch(`${API_BASE_URL}/webauthn/login/options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email || null,
        }),
      });

      if (!optionsResponse.ok) {
        const problem = await optionsResponse.json();
        throw new Error(problem.detail || 'Error al obtener opciones de login');
      }

      const { options: serverOptions, challengeKey } = await optionsResponse.json();

      // Paso 2: Convertir opciones para WebAuthn API
      const publicKeyCredentialRequestOptions = convertBase64UrlToArrayBuffer(serverOptions);

      // Paso 3: Obtener credencial del navegador
      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions as PublicKeyCredentialRequestOptions,
      }) as PublicKeyCredential | null;

      if (!credential || !(credential instanceof PublicKeyCredential)) {
        throw new Error('No se pudo obtener la credencial');
      }

      const response = credential.response as AuthenticatorAssertionResponse;

      // Paso 4: Preparar datos para el servidor
      const assertionResponse = {
        id: credential.id,
        rawId: bufferToBase64Url(credential.rawId),
        response: {
          clientDataJSON: bufferToBase64Url(response.clientDataJSON),
          authenticatorData: bufferToBase64Url(response.authenticatorData),
          signature: bufferToBase64Url(response.signature),
          userHandle: response.userHandle ? bufferToBase64Url(response.userHandle) : null,
        },
        type: credential.type,
      };

      // Paso 5: Verificar con el servidor
      const verifyResponse = await fetch(`${API_BASE_URL}/webauthn/login/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          challengeKey,
          assertionResponse,
          originalOptions: serverOptions,
        }),
      });

      if (!verifyResponse.ok) {
        const problem = await verifyResponse.json();
        throw new Error(problem.detail || 'Error al verificar la credencial');
      }

      const result = await verifyResponse.json();

      if (result.success && result.user) {
        toast.success(`Bienvenido, ${result.user.nombres}!`);
        onSuccess?.();

        // Redirigir según rol
        if (result.user.rol.toLowerCase() === 'administrador') {
          navigate('/admin/dashboard');
        } else if (result.user.rol.toLowerCase() === 'estudiante') {
          navigate('/estudiante/inicio');
        } else if (result.user.rol.toLowerCase() === 'docente') {
          navigate('/docente/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        throw new Error('Login fallido');
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? getWebAuthnErrorMessage(err) : 'Error al iniciar sesión con passkey';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Iniciando sesión...</span>
          </>
        ) : (
          <>
            <Fingerprint className="w-5 h-5" />
            <span>Iniciar con Passkey</span>
          </>
        )}
      </button>
    </div>
  );
};
