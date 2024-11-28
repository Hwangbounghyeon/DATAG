from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

mongo_url = os.getenv("MONGO_URL")
client = AsyncIOMotorClient(mongo_url)
database = client.get_database("S11P31S108")

async def get_database_mongodb():
    try:
        await client.admin.command('ping')
        print("Successfully connected to MongoDB")
        return database
    except Exception as e:
        print(e)