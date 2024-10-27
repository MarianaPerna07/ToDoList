from fastapi import FastAPI
from app.routers import tasks
from app.database import engine
from app.models import Base
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables in the database
Base.metadata.create_all(bind=engine)

# Include the router for task operations
app.include_router(tasks.router)

@app.get("/")
def home():
    return {"message": "Tasks service for ToDoList Application"}
