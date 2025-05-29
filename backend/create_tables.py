from config.database import Base, engine
from app.models import user, appointment, notification

def create_tables():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    create_tables()
    print("Tables created successfully!") 