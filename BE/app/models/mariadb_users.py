from datetime import datetime
from configs.mariadb import Base

from sqlalchemy import (
    Column, ForeignKey, Integer, VARCHAR, Boolean, TIMESTAMP
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class Departments(Base):
    __tablename__ = "departments"

    department_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    department_name = Column(VARCHAR(255), nullable=False)

    users = relationship("Users", back_populates="departments")

class Users(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(VARCHAR(255), nullable=False)
    email = Column(VARCHAR(255), unique=True, nullable=False)
    password = Column(VARCHAR(255), nullable=False)
    duty = Column(VARCHAR(255), nullable=False)
    location = Column(VARCHAR(255), nullable=False)
    department_id = Column(Integer, ForeignKey('departments.department_id', ondelete="SET NULL"), nullable=True)
    is_supervised = Column(Boolean, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.now(), nullable=False)
    updated_at = Column(TIMESTAMP, default=datetime.now(), onupdate=datetime.now(), nullable=False)

    departments = relationship("Departments", back_populates="users")






    