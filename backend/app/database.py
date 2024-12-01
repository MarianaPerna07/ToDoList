import os
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Retrieve credentials from environment variables
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_name = os.getenv('DB_NAME')
db_port = os.getenv('DB_PORT')

DATABASE_URL = f'mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'

print(f'URL_DATABASE: {DATABASE_URL}')

# Função para criar a base de dados
def create_database_if_not_exists(database_url: str):
    from sqlalchemy_utils import database_exists, create_database
    if not database_exists(database_url):
        print("Database does not exist. Creating it...")
        create_database(database_url)
        print("Database created successfully!")
    else:
        print("Database already exists.")

# Cria o banco de dados se não existir
create_database_if_not_exists(DATABASE_URL)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency para obter sessão da DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
