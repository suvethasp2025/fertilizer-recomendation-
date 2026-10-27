from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from bson import ObjectId

from backend.app.models import FertilizerItem
from backend.app.database import fertilizers_collection

router = APIRouter(prefix="/api/fertilizers", tags=["Fertilizers"])

@router.get("", response_model=dict)
async def get_fertilizers(
    page: int = Query(1, ge=1),
    limit: int = Query(9, ge=1, le=50),
    search: Optional[str] = Query(None),
    soil_type: Optional[str] = Query(None),
    crop_type: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("name"), # "name", "price"
    sort_order: int = Query(1) # 1 for Ascending, -1 for Descending
):
    """Retrieve fertilizers catalog with paginated search, filter, and sort options."""
    query = {}
    
    # Text Search on Name/Description
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
        
    # Filters
    if soil_type:
        query["suitable_soil"] = {"$regex": soil_type, "$options": "i"}
    if crop_type:
        query["suitable_crops"] = {"$regex": crop_type, "$options": "i"}
        
    # Sorting
    sort_field = sort_by if sort_by in ["name", "price"] else "name"
    
    # Calculate skip
    skip = (page - 1) * limit
    
    # Execute query
    cursor = fertilizers_collection.find(query).sort(sort_field, sort_order).skip(skip).limit(limit)
    total_count = await fertilizers_collection.count_documents(query)
    
    fertilizers_list = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        fertilizers_list.append(doc)
        
    return {
        "fertilizers": fertilizers_list,
        "total": total_count,
        "page": page,
        "limit": limit,
        "pages": (total_count + limit - 1) // limit
    }

@router.get("/{fertilizer_id}", response_model=FertilizerItem)
async def get_fertilizer_by_id(fertilizer_id: str):
    """Fetch details of a single fertilizer by ID."""
    try:
        doc = await fertilizers_collection.find_one({"_id": ObjectId(fertilizer_id)})
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fertilizer not found."
            )
        doc["id"] = str(doc.pop("_id"))
        return FertilizerItem(**doc)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid fertilizer ID format."
        )
