import { Dayjs } from "dayjs";
import type { ActivityIdea } from "../Ideas/idea_types/ActivityIdea";

// Base type for all events
export interface BaseTripEvent {
  name: string;
  photos?: string[];
  description?: string;
  beginTime?: Dayjs | null;
  endTime?: Dayjs | null;
  minPrice?: number;  // Add price range to base event
  maxPrice?: number;  // Add price range to base event
}

// Travel
export interface TravelTripEvent extends BaseTripEvent {
  type: "Travel";
  transportType?: string;
  from?: string;
  to?: string;
}

// Eating
export interface EatingTripEvent extends BaseTripEvent {
  type: "Eating";
  cuisine?: string;
  address?: string;
}

// Sightseeing
export interface SightseeingTripEvent extends BaseTripEvent {
  type: "Sightseeing";
  location?: string;
  openingHours?: string;
  bestTime?: string;
}

// Accommodation
export interface AccommodationTripEvent extends BaseTripEvent {
  type: "Accommodation";
  typeName?: string;
  address?: string;
  checkIn?: string;
  checkOut?: string;
}

// Activity
export interface ActivityTripEvent extends BaseTripEvent {
  type: "Activity";
  location?: string;
  difficulty?: ActivityIdea["difficulty"];
}

// Union type for all trip events
export type TripEvent =
  | TravelTripEvent
  | EatingTripEvent
  | SightseeingTripEvent
  | AccommodationTripEvent
  | ActivityTripEvent;
