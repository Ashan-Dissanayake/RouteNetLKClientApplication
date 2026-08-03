export interface AppNotification {
  id: number;
  title: string;
  message: string;
  isread: boolean;
  tocreated: string;
  branch?: any;
  user?: any;
  role?: any;
}
