from fastapi import HTTPException, Request
from redis import Redis
from redis.exceptions import RedisError

from app.config import get_settings


def enforce_rate_limit(request: Request, category: str, limit: int) -> None:
    client_ip = request.client.host if request.client else "unknown"
    key = f"salesmora:rate:{category}:{client_ip}"
    client = Redis.from_url(get_settings().redis_url, decode_responses=True)
    try:
        count = client.incr(key)
        if count == 1:
            client.expire(key, 60)
        if count > limit:
            raise HTTPException(status_code=429, detail="Too many requests. Try again shortly.")
    except RedisError as error:
        raise HTTPException(
            status_code=503, detail="Request protection is temporarily unavailable."
        ) from error
    finally:
        client.close()
