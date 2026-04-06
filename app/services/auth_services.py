from sqlalchemy.orm import Session
from app.repositories.user_repository import get_user_by_email, create_user
from app.core.security import verify_password, get_password_hash
from app.models.user import User

def register_user(db: Session, name: str, email: str, password: str) -> User:
    existing_user = get_user_by_email(db, email)
    if existing_user:
        raise ValueError("Email already registered")

    hashed_password = get_password_hash(password)
    return create_user(db, name, email, hashed_password)

def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user