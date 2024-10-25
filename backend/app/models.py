from sqlalchemy import Column, Integer, String
from .database import Base

# Modelo de Task
class Task(Base):
    __tablename__ = 'tasks'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(255)) 
    is_completed = Column(Integer, default=0)
