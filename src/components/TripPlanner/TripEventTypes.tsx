import { Dayjs } from "dayjs";
import type { ActivityIdea } from "../Ideas/idea_types/ActivityIdea";

// Base type for all events
export interface BaseTripEvent {
  name: string;
  photos?: string[];
  description?: string; // Add description field
  notes?: string;
  beginTime?: Dayjs | null;
  endTime?: Dayjs | null;
}

// Travel
export interface TravelTripEvent extends BaseTripEvent {
  type: "Travel";
  transportType?: string;
  from?: string;
  to?: string;
  cost?: number;
  bookingReference?: string;
}

// Eating
export interface EatingTripEvent extends BaseTripEvent {
  type: "Eating";
  cuisine?: string;
  price?: number;
  address?: string;
  reservationDetails?: string;
}

// Sightseeing
export interface SightseeingTripEvent extends BaseTripEvent {
  type: "Sightseeing";
  location?: string;
  price?: number;
  openingHours?: string;
  bestTime?: string;
}

// Accommodation
export interface AccommodationTripEvent extends BaseTripEvent {
  type: "Accommodation";
  typeName?: string; // renamed from 'type' to avoid conflict
  price?: number;
  address?: string;
  checkIn?: string;
  checkOut?: string;
  roomDetails?: string;
}

// Activity
export interface ActivityTripEvent extends BaseTripEvent {
  type: "Activity";
  price?: number;
  location?: string;
  difficulty?: ActivityIdea["difficulty"];
  equipmentNeeded?: string;
}

// Meeting
export interface MeetingTripEvent extends BaseTripEvent {
  type: "Meeting";
  location?: string; // Will use AddressSearch, so keep as string for address
  attendees?: string;
  agenda?: string;
}

// Union type for all trip events
export type TripEvent =
  | TravelTripEvent
  | EatingTripEvent
  | SightseeingTripEvent
  | AccommodationTripEvent
  | ActivityTripEvent
  | MeetingTripEvent; // Added here
