from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Auth Schemas
class UserSignup(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: str = Field(..., pattern=r"^\+?[1-9]\d{1,14}$") # E.164 phone validation format
    location: str = Field(..., min_length=2)
    role: str = Field("farmer", pattern="^(farmer|admin)$")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str

# Profile Schemas
class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=50)
    phone: Optional[str] = Field(None, pattern=r"^\+?[1-9]\d{1,14}$")
    location: Optional[str] = Field(None, min_length=2)
    avatar: Optional[str] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

# Prediction Schemas
class PredictionRequest(BaseModel):
    temperature: float = Field(..., ge=0, le=60)
    humidity: float = Field(..., ge=0, le=100)
    moisture: float = Field(..., ge=0, le=100)
    nitrogen: float = Field(..., ge=0, le=200)
    potassium: float = Field(..., ge=0, le=200)
    phosphorous: float = Field(..., ge=0, le=200)
    soil_type: str = Field(..., pattern="^(Sandy|Loamy|Black|Red|Clayey)$")
    crop_type: str = Field(..., pattern="^(Maize|Sugarcane|Cotton|Tobacco|Paddy|Barley|Wheat|Millets|Oil seeds|Pulses|Ground Nuts)$")

class FertilizerExplanation(BaseModel):
    why_this: str
    application_method: str
    advantages: List[str]
    disadvantages: List[str]
    npk_ratio: str
    organic_alternatives: List[str]
    safety_tips: List[str]

class PredictionResponse(BaseModel):
    id: str
    recommended_fertilizer: str
    confidence: float
    probability: Dict[str, float]
    inputs: Dict[str, Any]
    explanation: FertilizerExplanation
    timestamp: datetime

# Fertilizer Library Schemas
class FertilizerItem(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    suitable_crops: List[str]
    suitable_soil: List[str]
    npk_ratio: str
    usage: str
    application_method: str
    advantages: List[str]
    disadvantages: List[str]
    best_season: str
    dosage: str
    price: Optional[float] = None
    manufacturer: Optional[str] = None
    image: Optional[str] = None

# Dashboard & Analytics Schemas
class QuickStats(BaseModel):
    total_predictions: int
    today_predictions: int
    most_recommended_fertilizer: str
    most_selected_crop: str
    most_selected_soil: str
    average_confidence: float
    model_accuracy: float

class DashboardData(BaseModel):
    stats: QuickStats
    recent_predictions: List[Dict[str, Any]]
    weather: Dict[str, Any]

class AnalyticsData(BaseModel):
    prediction_trend: List[Dict[str, Any]] # Monthly/weekly predictions count
    crop_distribution: List[Dict[str, Any]] # Pie chart data
    soil_distribution: List[Dict[str, Any]] # Bar chart data
    fertilizer_distribution: List[Dict[str, Any]] # Pie/Bar chart data
    npk_distribution: Dict[str, List[float]] # N, P, K averages
    active_users: int
    model_performance: Dict[str, Any]
