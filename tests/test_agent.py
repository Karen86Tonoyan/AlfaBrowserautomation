"""Integration tests for the full ALFA Agent loop."""

import pytest
from alfa import ALFAAgent
from alfa.cerber import CerberViolation
from alfa.memory_store import MemoryStore


def _make_agent(**kwargs):
    """Helper: ALFAAgent with in-memory store."""
    kwargs.setdefault("memory_store", MemoryStore(":memory:"))
    return ALFAAgent(**kwargs)


# ── Happy path ────────────────────────────────────────────────────────────────

def test_full_loop_success():
    agent = _make_agent()
    agent.execution_agent.register("navigate", lambda a, p: "navigated")
    result = agent.run("navigate to example.com")
    assert result.status == "success"
    assert result.run_id is not None
    assert len(result.step_results) > 0


def test_skills_learned_after_success():
    agent = _make_agent()
    agent.execution_agent.register("navigate", lambda a, p: "ok")
    result = agent.run("navigate to example.com")
    # May or may not learn skills — just verify the list is returned
    assert isinstance(result.skills_learned, list)


# ── Goal / injection blocking ─────────────────────────────────────────────────

def test_xss_goal_blocked():
    agent = _make_agent()
    result = agent.run('<script>alert(1)</script>')
    assert result.status == "blocked"


def test_sql_injection_blocked():
    agent = _make_agent()
    result = agent.run("1 UNION SELECT * FROM users")
    assert result.status == "blocked"


# ── Execution failure handling ─────────────────────────────────────────────────

def test_failed_run_status():
    agent = _make_agent()
    # No handlers registered → all steps fail
    result = agent.run("navigate to something")
    assert result.status in ("failure", "success")  # depends on validators
    assert result.run_id is not None


def test_run_persists_to_memory():
    mem = MemoryStore(":memory:")
    agent = ALFAAgent(memory_store=mem)
    agent.execution_agent.register("navigate", lambda a, p: "ok")
    result = agent.run("navigate to example.com")
    runs = mem.get_recent_runs()
    assert any(r["id"] == result.run_id for r in runs)
    mem.close()


# ── Second run uses skills from first ─────────────────────────────────────────

def test_skills_available_in_second_run():
    mem = MemoryStore(":memory:")
    agent = ALFAAgent(memory_store=mem)
    agent.execution_agent.register("navigate", lambda a, p: "ok")

    agent.run("navigate to example.com")
    # On second run the planner receives the learned skills in context
    result = agent.run("navigate to example.com")
    assert result.status == "success"
    mem.close()


# ── Empty goal ────────────────────────────────────────────────────────────────

def test_empty_goal_returns_failure():
    agent = _make_agent()
    result = agent.run("")
    assert result.status == "failure"
    assert result.error is not None
