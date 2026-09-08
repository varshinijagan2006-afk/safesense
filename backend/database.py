import os
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "safesense.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def migrate_sqlite_schema():
    """Safely adds missing columns to SQLite database without wiping existing data."""
    if not os.path.exists(DB_PATH):
        return

    with engine.connect() as conn:
        res = conn.execute(text("PRAGMA table_info(incidents);")).fetchall()
        existing_cols = {row[1] for row in res} if res else set()

        if existing_cols:
            new_cols = [
                ("data_source", "VARCHAR(20) DEFAULT 'REAL'"),
                ("ml_prediction", "TEXT"),
                ("ml_confidence", "FLOAT"),
                ("model_version", "VARCHAR(20) DEFAULT '1.0.0'"),
                ("rule_based_score", "INTEGER"),
                ("verified", "BOOLEAN DEFAULT 0"),
                ("verified_severity", "VARCHAR(20)"),
                ("verified_risk_score", "INTEGER"),
                ("reviewed_at", "DATETIME")
            ]

            for col_name, col_type in new_cols:
                if col_name not in existing_cols:
                    try:
                        conn.execute(text(f"ALTER TABLE incidents ADD COLUMN {col_name} {col_type};"))
                        print(f"[MIGRATION] Added missing column '{col_name}' to incidents table.")
                    except Exception as e:
                        print(f"[MIGRATION] Column addition '{col_name}' skipped: {e}")
            conn.commit()
