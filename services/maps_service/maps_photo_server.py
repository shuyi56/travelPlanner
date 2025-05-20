import os
import requests
from fastapi import FastAPI, Query, HTTPException, Request, Path, APIRouter
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

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

app.include_router(router)

