export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}
