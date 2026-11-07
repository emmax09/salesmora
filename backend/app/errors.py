from datetime import UTC, datetime

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(StarletteHTTPException)
    async def http_error(request: Request, error: StarletteHTTPException):
        detail = error.detail
        return JSONResponse(
            status_code=error.status_code,
            headers=error.headers,
            content={
                "statusCode": error.status_code,
                "error": _error_name(error.status_code),
                "message": detail if isinstance(detail, (str, list)) else "Request failed.",
                "path": request.url.path,
                "timestamp": datetime.now(UTC).isoformat(),
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, error: RequestValidationError):
        messages = [
            " ".join(str(part) for part in item["loc"] if part != "body") + ": " + item["msg"]
            for item in error.errors()
        ]
        return JSONResponse(
            status_code=422,
            content={
                "statusCode": 422,
                "error": "Unprocessable Entity",
                "message": messages,
                "path": request.url.path,
                "timestamp": datetime.now(UTC).isoformat(),
            },
        )


def _error_name(status_code: int) -> str:
    names = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        409: "Conflict",
        422: "Unprocessable Entity",
        429: "Too Many Requests",
        500: "Internal Server Error",
        503: "Service Unavailable",
    }
    return names.get(status_code, "Request Failed")
