import motor.motor_asyncio
from backend.app.config import settings

# Initialize Motor Client
client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]

# Collections
users_collection = db["users"]
predictions_collection = db["predictions"]
fertilizers_collection = db["fertilizers"]
analytics_collection = db["analytics"]
model_metrics_collection = db["model_metrics"]

async def init_db():
    """
    Initialize database collections and unique indexes
    """
    try:
        # Create unique index for user email
        await users_collection.create_index("email", unique=True)
        # Create index for predictions user_id
        await predictions_collection.create_index("user_id")
        # Create unique index for fertilizer name
        await fertilizers_collection.create_index("name", unique=True)
        print("Database indexes created successfully.")
    except Exception as e:
        print(f"Error initializing indexes: {e}")
