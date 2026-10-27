import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from bson import ObjectId
from datetime import datetime
import shutil

from backend.app.database import users_collection, fertilizers_collection, model_metrics_collection, predictions_collection
from backend.app.auth import get_current_admin
from backend.app.models import FertilizerItem
from backend.app.ml.train import train_and_evaluate

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])

@router.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...), current_admin: dict = Depends(get_current_admin)):
    """Upload a new CSV dataset file to replace the current ML model training data."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a CSV file."
        )
        
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_path = os.path.join(current_dir, "ml", "data", "fertilizer_prediction.csv")
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    
    # Save the file
    try:
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"status": "success", "message": "Dataset uploaded successfully. You can now retrain the model."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save dataset: {str(e)}"
        )

@router.post("/retrain-model")
async def retrain_model(current_admin: dict = Depends(get_current_admin)):
    """Retrain the machine learning models and save the new training metrics to database."""
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(current_dir, "ml", "data", "fertilizer_prediction.csv")
    output_dir = os.path.join(current_dir, "ml")
    
    if not os.path.exists(data_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training dataset CSV not found. Please upload a dataset first."
        )
        
    try:
        # Run ML training script synchronously (fast on this dataset size)
        metrics = train_and_evaluate(data_path, output_dir)
        
        # Save metrics to MongoDB
        metric_doc = {
            "model_name": metrics["model_name"],
            "accuracy": metrics["accuracy"],
            "precision": metrics["precision"],
            "recall": metrics["recall"],
            "f1": metrics["f1"],
            "cv_accuracy": metrics["cv_accuracy"],
            "trained_at": datetime.utcnow(),
            "trained_by": current_admin["name"]
        }
        
        result = await model_metrics_collection.insert_one(metric_doc)
        metrics["id"] = str(result.inserted_id)
        
        return {
            "status": "success",
            "message": "Model retrained successfully",
            "metrics": metrics
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model retraining failed: {str(e)}"
        )

# User Management Endpoints
@router.get("/users")
async def get_all_users(current_admin: dict = Depends(get_current_admin)):
    """Fetch a list of all registered users in the system."""
    cursor = users_collection.find({}, {"password_hash": 0}).sort("created_at", -1)
    users_list = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        users_list.append(doc)
    return users_list

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_admin: dict = Depends(get_current_admin)):
    """Delete a user profile and all their prediction records."""
    if user_id == current_admin["_id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admins cannot delete their own accounts from this panel."
        )
        
    # Delete predictions
    await predictions_collection.delete_many({"user_id": user_id})
    # Delete user profile
    result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
        
    return {"status": "success", "message": "User and history deleted successfully."}

# Fertilizer Catalog Management Endpoints
@router.post("/fertilizers", response_model=FertilizerItem)
async def create_fertilizer(item: FertilizerItem, current_admin: dict = Depends(get_current_admin)):
    """Add a new fertilizer to the database library."""
    fert_dict = item.model_dump(exclude=["id"])
    
    # Check if fertilizer with same name already exists
    existing = await fertilizers_collection.find_one({"name": item.name})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A fertilizer with this name already exists in catalog."
        )
        
    result = await fertilizers_collection.insert_one(fert_dict)
    fert_dict["id"] = str(result.inserted_id)
    return FertilizerItem(**fert_dict)

@router.put("/fertilizers/{fertilizer_id}", response_model=FertilizerItem)
async def update_fertilizer(fertilizer_id: str, item: FertilizerItem, current_admin: dict = Depends(get_current_admin)):
    """Modify details of an existing fertilizer in the catalog."""
    fert_dict = item.model_dump(exclude=["id"])
    
    result = await fertilizers_collection.find_one_and_update(
        {"_id": ObjectId(fertilizer_id)},
        {"$set": fert_dict},
        return_document=True
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fertilizer not found."
        )
        
    result["id"] = str(result.pop("_id"))
    return FertilizerItem(**result)

@router.delete("/fertilizers/{fertilizer_id}")
async def delete_fertilizer(fertilizer_id: str, current_admin: dict = Depends(get_current_admin)):
    """Remove a fertilizer from the database library."""
    result = await fertilizers_collection.delete_one({"_id": ObjectId(fertilizer_id)})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fertilizer not found."
        )
    return {"status": "success", "message": "Fertilizer deleted from catalog."}
