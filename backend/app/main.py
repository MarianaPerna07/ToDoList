from fastapi import FastAPI
from app.routers import tasks
from app.database import engine
from app.models import Base

app = FastAPI()

# Cria as tabelas no banco de dados
Base.metadata.create_all(bind=engine)

# Inclui o router para as operações das tasks
app.include_router(tasks.router)

@app.get("/")
def home():
    return {"message": "Tasks service for ToDoList Application"}

