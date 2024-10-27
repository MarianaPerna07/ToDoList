from sqlalchemy.orm import Session
from app.models import Task, User
from app.schemas import UserCreate

# User CRUD operations
def get_user_by_cognito_id(db: Session, cognito_id: str):
    return db.query(User).filter(User.cognito_id == cognito_id).first()

# Função para obter usuário por e-mail
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

# Função para criar usuário
def create_user(db: Session, user: UserCreate):
    # Verifica se o usuário já existe pelo e-mail
    existing_user = get_user_by_email(db, user.email)
    if existing_user:
        return existing_user  # Retorna o usuário já existente, evitando duplicação
    
    db_user = User(
        cognito_id=user.cognito_id,
        given_name=user.given_name,
        family_name=user.family_name,
        email=user.email
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Modify task operations to include owner
def create_task(db: Session, title: str, description: str, user_id: int):
    db_task = Task(title=title, description=description, owner_id=user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_tasks(db: Session, user_id: int):
    return db.query(Task).filter(Task.owner_id == user_id).all()

def get_task(db: Session, task_id: int, user_id: int):
    return db.query(Task).filter(Task.id == task_id, Task.owner_id == user_id).first()

def toggle_task_completion(db: Session, task_id: int, user_id: int):
    task = get_task(db, task_id, user_id)
    if task:
        task.is_completed = 1 if task.is_completed == 0 else 0
        db.commit()
        db.refresh(task)
    return task

def delete_task(db: Session, task_id: int, user_id: int):
    task = get_task(db, task_id, user_id)
    if task:
        db.delete(task)
        db.commit()
        return True
    return False

