export interface Event {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  description: string;
  createdAt: string; // ISO date string
  verified: boolean;
}
