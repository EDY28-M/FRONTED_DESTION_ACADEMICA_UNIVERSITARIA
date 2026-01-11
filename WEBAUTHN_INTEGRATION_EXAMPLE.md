# Ejemplo de Integración WebAuthn en Páginas Existentes

## 1. Integrar PasskeyLogin en LoginAdminPage.tsx

```tsx
import { PasskeyLogin } from '../../components/PasskeyLogin';

// Dentro del componente, después del formulario de login tradicional:
<div className="mt-6">
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-zinc-200"></div>
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-2 bg-white text-zinc-500">O</span>
    </div>
  </div>

  <PasskeyLogin 
    email={email} 
    onSuccess={() => navigate('/admin/dashboard')} 
  />
</div>
```

## 2. Integrar PasskeyRegister en Dashboard después de login

```tsx
import { PasskeyRegister } from '../../components/PasskeyRegister';
import { useState } from 'react';

// En el componente Dashboard o Perfil:
const [showPasskeyRegister, setShowPasskeyRegister] = useState(false);
const { user } = useAuth(); // O tu hook de autenticación

{showPasskeyRegister && (
  <div className="bg-white border border-zinc-200 rounded-xl p-6 mt-6">
    <h3 className="text-lg font-semibold mb-4">Registrar Passkey</h3>
    <PasskeyRegister
      email={user.email}
      displayName={`${user.nombres} ${user.apellidos}`}
      onSuccess={() => {
        setShowPasskeyRegister(false);
        toast.success('Passkey registrada exitosamente');
      }}
    />
  </div>
)}
```

## 3. Verificar soporte antes de mostrar

```tsx
import { isWebAuthnSupported } from '../lib/webauthn';

{isWebAuthnSupported() && (
  <PasskeyLogin email={email} onSuccess={handleSuccess} />
)}
```
