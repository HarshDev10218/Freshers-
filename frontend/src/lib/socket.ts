export type SocketEventType =
  | 'FACULTY_UPDATED'
  | 'FACULTY_INSERTED'
  | 'FACULTY_DELETED'
  | 'FACULTY_BATCH_INSERTED'
  | 'INIT_STATUS'
  | 'CONFIG_UPDATED';

export interface SocketMessage {
  type: SocketEventType;
  payload: any;
}

type MessageListener = (msg: SocketMessage) => void;
type StatusListener = (status: 'connected' | 'connecting' | 'disconnected') => void;

class RealtimeSocketManager {
  private ws: WebSocket | null = null;
  private messageListeners: Set<MessageListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private reconnectTimer: any = null;
  private shouldReconnect: boolean = true;
  private status: 'connected' | 'connecting' | 'disconnected' = 'disconnected';

  public connect(): void {
    if (typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setStatus('connecting');

    try {
      const isHttps = window.location.protocol === 'https:';
      const wsProtocol = isHttps ? 'wss:' : 'ws:';
      
      // If configured explicitly via environment variable (e.g. wss://backend.onrender.com/ws)
      const configuredWsUrl = import.meta.env.VITE_WS_URL?.trim();
      const host = window.location.host;
      const wsUrl = configuredWsUrl || `${wsProtocol}//${host}/ws`;

      console.log(`[WebSocket] Connecting to real-time endpoint: ${wsUrl}`);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocket] Real-time connection established.');
        this.setStatus('connected');
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data: SocketMessage = JSON.parse(event.data);
          this.messageListeners.forEach((listener) => {
            try {
              listener(data);
            } catch (err) {
              console.error('Error in socket listener:', err);
            }
          });
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[WebSocket] Connection encountered error:', err);
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Connection closed.');
        this.setStatus('disconnected');
        this.ws = null;
        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      console.error('[WebSocket] Failed to instantiate WebSocket:', err);
      this.setStatus('disconnected');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      console.log('[WebSocket] Attempting automatic reconnection...');
      this.connect();
    }, 2500);
  }

  private setStatus(status: 'connected' | 'connecting' | 'disconnected'): void {
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  public getStatus(): 'connected' | 'connecting' | 'disconnected' {
    return this.status;
  }

  public onMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  public onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }
}

export const realtimeSocket = new RealtimeSocketManager();
