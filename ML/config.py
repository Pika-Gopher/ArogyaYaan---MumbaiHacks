import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / ".env"
try:
    if env_path.exists():
        load_dotenv(env_path)
except Exception:
    pass

GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
SUPABASE_DB_URL = os.environ["SUPABASE_DB_URL"]
MAPS_API_KEY = os.environ["GOOGLE_MAPS_API_KEY"]
GROQ_API_KEY = os.environ["GROQ_API_KEY"]