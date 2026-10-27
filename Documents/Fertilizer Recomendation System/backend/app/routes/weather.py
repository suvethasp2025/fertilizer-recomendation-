from fastapi import APIRouter, Query
from typing import Optional
import requests
from backend.app.config import settings

router = APIRouter(prefix="/api/weather", tags=["Weather Integration"])

@router.get("")
async def get_weather(
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    city: Optional[str] = Query(None)
):
    """Retrieve localized temperature, humidity, and farming recommendations."""
    api_key = settings.WEATHER_API_KEY
    
    # Try actual API call if key is set
    if api_key and (city or (lat is not None and lon is not None)):
        try:
            if city:
                url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
            else:
                url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
                
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                temp = data["main"]["temp"]
                humidity = data["main"]["humidity"]
                desc = data["weather"][0]["description"].title()
                place_name = data["name"]
                
                # Derive agricultural suggestions based on weather conditions
                soil_moisture = "Optimal (40%)" if humidity > 50 else "Dry (25%)"
                advice = "Perfect temperature for applying fertilizer. Ensure soil moisture is active."
                if temp > 35:
                    advice = "High heat conditions. Avoid adding urea today as it will volatilize into gas rapidly."
                elif temp < 15:
                    advice = "Cool conditions. Fertilizer absorption will be slower. Restrict dosage."
                if "rain" in desc.lower():
                    advice = "Rain expected. Do not broadcast granular fertilizers on surface as they will wash away."
                    soil_moisture = "Wet (65%)"
                    
                return {
                    "source": "OpenWeatherMap",
                    "location": place_name,
                    "temperature": temp,
                    "humidity": humidity,
                    "condition": desc,
                    "soil_moisture_estimate": soil_moisture,
                    "description": advice,
                    "forecast": [
                        {"day": "Today", "temp": int(temp), "condition": desc},
                        {"day": "Tomorrow", "temp": int(temp + 1), "condition": "Cloudy"},
                        {"day": "Next Day", "temp": int(temp - 1), "condition": "Rainy"}
                    ]
                }
        except Exception:
            pass # fallback if API call fails
            
    # Standard fallback mock response if no API key or request fails
    loc_name = city if city else "Farming Region"
    return {
        "source": "Simulated Agro-Forecast",
        "location": loc_name,
        "temperature": 27.8,
        "humidity": 58,
        "condition": "Clear Sky",
        "soil_moisture_estimate": "Optimal (36%)",
        "description": "Favorable mild temperature and average humidity. Excellent window for fertilizer treatment.",
        "forecast": [
            {"day": "Today", "temp": 28, "condition": "Sunny"},
            {"day": "Tomorrow", "temp": 29, "condition": "Partly Cloudy"},
            {"day": "Next Day", "temp": 26, "condition": "Moderate Rain"}
        ]
    }
