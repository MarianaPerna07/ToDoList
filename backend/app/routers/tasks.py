from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import get_db
from app.auth import get_current_user

router = APIRouter()

@router.post("/tasks/", response_model=schemas.Task, status_code=201)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    return crud.create_task(db=db, title=task.title, description=task.description, user_id=current_user.id)

@router.get("/tasks/", response_model=list[schemas.Task])
def read_tasks(db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    return crud.get_tasks(db, user_id=current_user.id)

@router.get("/tasks/{task_id}", response_model=schemas.Task)
def read_task(task_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    task = crud.get_task(db, task_id=task_id, user_id=current_user.id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/tasks/{task_id}/toggle", response_model=schemas.Task)
def toggle_task_completion(task_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    task = crud.toggle_task_completion(db, task_id=task_id, user_id=current_user.id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(get_current_user)):
    success = crud.delete_task(db, task_id=task_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
