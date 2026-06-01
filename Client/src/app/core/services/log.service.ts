import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface LogEntry {
  _id: string;
  timestamp: string;
  metadata: { serviceId: string; severity: string; host: string; runtime: string };
  message: string;
  stackTrace?: string;
  statusCode?: number;
}

export interface AIInsight {
  analysis: { rootCause: string; impactScore: number; suggestedFix: string };
  modelUsed: string;
}

@Injectable({ providedIn: 'root' })
export class LogService {
  private http = inject(HttpClient);
  private socket!: Socket;
  private apiUrl = 'http://localhost:3000/api/v1';

  // Streams for asynchronous real-time infrastructure data
  private logStream$ = new Subject<LogEntry[]>();
  private insightAlertStream$ = new Subject<{ logId: string; insight: AIInsight }>();

  // State Trackers using modern Angular Signals
  public activeServiceId = signal<string>('65f3a21b9d3e4f001c8b4567'); 

  constructor() {
    this.initializeWebSocket();
  }

  private initializeWebSocket(): void {
    this.socket = io('http://localhost:3000');

    this.socket.on('connect', () => {
      // Direct connection joining the specific multi-tenant room channel
      this.socket.emit('join-service-room', this.activeServiceId());
    });

    // Listeners parsing asynchronous backend events
    this.socket.on('new-logs', (logs: LogEntry[]) => this.logStream$.next(logs));
    this.socket.on('ai-insight-alert', (alert: { logId: string; insight: AIInsight }) => this.insightAlertStream$.next(alert));
  }

  public getLiveLogs(): Observable<LogEntry[]> {
    return this.logStream$.asObservable();
  }

  public getLiveInsights(): Observable<{ logId: string; insight: AIInsight }> {
    return this.insightAlertStream$.asObservable();
  }

  public getHistoricalAnalytics(serviceId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/analytics/${serviceId}`);
  }

  public fetchInsight(logId: string): Observable<AIInsight> {
    return this.http.get<AIInsight>(`${this.apiUrl}/insights/${logId}`);
  }
}