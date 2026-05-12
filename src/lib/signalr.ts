import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { appLogger } from './logger';

let connection: HubConnection | null = null;

// Obtener la URL base del backend (sin /api al final)
const getHubBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  if (apiUrl) {
    // Si hay VITE_API_URL, quitar /api del final para obtener la URL base
    return apiUrl.replace(/\/api$/, '');
  }
  // En desarrollo sin VITE_API_URL, usar ruta relativa (proxy de Vite)
  return '';
};

export const startSignalRConnection = async (token: string): Promise<HubConnection> => {
  if (connection && connection.state === HubConnectionState.Connected) {
    appLogger.debug('SignalR already connected');
    return connection;
  }

  try {
    // Construir URL del hub
    const baseUrl = getHubBaseUrl();
    const url = `${baseUrl}/hub/notifications?access_token=${encodeURIComponent(token)}`;

    appLogger.debug('Starting SignalR connection', {
      baseUrl: baseUrl || 'local',
    });

    connection = new HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Reintentar después de 0s, 2s, 10s, 30s...
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        },
      })
      .build();

    // Manejar reconexión
    connection.onreconnecting((error) => {
      appLogger.warn('SignalR reconnecting', {
        reason: error?.message,
      });
    });

    connection.onreconnected((connectionId) => {
      appLogger.info('SignalR reconnected', {
        connectionId,
      });
    });

    connection.onclose((error) => {
      appLogger.error('SignalR connection closed', error);
    });

    // Iniciar conexión
    await connection.start();
    appLogger.info('SignalR connected');

    return connection;
  } catch (error) {
    appLogger.error('SignalR connection failed', error);
    throw error;
  }
};

export const stopSignalRConnection = async (): Promise<void> => {
  if (connection) {
    try {
      await connection.stop();
      appLogger.debug('SignalR disconnected');
      connection = null;
    } catch (error) {
      appLogger.error('SignalR disconnection failed', error);
    }
  }
};

export const getSignalRConnection = (): HubConnection | null => {
  return connection;
};

export const onReceiveNotification = (callback: (notification: any) => void): void => {
  if (connection) {
    connection.on('ReceiveNotification', callback);
  }
};

export const offReceiveNotification = (): void => {
  if (connection) {
    connection.off('ReceiveNotification');
  }
};
