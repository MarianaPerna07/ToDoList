import os

# Definir as variáveis de ambiente para os testes
os.environ['DB_USER'] = 'mariana'
os.environ['DB_PASSWORD'] = '1234'
os.environ['DB_HOST'] = 'localhost'
os.environ['DB_NAME'] = 'todolist'
os.environ['DB_PORT'] = '3306'

import pytest
from app.database import engine, SessionLocal
from app.models import Base
from fastapi.testclient import TestClient
from app.main import app  

client = TestClient(app)

@pytest.fixture(scope="function", autouse=True)
def setup_and_teardown_db():
    # Cria as tabelas no banco de dados
    Base.metadata.create_all(bind=engine)
    yield  # Executa o teste
    # Apaga as tabelas após a execução do teste
    Base.metadata.drop_all(bind=engine)

def test_create_task():
    response = client.post("/tasks/", json={"title": "Task 1", "description": "First task"})
    assert response.status_code == 201
    assert response.json()["title"] == "Task 1"

def test_get_task_when_exists():
    # Cria uma task antes de tentar obter
    client.post("/tasks/", json={"title": "Task 1", "description": "First task"})
    response = client.get("/tasks/1")
    assert response.status_code == 200
    assert response.json()["title"] == "Task 1"

def test_get_task_when_not_exist():
    # Tenta obter uma task que não existe
    response = client.get("/tasks/1")
    assert response.status_code == 404

def test_complete_task():
    # Cria uma task antes de tentar completá-la
    client.post("/tasks/", json={"title": "Task 1", "description": "First task"})
    response = client.put("/tasks/1/complete")
    assert response.status_code == 200
    assert response.json()["is_completed"] == 1
