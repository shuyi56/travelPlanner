import os
import requests
from fastapi import FastAPI, Query, HTTPException, Request, Path, APIRouter
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import List, Optional, Union
from enum import Enum
import logging

load_dotenv()

# Basic logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Pydantic Models ---

class DifficultyLevel(str, Enum):
    EASY = "easy"
    MODERATE = "moderate"
    CHALLENGING = "challenging"
    EXTREME = "extreme"

class BaseIdea(BaseModel):
    name: str
    photos: List[str] = []
    notes: Optional[str] = None

class AccommodationIdea(BaseIdea):
    type: str
    price: int
    address: str
    checkIn: Optional[str] = None # Assuming these can be optional
    checkOut: Optional[str] = None # Assuming these can be optional

class ActivityIdea(BaseIdea):
    duration: Optional[str] = None # Assuming this can be optional
    price: int
    location: str
    difficulty: DifficultyLevel

class EatingIdea(BaseIdea):
    cuisine: str
    price: int
    address: str

class SightseeingIdea(BaseIdea):
    location: str
    price: int
    openingHours: Optional[str] = None # Assuming this can be optional
    bestTime: Optional[str] = None # Assuming this can be optional

class TravelIdea(BaseIdea):
    transportType: str
    from_address: str = Field(..., alias="from")
    to_address: str = Field(..., alias="to")
    duration: Optional[str] = None # Assuming this can be optional
    cost: int

class MapsPhotoRequest(BaseModel):
    address: str
    idea_type: str # Could be an Enum if idea types are fixed

# Union of all idea types for response model, if needed for a specific endpoint
IdeaResponse = Union[AccommodationIdea, ActivityIdea, EatingIdea, SightseeingIdea, TravelIdea]

# --- End Pydantic Models ---

GOOGLE_API_KEY = os.getenv("VITE_GOOGLE_MAPS_API_KEY")
PHOTO_DIR = os.path.join(os.path.dirname(__file__), "photos")
os.makedirs(PHOTO_DIR, exist_ok=True)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
router = APIRouter(prefix="/api/maps")

def get_photo_path(place_id: str) -> str:
    return os.path.join(PHOTO_DIR, "places", f"{place_id}.jpg")

def photo_exists(place_id: str) -> bool:
    return os.path.exists(get_photo_path(place_id))

def save_photo_from_google(photo_reference: str, place_id: str) -> bool:
    # photo_reference is now the photo resource name from the new API
    # Example: "places/ChIJ2fzCmcW7j4AR2JzfXBBoh6E/photos/AUacShh3_Dd8yvV2JZMtNjjbbSbFhSv-0VmUN-uasQ2Oj00XB63irPTks0-A_1rMNfdTunoOVZfVOExRRBNrupUf8TY4Kw5iQNQgf2rwcaM8hXNQg7KDyvMR5B-HzoCE1mwy2ba9yxvmtiJrdV-xBgO8c5iJL65BCd0slyI1"
    url = (
        f"https://places.googleapis.com/v1/{photo_reference}/media"
        f"?maxHeightPx=3000&maxWidthPx=4000&key={GOOGLE_API_KEY}"
    )
    resp = requests.get(url, stream=True)
    if resp.status_code == 200:
        photo_path = get_photo_path(place_id)
        # Ensure the directory exists
        os.makedirs(os.path.dirname(photo_path), exist_ok=True)
        with open(photo_path, "wb") as f:
            for chunk in resp.iter_content(1024):
                f.write(chunk)
        return True
    return False

@router.api_route("/photo", methods=["GET", "HEAD"])
def fetch_photo(
    request: Request,
    photo_reference: str = Query(None, description="Google Places photo_reference"),
    place_id: str = Query(None, description="Google Places place_id")
):
    if not photo_reference or not place_id:
        raise HTTPException(status_code=400, detail="photo_reference and place_id are required")
    photo_path = get_photo_path(place_id)
    if not photo_exists(place_id):
        if request.method == "HEAD":
            raise HTTPException(status_code=404, detail="Photo not found")
        # Try to fetch and save from Google
        if not save_photo_from_google(photo_reference, place_id):
            raise HTTPException(status_code=404, detail="Photo not found or Google API error")
    # Serve the file (for GET or HEAD)
    return FileResponse(photo_path, media_type="image/jpeg")

@router.get("/photos/{place_id}")
def get_photos(place_id: str = Path(..., description="Google Places place_id")):
    # Use the new Places Details API to get photo resource names
    details_url = (
        f"https://places.googleapis.com/v1/places/{place_id}"
    )
    headers = {
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "photos"
    }
    resp = requests.get(details_url, headers=headers)
    if resp.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to fetch from Google Places API")
    data = resp.json()

    photos = []
    if data.get("photos"):
        photos = [
            {"photo_reference": p["name"]}
            for p in data["photos"]
            if "name" in p
        ]
        # Save the first photo as place_id.jpg if not already cached
        if photos:
            first_ref = photos[0]["photo_reference"]
            if not photo_exists(place_id):
                save_photo_from_google(first_ref, place_id)
    return JSONResponse({"photos": photos})

@router.post("/details")
async def get_place_details(request_data: MapsPhotoRequest) -> IdeaResponse:
    logger.info(f"Received request for address: '{request_data.address}', idea_type: '{request_data.idea_type}'")
    google_places_api_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": request_data.address,
        "key": GOOGLE_API_KEY
    }

    try:
        response = requests.get(google_places_api_url, params=params)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4XX or 5XX)
    except requests.exceptions.RequestException as e:
        error_detail = f"Error connecting to Google Places API: {e}"
        logger.error(f"Request for '{request_data.address}': {error_detail}")
        raise HTTPException(status_code=503, detail=error_detail)

    data = response.json()
    status = data.get("status")

    if status == "ZERO_RESULTS":
        error_detail = f"No places found for address: {request_data.address}"
        logger.warn(f"Request for '{request_data.address}': {error_detail} (Google Status: {status})")
        raise HTTPException(status_code=404, detail=error_detail)
    elif status != "OK":
        error_message = data.get("error_message", "Unknown error from Google Places API.")
        error_detail = f"Google Places API error: {status} - {error_message}"
        logger.error(f"Request for '{request_data.address}': {error_detail}")
        raise HTTPException(status_code=500, detail=error_detail)

    if not data.get("results"):
        error_detail = f"No results found in Google Places API response for address: {request_data.address} (Google Status: {status})"
        logger.warn(f"Request for '{request_data.address}': {error_detail}")
        raise HTTPException(status_code=404, detail=error_detail)

    # Extract data from the first result
    place_details = data["results"][0]
    
    place_name = place_details.get("name")
    photo_refs = [p.get("photo_reference") for p in place_details.get("photos", []) if p.get("photo_reference")]
    notes_str = f"Notes for {place_name}" if place_name else "Notes for this idea"
    
    # Default price from price_level, Google's price_level is 0-4.
    # Our Pydantic models expect an int, which aligns with this.
    price_val = place_details.get("price_level", 0) # Default to 0 if not present

    idea_type_str = request_data.idea_type.lower() # For case-insensitive matching

    if idea_type_str == "accommodation":
        response_model = AccommodationIdea(
            name=place_name,
            photos=photo_refs,
            notes=notes_str,
            type="Hotel", # Default
            price=price_val,
            address=place_details.get("formatted_address"),
            checkIn=None,
            checkOut=None
        )
    elif idea_type_str == "activity":
        response_model = ActivityIdea(
            name=place_name,
            photos=photo_refs,
            notes=notes_str,
            duration=None, # Default
            price=price_val,
            location=place_details.get("formatted_address"),
            difficulty=DifficultyLevel.EASY # Default
        )
    elif idea_type_str == "eating":
        cuisine_type = "Restaurant" # Default
        google_types = place_details.get("types", [])
        # Try to infer cuisine from Google types
        # Common food-related types from Google Places API:
        food_types = ["restaurant", "cafe", "bakery", "bar", "meal_delivery", "meal_takeaway"]
        for g_type in google_types:
            if g_type in food_types:
                cuisine_type = g_type.replace("_", " ").title()
                break
        
        response_model = EatingIdea(
            name=place_name,
            photos=photo_refs,
            notes=notes_str,
            cuisine=cuisine_type,
            price=price_val,
            address=place_details.get("formatted_address")
        )
    elif idea_type_str == "sightseeing":
        opening_hours_text = None
        if "opening_hours" in place_details and "weekday_text" in place_details["opening_hours"]:
            opening_hours_text = ", ".join(place_details["opening_hours"]["weekday_text"])
        
        response_model = SightseeingIdea(
            name=place_name,
            photos=photo_refs,
            notes=notes_str,
            location=place_details.get("formatted_address"),
            price=price_val,
            openingHours=opening_hours_text,
            bestTime=None # Default
        )
    elif idea_type_str == "travel":
        # For TravelIdea, using a single place search is limited.
        # Setting defaults as per instructions.
        response_model = TravelIdea(
            name=place_name or "Travel Idea", # Use place name if available
            photos=photo_refs,
            notes=notes_str,
            transportType="Car", # Default
            from_address="", # Default (or request_data.address if it's the origin)
            to_address="",   # Default (or place_details.get("formatted_address") if it's the destination)
            duration=None, # Default
            cost=price_val # Or 0 if price_level is not applicable
        )
    else:
        error_detail = f"Invalid idea_type: '{request_data.idea_type}'. Supported types are: accommodation, activity, eating, sightseeing, travel."
        logger.warn(f"Request for '{request_data.address}': {error_detail}")
        raise HTTPException(status_code=400, detail=error_detail)

    logger.info(f"Successfully processed request for '{request_data.address}'. Returning '{response_model.name}' of type '{request_data.idea_type}'.")
    return response_model

app.include_router(router)

