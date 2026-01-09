import React, { useState } from 'react';
import { bufferToBase64Url, convertBase64UrlToArrayBuffer, isWebAuthnSupported, getWebAuthnErrorMessage } from '../lib/webauthn';
import { Fingerprint, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface PasskeyRegisterProps {
  email: string;
  displayName: string;
  onSuccess?: () => void;
}

export const PasskeyRegister: React.FC<PasskeyRegisterProps> = ({ email, displayName, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isWebAuthnSupported()) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Passkeys no disponibles</p>
          <p className="text-xs text-amber-700 mt-1">
            Tu navegador no soporta autenticación con passkeys. Por favor, usa Chrome, Edge, Safari o Firefox más reciente.
          </p>
        </div>
      </div>
    );
  }

  const handleRegister = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Paso 1: Solicitar opciones de registro
      const optionsResponse = await fetch('/api/webauthn/register/options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          displayName,
        }),
      });

      if (!optionsResponse.ok) {
        const problem = await optionsResponse.json();
        throw new Error(problem.detail || 'Error al obtener opciones de registro');
      }

      const { options: serverOptions, challengeKey } = await optionsResponse.json();

      // Paso 2: Convertir opciones para WebAuthn API
      const publicKeyCredentialCreationOptions = convertBase64UrlToArrayBuffer(
        serverOptions
      ) as PublicKeyCredentialCreationOptions;

      // Paso 3: Crear credencial
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential | null;

      if (!credential || !(credential instanceof PublicKeyCredential)) {
        throw new Error('No se pudo crear la credencial');
      }

      const response = credential.response as AuthenticatorAttestationResponse;

      // Paso 4: Preparar datos para el servidor
      const attestationResponse = {
        id: credential.id,
        rawId: bufferToBase64Url(credential.rawId),
        response: {
          clientDataJSON: bufferToBase64Url(response.clientDataJSON),
          attestationObject: bufferToBase64Url(response.attestationObject),
        },
        type: credential.type,
      };

      // Paso 5: Verificar con el servidor
      const verifyResponse = await fetch('/api/webauthn/register/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          challengeKey,
          attestationResponse,
          originalOptions: serverOptions,
        }),
      });

      if (!verifyResponse.ok) {
        const problem = await verifyResponse.json();
        throw new Error(problem.detail || 'Error al verificar la credencial');
      }

      const result = await verifyResponse.json();

      if (result.success) {
        setIsRegistered(true);
        toast.success('Passkey registrada exitosamente');
        onSuccess?.();
      } else {
        throw new Error('Registro fallido');
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? getWebAuthnErrorMessage(err) : 'Error al registrar passkey';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        <div>
          <p className="text-sm font-medium text-emerald-800">Passkey registrada</p>
          <p className="text-xs text-emerald-700">Ahora puedes iniciar sesión con tu passkey</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        onClick={handleRegister}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Registrando passkey...</span>
          </>
        ) : (
          <>
            <Fingerprint className="w-5 h-5" />
            <span>Crear Passkey</span>
          </>
        )}
      </button>

      <p className="text-xs text-zinc-500 text-center">
        Usa tu huella dactilar, Face ID, PIN o llave de seguridad para crear una passkey
      </p>
    </div>
  );
};
