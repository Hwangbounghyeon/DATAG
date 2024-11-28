from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from routers import cls_router, det_router
from configs.mongodb import mongo_url


app = FastAPI(
    root_path="/dl"
)

main_router = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins = [mongo_url, "http://localhost:8000"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

main_router.include_router(cls_router.router)
main_router.include_router(det_router.router)

app.include_router(main_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

import uvicorn

if __name__ == "__main__":
    uvicorn.run(app, port=8001)
