import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import requests # For requests.exceptions.RequestException
import os

# Set a dummy API key for testing if it's checked during app initialization
os.environ["VITE_GOOGLE_MAPS_API_KEY"] = "test_api_key"

# Assuming your FastAPI app instance is named 'app' and models are importable
from services.maps_service.maps_photo_server import (
    app,
    MapsPhotoRequest,
    EatingIdea,
    AccommodationIdea,
    ActivityIdea,
    SightseeingIdea,
    TravelIdea,
    DifficultyLevel,
    IdeaResponse # Though individual types are more specific for assertions
)

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

# --- Mock Google Places API Responses ---

def mock_google_api_response(status="OK", results=None, error_message=None):
    """Helper to create mock Google API JSON responses."""
    response = MagicMock()
    response.status_code = 200
    json_data = {"status": status}
    if results is not None:
        json_data["results"] = results
    if error_message is not None:
        json_data["error_message"] = error_message
    
    response.json = MagicMock(return_value=json_data)
    
    # Mock raise_for_status for non-200 internal Google statuses if necessary,
    # but typically Google returns 200 OK with an error status string in JSON.
    # If Google itself returned a non-200, raise_for_status would trigger.
    # For now, we assume Google returns 200, and 'status' in JSON indicates the actual outcome.
    def raise_for_status():
        if response.status_code >= 400 : # Simplified check
             raise requests.exceptions.HTTPError(f"Mock HTTP Error {response.status_code}")
    response.raise_for_status = MagicMock(side_effect=raise_for_status)
    return response

# --- Test Cases ---

@patch('services.maps_service.maps_photo_server.requests.get')
def test_get_details_eating_idea_success(mock_requests_get, client):
    request_payload = {"address": "Test Restaurant", "idea_type": "eating"}
    
    mock_google_result = {
        "name": "Test Restaurant Name",
        "formatted_address": "123 Test St, Test City",
        "photos": [{"photo_reference": "ref123"}, {"photo_reference": "ref456"}],
        "price_level": 2, # Google's 0-4 scale
        "types": ["restaurant", "food"],
        "rating": 4.5,
        "user_ratings_total": 100
    }
    mock_requests_get.return_value = mock_google_api_response(results=[mock_google_result])

    response = client.post("/api/maps/details", json=request_payload)

    assert response.status_code == 200
    data = response.json()
    
    assert data["name"] == "Test Restaurant Name"
    assert data["address"] == "123 Test St, Test City"
    assert data["photos"] == ["ref123", "ref456"]
    assert data["price"] == 2 
    assert data["cuisine"] == "Restaurant" # Based on "types"
    assert "notes" in data # Default note should be present
    # Validate with Pydantic model
    eating_idea = EatingIdea(**data)
    assert eating_idea.name == "Test Restaurant Name"

@patch('services.maps_service.maps_photo_server.requests.get')
def test_get_details_accommodation_idea_success(mock_requests_get, client):
    request_payload = {"address": "Test Hotel", "idea_type": "accommodation"}
    
    mock_google_result = {
        "name": "Test Hotel Name",
        "formatted_address": "456 Test Ave, Test City",
        "photos": [{"photo_reference": "hotel_ref1"}],
        "price_level": 3 
    }
    mock_requests_get.return_value = mock_google_api_response(results=[mock_google_result])

    response = client.post("/api/maps/details", json=request_payload)

    assert response.status_code == 200
    data = response.json()

    assert data["name"] == "Test Hotel Name"
    assert data["address"] == "456 Test Ave, Test City"
    assert data["photos"] == ["hotel_ref1"]
    assert data["price"] == 3
    assert data["type"] == "Hotel" # Default type for accommodation
    assert data["checkIn"] is None
    assert data["checkOut"] is None
    # Validate with Pydantic model
    accommodation_idea = AccommodationIdea(**data)
    assert accommodation_idea.name == "Test Hotel Name"

@patch('services.maps_service.maps_photo_server.requests.get')
def test_get_details_activity_idea_success(mock_requests_get, client):
    request_payload = {"address": "Test Park", "idea_type": "activity"}
    mock_google_result = {
        "name": "Test Park Name",
        "formatted_address": "789 Test Lane, Test City",
        "price_level": 1
    }
    mock_requests_get.return_value = mock_google_api_response(results=[mock_google_result])
    response = client.post("/api/maps/details", json=request_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Park Name"
    assert data["location"] == "789 Test Lane, Test City"
    assert data["price"] == 1
    assert data["difficulty"] == DifficultyLevel.EASY.value # Default
    activity_idea = ActivityIdea(**data)
    assert activity_idea.name == "Test Park Name"

@patch('services.maps_service.maps_photo_server.requests.get')
def test_get_details_sightseeing_idea_success(mock_requests_get, client):
    request_payload = {"address": "Test Museum", "idea_type": "sightseeing"}
    mock_google_result = {
        "name": "Test Museum Name",
        "formatted_address": "101 Test Blvd, Test City",
        "opening_hours": {"weekday_text": ["Monday: 9 AM - 5 PM", "Tuesday: 9 AM - 5 PM"]}
    }
    mock_requests_get.return_value = mock_google_api_response(results=[mock_google_result])
    response = client.post("/api/maps/details", json=request_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Museum Name"
    assert data["location"] == "101 Test Blvd, Test City"
    assert data["price"] == 0 # Default as price_level not in mock
    assert data["openingHours"] == "Monday: 9 AM - 5 PM, Tuesday: 9 AM - 5 PM"
    sightseeing_idea = SightseeingIdea(**data)
    assert sightseeing_idea.name == "Test Museum Name"

@patch('services.maps_service.maps_photo_server.requests.get')
def test_get_details_travel_idea_success(mock_requests_get, client):
    request_payload = {"address": "Point A", "idea_type": "travel"}
    # Travel idea uses the place_details for 'name' if available, but other fields are defaults
    mock_google_result = {
        "name": "Point A Details", # This might be used for the TravelIdea's name
        "formatted_address": "Some address for Point A" 
    }
    mock_requests_get.return_value = mock_google_api_response(results=[mock_google_result])
    response = client.post("/api/maps/details", json=request_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Point A Details" # or "Travel Idea" if name was not in mock
    assert data["transportType"] == "Car" # Default
    assert data["from_address"] == "" # Default
    assert data["to_address"] == ""   # Default
    assert data["cost"] == 0 # Default as price_level not in mock
    travel_idea = TravelIdea(**data)
    assert travel_idea.name == "Point A Details"


@patch('services.maps_service.maps_photo_server.requests.get')
def test_get_details_zero_results(mock_requests_get, client):
    request_payload = {"address": "Non Existent Place", "idea_type": "eating"}
    mock_requests_get.return_value = mock_google_api_response(status="ZERO_RESULTS")

    response = client.post("/api/maps/details", json=request_payload)

    assert response.status_code == 404
    assert "No places found" in response.json()["detail"]

@patch('services.maps_service.maps_photo_server.requests.get')
def test_get_details_google_api_error_status(mock_requests_get, client):
    request_payload = {"address": "Test Place", "idea_type": "eating"}
    mock_requests_get.return_value = mock_google_api_response(status="REQUEST_DENIED", error_message="API key invalid.")

    response = client.post("/api/maps/details", json=request_payload)

    assert response.status_code == 500
    assert "Google Places API error: REQUEST_DENIED - API key invalid." in response.json()["detail"]

@patch('services.maps_service.maps_photo_server.requests.get')
def test_get_details_network_error(mock_requests_get, client):
    request_payload = {"address": "Test Place", "idea_type": "eating"}
    mock_requests_get.side_effect = requests.exceptions.RequestException("Network error")

    response = client.post("/api/maps/details", json=request_payload)

    assert response.status_code == 503
    assert "Error connecting to Google Places API: Network error" in response.json()["detail"]

def test_get_details_invalid_idea_type(client):
    request_payload = {"address": "Test Place", "idea_type": "InvalidIdeaType"}
    response = client.post("/api/maps/details", json=request_payload)

    assert response.status_code == 400
    assert "Invalid idea_type: 'InvalidIdeaType'" in response.json()["detail"]

@patch('services.maps_service.maps_photo_server.requests.get')
def test_get_details_photo_references_handled(mock_requests_get, client):
    request_payload = {"address": "Place With Photos", "idea_type": "sightseeing"}
    mock_google_result = {
        "name": "Photo Place",
        "formatted_address": "1 Photo Rd",
        "photos": [
            {"photo_reference": "photo1"}, 
            {"photo_reference": None}, # Should be skipped
            {"other_field": "value"}, # Should be skipped
            {"photo_reference": "photo2"}
        ]
    }
    mock_requests_get.return_value = mock_google_api_response(results=[mock_google_result])

    response = client.post("/api/maps/details", json=request_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Photo Place"
    assert data["photos"] == ["photo1", "photo2"]

@patch('services.maps_service.maps_photo_server.requests.get')
def test_get_details_no_results_in_response_array(mock_requests_get, client):
    request_payload = {"address": "Empty Results Array", "idea_type": "eating"}
    # Google API returns "OK" but an empty "results" list
    mock_requests_get.return_value = mock_google_api_response(status="OK", results=[])

    response = client.post("/api/maps/details", json=request_payload)

    assert response.status_code == 404
    assert "No results found in Google Places API response" in response.json()["detail"]

@patch('services.maps_service.maps_photo_server.requests.get')
def test_get_details_cuisine_inference_eating_idea(mock_requests_get, client):
    request_payload = {"address": "Test Cafe", "idea_type": "eating"}
    
    # Test case 1: "cafe" type
    mock_google_result_cafe = {
        "name": "Test Cafe Name", "formatted_address": "123 Cafe St", "types": ["cafe", "food", "establishment"]
    }
    mock_requests_get.return_value = mock_google_api_response(results=[mock_google_result_cafe])
    response_cafe = client.post("/api/maps/details", json=request_payload)
    assert response_cafe.status_code == 200
    data_cafe = response_cafe.json()
    assert data_cafe["cuisine"] == "Cafe"

    # Test case 2: "bakery" type
    mock_google_result_bakery = {
        "name": "Test Bakery Name", "formatted_address": "123 Bakery St", "types": ["bakery", "food"]
    }
    mock_requests_get.return_value = mock_google_api_response(results=[mock_google_result_bakery])
    response_bakery = client.post("/api/maps/details", json=request_payload)
    assert response_bakery.status_code == 200
    data_bakery = response_bakery.json()
    assert data_bakery["cuisine"] == "Bakery"

    # Test case 3: No specific food type, defaults to "Restaurant"
    mock_google_result_generic = {
        "name": "Generic Place", "formatted_address": "123 Generic St", "types": ["store", "establishment"]
    }
    mock_requests_get.return_value = mock_google_api_response(results=[mock_google_result_generic])
    response_generic = client.post("/api/maps/details", json=request_payload)
    assert response_generic.status_code == 200
    data_generic = response_generic.json()
    assert data_generic["cuisine"] == "Restaurant" # Default

@patch('services.maps_service.maps_photo_server.requests.get')
def test_get_details_default_price_if_no_price_level(mock_requests_get, client):
    request_payload = {"address": "Free Attraction", "idea_type": "sightseeing"}
    mock_google_result = {
        "name": "Free Attraction Name",
        "formatted_address": "123 Free St"
        # No price_level field
    }
    mock_requests_get.return_value = mock_google_api_response(results=[mock_google_result])
    response = client.post("/api/maps/details", json=request_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["price"] == 0 # Should default to 0
