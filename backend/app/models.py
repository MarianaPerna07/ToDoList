from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base

# User model
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    cognito_id = Column(String(255), unique=True, index=True, nullable=False)
    given_name = Column(String(255), nullable=False)
    family_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)

    tasks = relationship("Task", back_populates="owner")

# Task model
class Task(Base):
    __tablename__ = 'tasks'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(255))
    is_completed = Column(Integer, default=0)
    owner_id = Column(Integer, ForeignKey('users.id'))
    deadline = Column(DateTime, nullable=True)
    creation_date = Column(DateTime, nullable=False)
    priority = Column(String(50), nullable=True)

    owner = relationship("User", back_populates="tasks")

