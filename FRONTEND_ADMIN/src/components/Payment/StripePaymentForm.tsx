import React, { useState, useEffect } from 'react';
// Nota: Instalar dependencias: npm install @stripe/stripe-js @stripe/react-stripe-js
// @ts-ignore - Dependencias de Stripe
import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js';
// @ts-ignore - Dependencias de Stripe
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface StripePaymentFormProps {
  clientSecret: string;
  paymentIntentId: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  buttonText?: string;
}

const PaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  paymentIntentId,
  onSuccess,
  onError,
  buttonText = "Pagar y Matricular",
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Elemento de tarjeta no encontrado');
      setIsProcessing(false);
      return;
    }

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Error al procesar el pago');
        onError(stripeError.message || 'Error al procesar el pago');
        toast.error(stripeError.message || 'Error al procesar el pago');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Pago procesado exitosamente');
        onSuccess(paymentIntentId);
      } else {
        setError('El pago no se completó correctamente');
        onError('El pago no se completó correctamente');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error inesperado al procesar el pago';
      setError(errorMessage);
      onError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-zinc-700 mb-2">
          Información de la tarjeta
        </label>
        <div className="p-3 border border-zinc-300 rounded-md">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Procesando pago...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>{buttonText}</span>
          </>
        )}
      </button>

      <p className="text-xs text-zinc-500 text-center">
        Tu pago está protegido por Stripe. No almacenamos información de tu tarjeta.
      </p>
    </form>
  );
};

interface StripePaymentFormWrapperProps {
  clientSecret: string;
  paymentIntentId: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  buttonText?: string;
}

export const StripePaymentForm: React.FC<StripePaymentFormWrapperProps> = ({
  clientSecret,
  paymentIntentId,
  onSuccess,
  onError,
  buttonText,
}) => {
  const [stripe, setStripe] = useState<Stripe | null>(null);

  useEffect(() => {
    stripePromise.then((stripeInstance) => {
      if (stripeInstance) {
        setStripe(stripeInstance);
      }
    });
  }, []);

  if (!stripe) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <Elements stripe={stripe} options={options}>
      <PaymentForm
        clientSecret={clientSecret}
        paymentIntentId={paymentIntentId}
        onSuccess={onSuccess}
        onError={onError}
        buttonText={buttonText}
      />
    </Elements>
  );
};
