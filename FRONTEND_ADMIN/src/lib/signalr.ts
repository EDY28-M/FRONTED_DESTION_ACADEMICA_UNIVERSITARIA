import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

let connection: HubConnection | null = null;

export const startSignalRConnection = async (token: string): Promise<HubConnection> => {
  if (connection && connection.state === HubConnectionState.Connected) {
    console.log('SignalR ya está conectado');
    return connection;
  }

  try {
    // El backend espera el token como query parameter 'access_token'
    const url = `/hub/notifications?access_token=${encodeURIComponent(token)}`;
    
    // Log solo para debugging (sin mostrar el token completo por seguridad)
    console.log('🔌 Conectando a SignalR hub...');
    
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
      console.warn('🔄 SignalR reconectando...', error);
    });

    connection.onreconnected((connectionId) => {
      console.log('✅ SignalR reconectado. ConnectionId:', connectionId);
    });

    connection.onclose((error) => {
      console.error('❌ SignalR desconectado:', error);
    });

    // Iniciar conexión
    await connection.start();
    console.log('✅ SignalR conectado exitosamente');

    return connection;
  } catch (error) {
    console.error('❌ Error al conectar SignalR:', error);
    throw error;
  }
};

export const stopSignalRConnection = async (): Promise<void> => {
  if (connection) {
    try {
      await connection.stop();
      console.log('SignalR desconectado');
      connection = null;
    } catch (error) {
      console.error('Error al desconectar SignalR:', error);
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
