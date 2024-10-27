from pydantic import BaseModel
from typing import Optional, List

class UserBase(BaseModel):
    cognito_id: str
    given_name: str
    family_name: str
    email: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    tasks: List['Task'] = []

    class Config:
        orm_mode = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    is_completed: int
    owner_id: int

    class Config:
        orm_mode = True
