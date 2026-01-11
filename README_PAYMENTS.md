# Integración de Pagos con Stripe - Frontend

Guía para configurar y usar el sistema de pagos de matrícula en el frontend.

## Instalación de Dependencias

Instalar las dependencias de Stripe:

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

O con yarn:

```bash
yarn add @stripe/stripe-js @stripe/react-stripe-js
```

## Variables de Entorno

Agregar al archivo `.env` o `.env.local`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_PAYMENT_API_URL=http://localhost:5000/api
VITE_BACKEND_API_URL=http://localhost:5251/api
```

## Uso

### 1. Desde la Página de Matrícula

Modificar `MatriculaPage.tsx` para agregar un botón "Pagar y Matricular" que redirija a la página de pago:

```tsx
import { useNavigate } from 'react-router-dom';

// En el componente
const navigate = useNavigate();

const handlePagar = () => {
  // Obtener cursos seleccionados
  const cursosSeleccionados = cursosDisponibles
    .filter(c => c.selected)
    .map(c => ({
      idCurso: c.id,
      codigo: c.codigo,
      nombre: c.nombre,
      creditos: c.creditos,
      precio: 100.00 // Obtener del backend
    }));

  navigate('/estudiante/pago-matricula', {
    state: { cursos: cursosSeleccionados }
  });
};
```

### 2. Componente de Pago

El componente `StripePaymentForm` ya está implementado en:
- `src/components/Payment/StripePaymentForm.tsx`

### 3. Página de Pago

La página de pago está en:
- `src/pages/Student/PagoMatriculaPage.tsx`

## Flujo de Pago

1. Usuario selecciona cursos en la página de matrícula
2. Click en "Pagar y Matricular"
3. Redirige a `/estudiante/pago-matricula` con los cursos en el state
4. Se crea un Payment Intent llamando a `/api/payments/create-intent`
5. Se muestra el formulario de Stripe Elements
6. Usuario ingresa datos de tarjeta
7. Al confirmar, se procesa el pago con `stripe.confirmCardPayment()`
8. Se verifica el estado del pago periódicamente
9. Cuando el pago es exitoso y la matrícula está procesada, redirige a `/estudiante/mis-cursos`

## API del Microservicio

El cliente API está en:
- `src/lib/paymentApi.ts`

### Crear Payment Intent

```typescript
import paymentApi from '@/lib/paymentApi';

const response = await paymentApi.post('/payments/create-intent', {
  idPeriodo: periodoActivo.id,
  cursos: cursos.map(c => ({
    idCurso: c.idCurso,
    precio: c.precio,
    cantidad: 1
  }))
});

const { clientSecret, paymentIntentId } = response.data;
```

### Verificar Estado del Pago

```typescript
const response = await paymentApi.get(`/payments/status/${paymentIntentId}`);
const { status, procesado } = response.data;
```

## Testing

### Tarjetas de Prueba de Stripe

- **Éxito:** `4242 4242 4242 4242`
- **Rechazo:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

Fecha: cualquier fecha futura (ej: 12/25)
CVC: cualquier 3 dígitos (ej: 123)

## Troubleshooting

### Error: "Stripe is not defined"
- Verificar que `VITE_STRIPE_PUBLISHABLE_KEY` esté configurada
- Verificar que las dependencias estén instaladas

### Error: "Failed to create payment intent"
- Verificar que el microservicio esté ejecutándose
- Verificar que `VITE_PAYMENT_API_URL` esté correcta
- Verificar que el token JWT sea válido

### El pago se completa pero no redirige
- Verificar los logs de la consola
- Verificar que el webhook esté procesando correctamente
- Verificar que el backend principal esté respondiendo

## Componentes Relacionados

- `StripePaymentForm.tsx` - Formulario de pago con Stripe Elements
- `PagoMatriculaPage.tsx` - Página completa de pago
- `paymentApi.ts` - Cliente HTTP para el microservicio de pagos
