from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

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
    deadline: Optional[datetime] = None # deadline is optional
    creation_date: datetime
    priority: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None # deadline is optional
    priority: Optional[str] = None
    is_completed: Optional[int] = None

class Task(TaskBase):
    id: int
    is_completed: int
    owner_id: int

    class Config:
        orm_mode = True


        