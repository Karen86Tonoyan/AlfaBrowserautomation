"""
Memory Store
------------
Persists the history of decisions, run results, and learned skills
in a local SQLite database so all data stays on-device.
"""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


_DEFAULT_DB = Path("alfa_memory.db")


class MemoryStore:
    """Thread-safe, file-backed store for ALFA decision history and skills.

    Parameters
    ----------
    db_path:
        Path to the SQLite database file.  Defaults to ``alfa_memory.db``
        in the current working directory.
    """

    def __init__(self, db_path: str | Path = _DEFAULT_DB) -> None:
        self.db_path = Path(db_path)
        self._conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._init_schema()

    # ------------------------------------------------------------------
    # Schema
    # ------------------------------------------------------------------

    def _init_schema(self) -> None:
        with self._conn:
            self._conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS runs (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    goal        TEXT    NOT NULL,
                    status      TEXT    NOT NULL,
                    started_at  TEXT    NOT NULL,
                    finished_at TEXT,
                    metadata    TEXT
                );

                CREATE TABLE IF NOT EXISTS steps (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    run_id      INTEGER NOT NULL REFERENCES runs(id),
                    step_index  INTEGER NOT NULL,
                    description TEXT    NOT NULL,
                    status      TEXT    NOT NULL,
                    result      TEXT,
                    error       TEXT,
                    executed_at TEXT
                );

                CREATE TABLE IF NOT EXISTS skills (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    name        TEXT    NOT NULL UNIQUE,
                    rule        TEXT    NOT NULL,
                    origin      TEXT,
                    created_at  TEXT    NOT NULL,
                    updated_at  TEXT
                );
                """
            )

    # ------------------------------------------------------------------
    # Run lifecycle
    # ------------------------------------------------------------------

    def start_run(self, goal: str, metadata: dict[str, Any] | None = None) -> int:
        """Record the start of a new agent run and return its *run_id*."""
        now = _utcnow()
        with self._conn:
            cur = self._conn.execute(
                "INSERT INTO runs (goal, status, started_at, metadata) VALUES (?, ?, ?, ?)",
                (goal, "running", now, json.dumps(metadata or {})),
            )
        return cur.lastrowid  # type: ignore[return-value]

    def finish_run(self, run_id: int, status: str) -> None:
        """Mark a run as finished with *status* (``success`` or ``failure``)."""
        with self._conn:
            self._conn.execute(
                "UPDATE runs SET status = ?, finished_at = ? WHERE id = ?",
                (status, _utcnow(), run_id),
            )

    def log_step(
        self,
        run_id: int,
        step_index: int,
        description: str,
        status: str,
        result: Any = None,
        error: str | None = None,
    ) -> None:
        """Persist the outcome of a single execution step."""
        with self._conn:
            self._conn.execute(
                """
                INSERT INTO steps
                    (run_id, step_index, description, status, result, error, executed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    run_id,
                    step_index,
                    description,
                    status,
                    json.dumps(result),
                    error,
                    _utcnow(),
                ),
            )

    # ------------------------------------------------------------------
    # Skills
    # ------------------------------------------------------------------

    def save_skill(self, name: str, rule: str, origin: str | None = None) -> None:
        """Insert or replace a skill rule."""
        now = _utcnow()
        with self._conn:
            self._conn.execute(
                """
                INSERT INTO skills (name, rule, origin, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(name) DO UPDATE SET
                    rule       = excluded.rule,
                    origin     = excluded.origin,
                    updated_at = excluded.updated_at
                """,
                (name, rule, origin, now, now),
            )

    def get_skills(self) -> list[dict[str, Any]]:
        """Return all stored skills as a list of dicts."""
        cur = self._conn.execute("SELECT * FROM skills ORDER BY name")
        return [dict(row) for row in cur.fetchall()]

    # ------------------------------------------------------------------
    # History queries
    # ------------------------------------------------------------------

    def get_recent_runs(self, limit: int = 20) -> list[dict[str, Any]]:
        """Return the *limit* most recent runs."""
        cur = self._conn.execute(
            "SELECT * FROM runs ORDER BY id DESC LIMIT ?", (limit,)
        )
        return [dict(row) for row in cur.fetchall()]

    def get_steps_for_run(self, run_id: int) -> list[dict[str, Any]]:
        """Return all steps for a given run, ordered by step index."""
        cur = self._conn.execute(
            "SELECT * FROM steps WHERE run_id = ? ORDER BY step_index", (run_id,)
        )
        return [dict(row) for row in cur.fetchall()]

    # ------------------------------------------------------------------
    # Cleanup
    # ------------------------------------------------------------------

    def close(self) -> None:
        """Close the underlying database connection."""
        self._conn.close()

    def __enter__(self) -> "MemoryStore":
        return self

    def __exit__(self, *_: Any) -> None:
        self.close()


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()
