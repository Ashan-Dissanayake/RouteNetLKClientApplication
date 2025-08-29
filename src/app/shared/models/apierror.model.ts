export interface Apierror {
  type: string;
  title: string;
  status: string | number;
  code: string;
  details?: string[];
  instance?: string;
}
