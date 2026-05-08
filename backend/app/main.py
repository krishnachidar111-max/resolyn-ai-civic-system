from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import get_settings
from .database import Base, engine, SessionLocal
from .seed import seed_database
from .routers import auth, complaints, admin, map, notifications, chatbot, animal, public, ai, chat, escalations

settings = get_settings()
app = FastAPI(title=settings.app_name, version="3.0.0")

origins = [origin.strip() for origin in settings.frontend_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api")
app.include_router(complaints.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(map.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(chatbot.router, prefix="/api")
app.include_router(animal.router, prefix="/api")
app.include_router(public.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(escalations.router, prefix="/api")


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Resolyn Phase-3 API is running", "docs": "/docs", "health": "/api/health"}


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "Resolyn Phase-3 Backend"}
