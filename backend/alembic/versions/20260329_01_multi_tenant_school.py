"""multi-tenant school rollout

Revision ID: 20260329_01
Revises:
Create Date: 2026-03-29 18:35:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260329_01"
down_revision = None
branch_labels = None
depends_on = None


def _add_column_if_missing(table_name: str, column_sql: str):
    op.execute(sa.text(f"ALTER TABLE {table_name} ADD COLUMN IF NOT EXISTS {column_sql}"))


def _create_index_if_missing(index_name: str, table_name: str, column_name: str):
    op.execute(
        sa.text(
            f"CREATE INDEX IF NOT EXISTS {index_name} ON {table_name} ({column_name})"
        )
    )


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            CREATE TABLE IF NOT EXISTS schools (
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL,
                code VARCHAR NOT NULL UNIQUE,
                email VARCHAR,
                phone VARCHAR,
                address VARCHAR,
                city VARCHAR,
                state VARCHAR,
                country VARCHAR,
                status VARCHAR DEFAULT 'active',
                created_by INTEGER,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                updated_at TIMESTAMP WITH TIME ZONE
            )
            """
        )
    )

    _create_index_if_missing("ix_schools_code", "schools", "code")

    _add_column_if_missing("users", "school_id INTEGER")
    _add_column_if_missing("users", "is_super_admin BOOLEAN NOT NULL DEFAULT FALSE")
    _create_index_if_missing("ix_users_school_id", "users", "school_id")

    _add_column_if_missing("roles", "scope VARCHAR(32) NOT NULL DEFAULT 'GLOBAL'")
    _add_column_if_missing("roles", "school_id INTEGER")
    _create_index_if_missing("ix_roles_school_id", "roles", "school_id")

    _add_column_if_missing("user_roles", "school_id INTEGER")
    _create_index_if_missing("ix_user_roles_school_id", "user_roles", "school_id")

    tenant_tables = [
        "students",
        "teachers",
        "parents",
        "staff",
        "classes",
        "sections",
        "subjects",
        "departments",
        "attendance",
        "exams",
        "marks",
        "fees",
        "payments",
        "teacher_assignments",
    ]
    for table_name in tenant_tables:
        _add_column_if_missing(table_name, "school_id INTEGER")
        _create_index_if_missing(f"ix_{table_name}_school_id", table_name, "school_id")

    op.execute(sa.text("UPDATE roles SET scope = 'GLOBAL' WHERE scope IS NULL"))

    op.execute(sa.text("ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_name_key"))

    op.execute(
        sa.text(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'uq_roles_name_scope_school'
                ) THEN
                    ALTER TABLE roles
                    ADD CONSTRAINT uq_roles_name_scope_school UNIQUE (name, scope, school_id);
                END IF;
            END
            $$;
            """
        )
    )

    fk_statements = [
        (
            "users",
            "fk_users_school_id_schools",
            "FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL",
        ),
        (
            "schools",
            "fk_schools_created_by_users",
            "FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL",
        ),
        (
            "roles",
            "fk_roles_school_id_schools",
            "FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE",
        ),
        (
            "user_roles",
            "fk_user_roles_school_id_schools",
            "FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE",
        ),
    ]

    for table_name in tenant_tables:
        fk_statements.append(
            (
                table_name,
                f"fk_{table_name}_school_id_schools",
                "FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE",
            )
        )

    for table_name, constraint_name, clause in fk_statements:
        op.execute(
            sa.text(
                f"""
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_constraint
                        WHERE conname = '{constraint_name}'
                    ) THEN
                        ALTER TABLE {table_name}
                        ADD CONSTRAINT {constraint_name} {clause};
                    END IF;
                END
                $$;
                """
            )
        )


def downgrade() -> None:
    op.execute(sa.text("ALTER TABLE roles DROP CONSTRAINT IF EXISTS uq_roles_name_scope_school"))

    tables_with_school_fk = [
        "users",
        "roles",
        "user_roles",
        "students",
        "teachers",
        "parents",
        "staff",
        "classes",
        "sections",
        "subjects",
        "departments",
        "attendance",
        "exams",
        "marks",
        "fees",
        "payments",
        "teacher_assignments",
    ]
    for table_name in tables_with_school_fk:
        op.execute(
            sa.text(
                f"ALTER TABLE {table_name} DROP CONSTRAINT IF EXISTS fk_{table_name}_school_id_schools"
            )
        )

    op.execute(sa.text("ALTER TABLE schools DROP CONSTRAINT IF EXISTS fk_schools_created_by_users"))

    for table_name in [
        "teacher_assignments",
        "payments",
        "fees",
        "marks",
        "exams",
        "attendance",
        "departments",
        "subjects",
        "sections",
        "classes",
        "staff",
        "parents",
        "teachers",
        "students",
        "user_roles",
        "roles",
        "users",
    ]:
        op.execute(sa.text(f"ALTER TABLE {table_name} DROP COLUMN IF EXISTS school_id"))

    op.execute(sa.text("ALTER TABLE users DROP COLUMN IF EXISTS is_super_admin"))
    op.execute(sa.text("ALTER TABLE roles DROP COLUMN IF EXISTS scope"))

    op.execute(sa.text("DROP TABLE IF EXISTS schools"))

