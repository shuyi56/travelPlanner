// TypeScript interfaces for the Pydantic models

export type DifficultyLevel = "easy" | "moderate" | "challenging" | "extreme";

export interface BaseIdea {
  name: string;
  photos?: string[]; // Assuming photo_references are strings
  notes?: string;
}

export interface AccommodationIdea extends BaseIdea {
  type?: string;
  price?: number; // Google's price_level is 0-4, Pydantic model has int
  address?: string;
  checkIn?: string;
  checkOut?: string;
}

export interface ActivityIdea extends BaseIdea {
  duration?: string;
  price?: number;
  location?: string;
  difficulty?: DifficultyLevel;
}

export interface EatingIdea extends BaseIdea {
  cuisine?: string;
  price?: number;
  address?: string;
}

export interface SightseeingIdea extends BaseIdea {
  location?: string;
  price?: number;
  openingHours?: string;
  bestTime?: string;
}

export interface TravelIdea extends BaseIdea {
  transportType?: string;
  from_address?: string; // Matches Pydantic alias 'from'
  to_address?: string;   // Matches Pydantic alias 'to'
  duration?: string;
  cost?: number;         // Matches Pydantic 'cost' field
}

export type Idea = AccommodationIdea | ActivityIdea | EatingIdea | SightseeingIdea | TravelIdea;


// Utility to get the backend URL for a Google Places photo
export function getPlacePhotoUrl(photoReference: string, placeId: string) {
  if (!photoReference || !placeId) return "";
  return `http://127.0.0.1:8000/api/maps/photo?photo_reference=${encodeURIComponent(photoReference)}&place_id=${encodeURIComponent(placeId)}`;
}

// Fetch the photo from backend and only trigger if not already cached
export async function ensurePlacePhotoCached(photoReference: string, placeId: string): Promise<void> {
  if (!photoReference || !placeId) return;
  const url = getPlacePhotoUrl(photoReference, placeId);
  if (!url) return;
  // Try a HEAD request to check if the photo exists
  const headResp = await fetch(url, { method: "HEAD" });
  if (headResp.status === 200) {
    // Already cached, nothing to do
    return;
  }
  // Otherwise, trigger the backend to fetch and cache the photo
  await fetch(url, { method: "GET" });
}

// Fetch photo references for a given placeId from the backend
export async function fetchPhotos(placeId: string): Promise<{ photo_reference: string }[]> {
  const resp = await fetch(`http://127.0.0.1:8000/api/maps/photos/${encodeURIComponent(placeId)}`);
  if (!resp.ok) return [];
  const data = await resp.json();
  return data.photos || [];
}

/**
 * Fetches detailed place information from the backend based on an address and idea type.
 * The backend then calls the Google Places API and returns a structured Idea object.
 * @param address The address or query string to search for.
 * @param ideaType The type of idea (e.g., "accommodation", "eating") to help structure the response.
 * @returns A Promise that resolves to an Idea object or null if an error occurs.
 */
export async function fetchPlaceDetailsWithIdeaType(address: string, ideaType: string): Promise<Idea | null> {
  const backendUrl = "http://127.0.0.1:8000/api/maps/details";
  const requestBody = {
    address: address,
    idea_type: ideaType,
  };

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error(`Error fetching place details: ${response.status} ${response.statusText}`);
      // Optionally, you could try to parse an error message from the response body
      // const errorData = await response.json();
      // console.error('Error details:', errorData.detail);
      return null;
    }

    const data: Idea = await response.json();
    return data;

  } catch (error) {
    console.error("Network or other error in fetchPlaceDetailsWithIdeaType:", error);
    return null;
  }
}
