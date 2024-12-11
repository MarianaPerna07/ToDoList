from fastapi import FastAPI
from app.routers import tasks
from app.database import engine
from app.models import Base
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  
        "https://d2h637jzvb28ce.cloudfront.net" 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(tasks.router)

@app.get("/")
def home():
    return {"message": "Tasks service for ToDoList Application"}