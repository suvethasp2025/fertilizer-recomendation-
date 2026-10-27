from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime
from pymongo.errors import DuplicateKeyError

from backend.app.models import UserSignup, UserLogin, Token
from backend.app.database import users_collection
from backend.app.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/signup", response_model=dict, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserSignup):
    """Register a new user in the system."""
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
        
    user_dict = user_in.model_dump()
    user_dict["password_hash"] = hash_password(user_dict.pop("password"))
    user_dict["created_at"] = datetime.utcnow()
    user_dict["avatar"] = f"https://api.dicebear.com/7.x/adventurer/svg?seed={user_in.name.replace(' ', '')}"
    user_dict["prediction_count"] = 0
    
    try:
        result = await users_collection.insert_one(user_dict)
        return {"status": "success", "message": "User registered successfully", "id": str(result.inserted_id)}
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """OAuth2-compatible login flow, returns JWT access token."""
    user = await users_collection.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": user["email"], "role": user.get("role", "farmer")})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.get("role", "farmer"),
        "name": user["name"]
    }

@router.post("/login-json", response_model=Token)
async def login_json(credentials: UserLogin):
    """JSON-based login endpoint for easier frontend client integrations."""
    user = await users_collection.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": user["email"], "role": user.get("role", "farmer")})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.get("role", "farmer"),
        "name": user["name"]
    }
