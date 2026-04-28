import uuid
from pathlib import Path

import boto3
from fastapi import UploadFile

from app.core.config import settings
from app.core.exceptions import AppException

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,
)

def build_s3_key(user_id: int, original_filename: str) -> str:
    extension = Path(original_filename).suffix.lower()
    return f"users/{user_id}/source-documents/{uuid.uuid4().hex}{extension}"

def upload_file_to_s3(file: UploadFile, user_id: int) -> str:
    if not settings.AWS_S3_BUCKET_NAME:
        raise AppException("S3 bucket name is not configured.", status_code=500)

    s3_key = build_s3_key(user_id, file.filename)

    try:
        file.file.seek(0)
        s3_client.upload_fileobj(
            file.file,
            settings.AWS_S3_BUCKET_NAME,
            s3_key,
            ExtraArgs={"ContentType": file.content_type or "application/pdf"},
        )
        return s3_key
    except Exception as e:
        raise AppException(f"Failed to upload file to S3: {str(e)}", status_code=500) from e

def generate_presigned_download_url(s3_key: str, expires_in: int = 3600) -> str:
    if not settings.AWS_S3_BUCKET_NAME:
        raise AppException("S3 bucket name is not configured.", status_code=500)

    return s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.AWS_S3_BUCKET_NAME, "Key": s3_key},
        ExpiresIn=expires_in,
    )