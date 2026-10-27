import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load env variables from a .env file if it exists
load_dotenv()

class Settings(BaseSettings):
    # MongoDB settings
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "fertilizer_recommendation")
    
    # JWT authentication settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super_secret_fertilizer_key_99f2")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Weather settings
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")
    
    # Project Settings
    PROJECT_NAME: str = "Smart Fertilizer Recommendation API"
    VERSION: str = "1.0.0"

settings = Settings()
