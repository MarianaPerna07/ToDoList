
# Project Documentation

This documentation outlines the critical components of the project, focusing on the logic implemented within the backend application, database configurations, and key functions.

## Project Structure and Key Components

### 1. **Backend API (FastAPI)**

The backend is structured around FastAPI, using SQLAlchemy as the ORM to interact with a MySQL database.
Below is a breakdown of the implemented logic:

#### Main Components:

- **app/main.py**: Entry point for the FastAPI application, where routers are registered, and the database schema is initialized.
- **app/models.py**: Contains database models structured using SQLAlchemy.
- **app/crud.py**: Core CRUD (Create, Read, Update, Delete) operations are implemented here.
- **app/schemas.py**: Defines Pydantic schemas for data validation and serialization.
- **app/routers/tasks.py**: API endpoints for managing tasks.

---

### 2. **Database Model (SQLAlchemy)**

The database model, defined in `app/models.py`, outlines the structure of the `Task` table.
```python
# app/models.py
from sqlalchemy import Column, Integer, String
from .database import Base

class Task(Base):
    __tablename__ = 'tasks'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String)
    is_completed = Column(Integer, default=0) 
```

- **`id`**: Primary key, auto-incrementing.
- **`title`**: Title of the task, required field.
- **`description`**: Optional text description of the task.
- **`is_completed`**: Marks the task's completion status (0 = not completed, 1 = completed).

---

### 3. **CRUD Operations in `crud.py`**

The `crud.py` file implements logic for handling tasks, using SQLAlchemy’s session management.

```python
from sqlalchemy.orm import Session
from app.models import Task

# Create a new task
def create_task(db: Session, title: str, description: str):
    db_task = Task(title=title, description=description)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

# Retrieve all tasks
def get_tasks(db: Session):
    return db.query(Task).all()

# Retrieve task by ID
def get_task(db: Session, task_id: int):
    return db.query(Task).filter(Task.id == task_id).first()

# Mark task as completed
def complete_task(db: Session, task_id: int):
    task = get_task(db, task_id)
    if task:
        task.is_completed = 1
        db.commit()
        db.refresh(task)
    return task
```

- **`create_task`**: Creates and commits a new `Task` entry.
- **`get_tasks`**: Retrieves all tasks from the database.
- **`get_task`**: Finds a task by its ID.
- **`complete_task`**: Sets `is_completed` to 1, indicating the task is completed.

---

### 4. **Pydantic Schemas**

The schemas (`schemas.py`) are used to validate input and output data. 

```python
from pydantic import BaseModel
from typing import Optional

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None

class Task(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    is_completed: int

    class Config:
        orm_mode = True  # Enables ORM compatibility for SQLAlchemy models
```

- **TaskCreate**: Schema for creating new tasks (only `title` is mandatory).
- **Task**: Schema for representing a complete task, including its ID and completion status.

---

### 5. **API Router for Task Management (`app/routers/tasks.py`)**

This router provides endpoints for managing tasks. The endpoints include:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db

router = APIRouter()

@router.post("/tasks/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db=db, title=task.title, description=task.description)

@router.get("/tasks/", response_model=list[schemas.Task])
def read_tasks(db: Session = Depends(get_db)):
    return crud.get_tasks(db)

@router.get("/tasks/{task_id}", response_model=schemas.Task)
def read_task(task_id: int, db: Session = Depends(get_db)):
    task = crud.get_task(db, task_id=task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/tasks/{task_id}/complete", response_model=schemas.Task)
def complete_task(task_id: int, db: Session = Depends(get_db)):
    task = crud.complete_task(db, task_id=task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
```

- **`/tasks/` (POST)**: Creates a new task.
- **`/tasks/` (GET)**: Retrieves all tasks.
- **`/tasks/{task_id}` (GET)**: Retrieves a task by its ID.
- **`/tasks/{task_id}/complete` (PUT)**: Marks a task as completed.

---

### 6. **Database Configuration (`database.py`)**

The database connection and session management are handled in `database.py`.

```python
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_name = os.getenv('DB_NAME')
db_port = os.getenv('DB_PORT')

DATABASE_URL = f'mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- **`DATABASE_URL`**: Constructs the database URL from environment variables.
- **`SessionLocal`**: Manages database sessions for FastAPI dependency injection.
- **`get_db`**: Dependency to create and close database sessions automatically.

---

### Troubleshooting and Common Errors

1. **Pydantic Compatibility**: Ensure Pydantic version 1.x is used to avoid compatibility issues with FastAPI.
2. **Database Connection**: Verify environment variables for DB credentials. Connection failures often result from incorrect values.

---

This documentation provides a detailed overview of the backend logic, data structures, API routes, and common troubleshooting tips.
