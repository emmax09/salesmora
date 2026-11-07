from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.config import get_settings
from app.errors import install_error_handlers
from app.routes import (
    audit,
    auth,
    health,
    identity,
    invitations,
    memberships,
    organizations,
    public,
)

settings = get_settings()
app = FastAPI(
    title="Salesmora API",
    version="1.0.0",
    description="Versioned API for Salesmora identity, organizations, and public pages.",
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title=app.title, version=app.version, description=app.description, routes=app.routes
    )
    path_names = {
        "organization_id": "organizationId",
        "member_id": "memberId",
        "invitation_id": "invitationId",
    }
    normalized_paths = {}
    for path, operations in schema["paths"].items():
        for operation in operations.values():
            for parameter in operation.get("parameters", []):
                parameter["name"] = path_names.get(parameter["name"], parameter["name"])
        normalized_path = path
        for source, target in path_names.items():
            normalized_path = normalized_path.replace(f"{{{source}}}", f"{{{target}}}")
        normalized_paths[normalized_path] = operations
    schema["paths"] = normalized_paths
    schemas = schema.setdefault("components", {}).setdefault("schemas", {})
    schemas["OrganizationPermission"] = {
        "type": "string",
        "enum": [
            "organization:read",
            "organization:update",
            "members:read",
            "members:invite",
            "members:manage",
            "invitations:read",
            "invitations:revoke",
            "audit:read",
            "ownership:transfer",
        ],
    }
    schemas["ApiErrorResponse"] = {
        "type": "object",
        "required": ["statusCode", "error", "message", "path", "timestamp"],
        "properties": {
            "statusCode": {"type": "integer"},
            "error": {"type": "string"},
            "message": {
                "oneOf": [
                    {"type": "string"},
                    {"type": "array", "items": {"type": "string"}},
                ]
            },
            "path": {"type": "string"},
            "timestamp": {"type": "string", "format": "date-time"},
        },
    }
    app.openapi_schema = schema
    return schema


app.openapi = custom_openapi
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.web_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Accept", "Content-Type", "Idempotency-Key"],
)
install_error_handlers(app)
for route_group in (
    health.router,
    public.router,
    identity.router,
    organizations.router,
    memberships.router,
    invitations.router,
    audit.router,
    auth.router,
):
    app.include_router(route_group)
