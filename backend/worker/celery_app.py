from celery import Celery

from app.config import get_settings

settings = get_settings()
celery_app = Celery(
    "salesmora",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["worker.tasks.email"],
)
celery_app.conf.update(
    task_default_queue="salesmora",
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_track_started=True,
    result_expires=3600,
    broker_connection_retry_on_startup=True,
    timezone="UTC",
    enable_utc=True,
)
