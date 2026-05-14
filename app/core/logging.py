import logging
import sys
from logging.handlers import RotatingFileHandler
from pythonjsonlogger import jsonlogger
import os

LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    if logger.handlers:
        logger.handlers.clear()

    formatter = jsonlogger.JsonFormatter(
        "%(asctime)s %(levelname)s %(name)s %(message)s %(request_id)s"
    )

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    app_file_handler = RotatingFileHandler(
        filename=f"{LOG_DIR}/app.log",
        maxBytes=5 * 1024 * 1024,
        backupCount=3,
    )
    app_file_handler.setFormatter(formatter)
    app_file_handler.setLevel(logging.INFO)

    error_file_handler = RotatingFileHandler(
        filename=f"{LOG_DIR}/error.log",
        maxBytes=5 * 1024 * 1024,
        backupCount=3,
    )
    error_file_handler.setFormatter(formatter)
    error_file_handler.setLevel(logging.ERROR)

    logger.addHandler(console_handler)
    logger.addHandler(app_file_handler)
    logger.addHandler(error_file_handler)