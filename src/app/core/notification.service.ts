import { Injectable, signal, computed, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiEndpoints } from './api-endpoints';
import { AppNotification } from '../shared/models/notification.model';
import { ApiResponse } from '../shared/models/apiresponse.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private eventSource: EventSource | null = null;

  // Reactive state using Angular Signals
  readonly notifications = signal<AppNotification[]>([]);
  readonly unreadCount = computed(() => this.notifications().filter(n => !n.isread).length);

  constructor(
    private http: HttpClient,
    private zone: NgZone,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Connect to backend SSE notification stream for given userId
   */
  connect(userId: number): void {
    if (this.eventSource) {
      this.disconnect();
    }

    const streamUrl = ApiEndpoints.NOTIFICATIONS_STREAM(userId);
    this.eventSource = new EventSource(streamUrl);

    // Connected initial event
    this.eventSource.addEventListener('INIT', (event: MessageEvent) => {
      console.log('[NotificationService] SSE stream connected:', event.data);
    });

    // Live Notification event broadcasted by Spring Boot backend
    this.eventSource.addEventListener('notification', (event: MessageEvent) => {
      this.zone.run(() => {
        try {
          const newNotif: AppNotification = JSON.parse(event.data);

          // Update signal state with new notification at top
          this.notifications.update(prev => [newNotif, ...prev.filter(n => n.id !== newNotif.id)]);

          // Show floating toast alert
          this.snackBar.open(`${newNotif.title}: ${newNotif.message}`, 'Close', {
            duration: 6000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['notification-toast']
          });
        } catch (e) {
          console.error('[NotificationService] Failed to parse SSE notification payload', e);
        }
      });
    });

    this.eventSource.onerror = (err) => {
      console.warn('[NotificationService] SSE connection error or reconnection event:', err);
    };
  }

  /**
   * Fetch user notifications history from REST API
   */
  loadUserNotifications(userId: number): void {
    this.http.get<ApiResponse<AppNotification, true>>(ApiEndpoints.NOTIFICATIONS_USER(userId))
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            this.notifications.set(response.data);
          }
        },
        error: (err) => {
          console.error('[NotificationService] Failed to fetch past notifications:', err);
        }
      });
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: number): void {
    this.http.patch<ApiResponse<void, false>>(ApiEndpoints.NOTIFICATION_MARK_READ(notificationId), {})
      .subscribe({
        next: () => {
          this.notifications.update(prev =>
            prev.map(n => n.id === notificationId ? { ...n, isread: true } : n)
          );
        },
        error: (err) => {
          console.error('[NotificationService] Failed to mark notification as read:', err);
        }
      });
  }

  /**
   * Close SSE connection on logout or app teardown
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('[NotificationService] SSE stream disconnected.');
    }
  }
}
