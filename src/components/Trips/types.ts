import { Dayjs } from 'dayjs';

export interface Trip {
  id?: string;
  tripName: string;
  description: string;
  travelers: number;
  dates: [Dayjs, Dayjs];
}
