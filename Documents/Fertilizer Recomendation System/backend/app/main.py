from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.config import settings
from backend.app.database import init_db, fertilizers_collection
from backend.app.routes import auth, users, predict, fertilizers, history, dashboard, analytics, admin, weather

# Seed data for initial fertilizer catalog
SEED_FERTILIZERS = [
    {
        "name": "Urea",
        "description": "Urea is an organic compound with the chemical formula CO(NH2)2. It is a highly popular nitrogenous fertilizer that provides crops with an immediate source of nitrogen, promoting robust leafy growth and chlorophyll formation.",
        "suitable_crops": ["Maize", "Paddy", "Wheat", "Sugarcane", "Cotton", "Millets"],
        "suitable_soil": ["Sandy", "Loamy", "Clayey", "Black", "Red"],
        "npk_ratio": "46-0-0",
        "usage": "Used primarily to supply nitrogen to crops during active vegetative growth phases.",
        "application_method": "Top-dressing or broadcasting on the soil surface, followed immediately by irrigation or incorporation to avoid ammonia gas losses.",
        "advantages": [
            "Provides a high concentration of nitrogen (46%)",
            "Easy to store, handle and transport",
            "Highly soluble in water for quick uptake"
        ],
        "disadvantages": [
            "Can volatilize into air if left on dry surface",
            "Acidifies the soil with repeated long-term use",
            "Can burn seeds if placed in direct contact"
        ],
        "best_season": "Spring and monsoon active growth periods",
        "dosage": "50-100 kg per acre depending on crop requirement",
        "price": 12.50,
        "manufacturer": "AgroCorp Industries Ltd",
        "image": "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=500&auto=format&fit=crop&q=60"
    },
    {
        "name": "DAP",
        "description": "Diammonium Phosphate (DAP) is the world's most widely used phosphorus fertilizer. It supplies highly soluble nitrogen and phosphorus nutrients to encourage excellent root development and early plant establishment.",
        "suitable_crops": ["Sugarcane", "Wheat", "Paddy", "Cotton", "Pulses", "Ground Nuts", "Maize"],
        "suitable_soil": ["Loamy", "Red", "Black", "Clayey"],
        "npk_ratio": "18-46-0",
        "usage": "Applied at sowing or seedling transplanting stages to ensure early phosphorus uptake.",
        "application_method": "Band placement slightly below and to the side of seeds.",
        "advantages": [
            "High concentration of plant-available phosphorus (46%)",
            "Provides initial nitrogen boost (18%)",
            "Improves root development and seedling vigor"
        ],
        "disadvantages": [
            "Temporary local pH increase can release free ammonia, harming seeds",
            "Phosphorus can bind with soil minerals in highly alkaline soils"
        ],
        "best_season": "Sowing season",
        "dosage": "40-80 kg per acre",
        "price": 18.00,
        "manufacturer": "FertileSoil Chemical Co.",
        "image": "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=500&auto=format&fit=crop&q=60"
    },
    {
        "name": "14-35-14",
        "description": "A premium complex NPK fertilizer packed with a high ratio of phosphorus and moderate amounts of nitrogen and potassium. Perfect for crop root structure strengthening and fruit budding.",
        "suitable_crops": ["Cotton", "Barley", "Ground Nuts", "Millets", "Oil seeds"],
        "suitable_soil": ["Black", "Red", "Sandy", "Loamy"],
        "npk_ratio": "14-35-14",
        "usage": "Used to establish strong root structures and enhance immunity in mid-season crops.",
        "application_method": "Basal application mixed with soil during planting.",
        "advantages": [
            "Extremely high phosphorus content",
            "Perfect for tuber and root crops",
            "Balanced nitrogen and potassium support immunity"
        ],
        "disadvantages": [
            "More expensive than straight single-nutrient bags",
            "Slower nitrogen delivery"
        ],
        "best_season": "Early planting / Transplanting",
        "dosage": "75-100 kg per acre",
        "price": 22.00,
        "manufacturer": "N-P-K Premium Agro",
        "image": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&auto=format&fit=crop&q=60"
    },
    {
        "name": "28-28",
        "description": "An equal-ratio nitrogen and phosphorus fertilizer (28-28-0) designed for soils that lack both N and P. High-grade granules dissolve easily in damp soil, delivering instant nourishment.",
        "suitable_crops": ["Wheat", "Millets", "Paddy", "Sugarcane", "Tobacco", "Oil seeds"],
        "suitable_soil": ["Sandy", "Clayey", "Black", "Loamy"],
        "npk_ratio": "28-28-0",
        "usage": "Recommended for grain and cereal crops during the tillering and vegetative growth phases.",
        "application_method": "Split application: half as basal, half as top dressing.",
        "advantages": [
            "High concentration of both nitrogen and phosphorus",
            "Increases crop tillering and grain size",
            "Quick dissolving granules"
        ],
        "disadvantages": [
            "Does not contain Potassium; supplementary K may be needed",
            "Higher leaching potential in sandy soils under heavy rain"
        ],
        "best_season": "Mid-vegetative growth",
        "dosage": "50-75 kg per acre",
        "price": 16.50,
        "manufacturer": "GreenFields Minerals",
        "image": "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=500&auto=format&fit=crop&q=60"
    },
    {
        "name": "17-17-17",
        "description": "A fully balanced complex fertilizer containing equal ratios (17%) of Nitrogen, Phosphorus, and Potassium. It offers standard, universal nourishment to crops of all types.",
        "suitable_crops": ["Barley", "Maize", "Ground Nuts", "Sugarcane", "Wheat", "Paddy"],
        "suitable_soil": ["Red", "Sandy", "Loamy", "Clayey"],
        "npk_ratio": "17-17-17",
        "usage": "Broad-spectrum plant maintenance and crop feeding throughout all growth stages.",
        "application_method": "Broadcasting or side-dressing near crop rows.",
        "advantages": [
            "Perfect nutrient balance",
            "Improves crop quality, shelf-life, and resistance to cold/heat stress",
            "Universal compatibility with all crops"
        ],
        "disadvantages": [
            "Higher price than straight single fertilizers",
            "May supply excess nutrients if soil already has specific rich elements"
        ],
        "best_season": "Early and mid-growth periods",
        "dosage": "60-90 kg per acre",
        "price": 20.00,
        "manufacturer": "Universal Agro Chemicals",
        "image": "https://images.unsplash.com/photo-1574375927938-d5a98e8edd85?w=500&auto=format&fit=crop&q=60"
    },
    {
        "name": "20-20",
        "description": "A popular ammonium phosphate sulfate fertilizer (20-20-0) enriched with sulfur. It stimulates early crop growth, improves protein synthesis, and enhances seed yields.",
        "suitable_crops": ["Sugarcane", "Paddy", "Wheat", "Millets", "Oil seeds", "Pulses"],
        "suitable_soil": ["Clayey", "Loamy", "Black", "Red"],
        "npk_ratio": "20-20-0",
        "usage": "Supplies nitrogen, phosphorus, and vital sulfur to sulfur-deficient soils.",
        "application_method": "Incorporated into the topsoil prior to sowing or applied as top dressing.",
        "advantages": [
            "Enriched with sulfur for protein synthesis",
            "Promotes crop chlorophyll levels",
            "Extremely stable in soil, minimal leaching"
        ],
        "disadvantages": [
            "No Potassium content included"
        ],
        "best_season": "Sowing and mid-growth",
        "dosage": "50-80 kg per acre",
        "price": 15.00,
        "manufacturer": "Sulfur-Agro Fertilizers Ltd",
        "image": "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?w=500&auto=format&fit=crop&q=60"
    },
    {
        "name": "10-26-26",
        "description": "A potassium-rich compound NPK fertilizer designed for tuber, root, and fruit-bearing crops. Supplies high levels of potassium to strengthen plants against diseases and environmental stresses.",
        "suitable_crops": ["Ground Nuts", "Barley", "Wheat", "Paddy", "Pulses", "Tobacco"],
        "suitable_soil": ["Sandy", "Red", "Clayey", "Loamy"],
        "npk_ratio": "10-26-26",
        "usage": "Root growth stimulation, water-use regulation, and fruit quality enhancement.",
        "application_method": "Basal dressing during planting or top-dressing close to mature root zones.",
        "advantages": [
            "Extremely high Potassium (26%) for cell wall strength and water retention",
            "High Phosphorus (26%) supports fruit/grain sizing",
            "Improves disease and pest immunity"
        ],
        "disadvantages": [
            "Low nitrogen content; might require secondary top dressing of nitrogen during leafy growth"
        ],
        "best_season": "Mid-growth and flowering/fruiting stage",
        "dosage": "80-120 kg per acre",
        "price": 24.50,
        "manufacturer": "Apex Agro Minerals",
        "image": "https://images.unsplash.com/photo-1463123081488-729f511726f5?w=500&auto=format&fit=crop&q=60"
    }
]

async def seed_database():
    """Seed default fertilizers if collection is empty."""
    count = await fertilizers_collection.count_documents({})
    if count == 0:
        print("Fertilizer catalog is empty. Seeding database...")
        await fertilizers_collection.insert_many(SEED_FERTILIZERS)
        print(f"Database successfully seeded with {len(SEED_FERTILIZERS)} fertilizer records.")
    else:
        print("Fertilizer catalog already seeded.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events manager for the database connection and seeding."""
    # Run on Startup
    await init_db()
    await seed_database()
    yield
    # Run on Shutdown
    print("Shutting down API server...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS configuration to allow cross-origin communication from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(predict.router)
app.include_router(fertilizers.router)
app.include_router(history.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(admin.router)
app.include_router(weather.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Welcome to the Smart Fertilizer Recommendation API",
        "version": settings.VERSION
    }
