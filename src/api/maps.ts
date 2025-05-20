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
