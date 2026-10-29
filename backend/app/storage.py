"""Object storage: S3 in production, the local filesystem for tests and a
laptop. One small module, two backends, so a caller -- profile photo upload,
any future attachment -- never checks which one is live.

`S3_BUCKET` set: objects go to that bucket in `AWS_REGION` (SSE-KMS and the
no-public-access policy are set on the bucket itself, not here) and are read
back through a short-lived presigned URL -- never a public S3 URL.
`S3_BUCKET` unset: objects land under `MEDIA_ROOT`, and `url_for` returns a
path the API itself would need to serve.
"""

import os
import uuid

from app.config import AWS_REGION, MEDIA_ROOT, S3_BUCKET


def _client():
    import boto3  # imported lazily: the local-disk backend never needs it installed

    return boto3.client("s3", region_name=AWS_REGION)


def new_key(prefix: str, filename: str) -> str:
    """A storage key under `prefix` that cannot collide with another upload."""
    suffix = os.path.splitext(filename)[1]
    return f"{prefix.strip('/')}/{uuid.uuid4().hex}{suffix}"


def save(key: str, data: bytes, content_type: str) -> None:
    """Write `data` under `key`, to S3 when configured, else under MEDIA_ROOT."""
    if S3_BUCKET:
        _client().put_object(Bucket=S3_BUCKET, Key=key, Body=data, ContentType=content_type)
        return
    path = os.path.join(MEDIA_ROOT, key)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as fh:
        fh.write(data)


def url_for(key: str, expires_in: int = 300) -> str:
    """A short-lived presigned URL for `key`; its local path when there is no
    bucket. Never a public S3 URL: objects are never made public."""
    if S3_BUCKET:
        return _client().generate_presigned_url(
            "get_object",
            Params={"Bucket": S3_BUCKET, "Key": key},
            ExpiresIn=expires_in,
        )
    return f"/media/{key}"
