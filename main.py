# main.py

import os
import atexit
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.gmail import gmail_router
from routes.slack import slack_router
from routes.whatsapp import whatsapp_router
from routes.telegram import telegram_router

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def remove_token_file():
    """Remove the token.json file if it exists."""
    if os.path.exists("token.json"):
        os.remove("token.json")
        logger.info("token.json has been removed.")

app = FastAPI(title="AI Communication Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(gmail_router, prefix="/gmail")
app.include_router(slack_router, prefix="/slack")
app.include_router(whatsapp_router, prefix="/whatsapp")
app.include_router(telegram_router, prefix="/telegram")

@app.get("/")
def read_root():
    return {"message": "AI Communication Assistant API is running!"}

# 1. Add a logout endpoint that deletes token.json
@app.get("/logout")
def logout():
    remove_token_file()
    return {"message": "Logged out. token.json removed."}

# Remove token.json on exit
atexit.register(remove_token_file)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001) 
