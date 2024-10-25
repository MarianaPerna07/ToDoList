from sqlalchemy.orm import Session
from app.models import Task

# Função para criar uma task
def create_task(db: Session, title: str, description: str):
    db_task = Task(title=title, description=description)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

# Função para obter todas as tasks
def get_tasks(db: Session):
    return db.query(Task).all()

# Função para obter uma task por ID
def get_task(db: Session, task_id: int):
    return db.query(Task).filter(Task.id == task_id).first()

# Função para marcar uma task como completada
def complete_task(db: Session, task_id: int):
    task = get_task(db, task_id)
    if task:
        task.is_completed = 1
        db.commit()
        db.refresh(task)
    return task
