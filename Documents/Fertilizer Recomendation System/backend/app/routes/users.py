from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from backend.app.models import UserProfileUpdate, PasswordUpdate
from backend.app.database import users_collection, predictions_collection
from backend.app.auth import get_current_user, hash_password, verify_password

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Fetch current user's profile details."""
    # Compute active predictions count
    pred_count = await predictions_collection.count_documents({"user_id": current_user["_id"]})
    
    # Refresh prediction count in user record just in case
    await users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"prediction_count": pred_count}}
    )
    
    return {
        "id": current_user["_id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "phone": current_user["phone"],
        "location": current_user["location"],
        "role": current_user.get("role", "farmer"),
        "avatar": current_user.get("avatar"),
        "prediction_count": pred_count,
        "created_at": current_user.get("created_at")
    }

@router.put("/profile")
async def update_profile(profile_update: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    """Update profile fields (name, phone, location, avatar)."""
    update_data = {k: v for k, v in profile_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields provided for update."
        )
        
    await users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": update_data}
    )
    
    updated_user = await users_collection.find_one({"_id": ObjectId(current_user["_id"])})
    return {
        "status": "success",
        "message": "Profile updated successfully",
        "user": {
            "name": updated_user["name"],
            "phone": updated_user["phone"],
            "location": updated_user["location"],
            "avatar": updated_user.get("avatar")
        }
    }

@router.put("/profile/password")
async def update_password(pw_update: PasswordUpdate, current_user: dict = Depends(get_current_user)):
    """Change the user's password."""
    user = await users_collection.find_one({"_id": ObjectId(current_user["_id"])})
    
    if not verify_password(pw_update.current_password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The current password you entered is incorrect."
        )
        
    new_hash = hash_password(pw_update.new_password)
    await users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"password_hash": new_hash}}
    )
    
    return {"status": "success", "message": "Password changed successfully"}

@router.delete("/profile")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """Delete user profile and all associated prediction history."""
    user_id = current_user["_id"]
    
    # Delete prediction history
    await predictions_collection.delete_many({"user_id": user_id})
    
    # Delete user profile
    await users_collection.delete_one({"_id": ObjectId(user_id)})
    
    return {"status": "success", "message": "Account and prediction history deleted successfully."}
