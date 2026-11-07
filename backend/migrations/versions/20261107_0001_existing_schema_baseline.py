from pathlib import Path

import sqlalchemy as sa
from alembic import op

revision = "20261107_0001"
down_revision = None
branch_labels = None
depends_on = None

LEGACY_DIR = Path(__file__).resolve().parents[1] / "sql" / "legacy_prisma"
REQUIRED_TABLES = {
    "users",
    "organizations",
    "memberships",
    "sessions",
    "accounts",
    "verifications",
    "invitations",
    "organization_creation_keys",
    "audit_events",
    "early_access_leads",
    "contact_messages",
}


def upgrade() -> None:
    connection = op.get_bind()
    existing = set(sa.inspect(connection).get_table_names()) - {"alembic_version"}
    if existing:
        missing = REQUIRED_TABLES - existing
        if missing:
            raise RuntimeError(
                "Existing database is only partially initialized; refusing to replay legacy SQL. "
                f"Missing tables: {', '.join(sorted(missing))}"
            )
        _check_columns(connection)
        return

    for migration in sorted(LEGACY_DIR.glob("*.sql")):
        for statement in migration.read_text(encoding="utf-8").split(";"):
            if statement.strip():
                connection.exec_driver_sql(statement)


def downgrade() -> None:
    raise RuntimeError("The initial schema is not downgradable because it contains user data.")


def _check_columns(connection) -> None:
    inspector = sa.inspect(connection)
    required_columns = {
        "users": {"id", "name", "email", "emailVerified"},
        "organizations": {"id", "name", "slug", "defaultCurrency"},
        "memberships": {"id", "userId", "organizationId", "role"},
        "sessions": {"id", "userId", "token", "expiresAt"},
        "accounts": {"id", "accountId", "providerId", "userId", "password"},
        "verifications": {"id", "identifier", "value", "expiresAt"},
        "invitations": {"id", "organizationId", "tokenHash", "expiresAt"},
        "organization_creation_keys": {"key", "userId", "organizationId"},
        "audit_events": {"id", "organizationId", "action", "createdAt"},
        "early_access_leads": {"id", "email", "consentAt"},
        "contact_messages": {"id", "email", "message"},
    }
    for table, expected in required_columns.items():
        actual = {column["name"] for column in inspector.get_columns(table)}
        missing = expected - actual
        if missing:
            raise RuntimeError(
                f"Existing table {table} is incompatible; missing columns: "
                f"{', '.join(sorted(missing))}"
            )
