import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{os.getenv('MARIA_USER')}@{os.getenv('MARIA_HOST')}:{os.getenv('MARIA_PASSWORD')}@{os.getenv('MARIA_HOST')}:{int(os.getenv('MARIA_PORT'))}/{os.getenv('MARIA_DATABASE')}?charset=utf8"

engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_recycle=28000,  # 28000초마다 연결을 재활용
        pool_pre_ping=True,   # Mariadb 연결 확인
        pool_size=5,
        max_overflow=10
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_database_mariadb():
    db = SessionLocal()
    try:
        print("Successfully connected to MariaDB")
        yield db
    finally:
        db.close()

Base = declarative_base()