"""Tests for MemoryStore."""

import pytest
from alfa.memory_store import MemoryStore


@pytest.fixture
def mem():
    with MemoryStore(":memory:") as m:
        yield m


def test_start_run_returns_id(mem):
    run_id = mem.start_run("test goal")
    assert isinstance(run_id, int)
    assert run_id > 0


def test_finish_run_updates_status(mem):
    run_id = mem.start_run("goal")
    mem.finish_run(run_id, "success")
    runs = mem.get_recent_runs()
    assert runs[0]["status"] == "success"


def test_log_step_and_retrieve(mem):
    run_id = mem.start_run("goal")
    mem.log_step(run_id, 0, "do something", "success", result={"ok": True})
    steps = mem.get_steps_for_run(run_id)
    assert len(steps) == 1
    assert steps[0]["step_index"] == 0
    assert steps[0]["status"] == "success"


def test_save_and_get_skills(mem):
    mem.save_skill("skill_a", "If X, do Y", origin="test")
    skills = mem.get_skills()
    assert any(s["name"] == "skill_a" for s in skills)


def test_skill_upsert(mem):
    mem.save_skill("skill_a", "rule v1")
    mem.save_skill("skill_a", "rule v2")
    skills = mem.get_skills()
    match = [s for s in skills if s["name"] == "skill_a"]
    assert len(match) == 1
    assert match[0]["rule"] == "rule v2"


def test_get_recent_runs_limit(mem):
    for i in range(5):
        rid = mem.start_run(f"goal {i}")
        mem.finish_run(rid, "success")
    runs = mem.get_recent_runs(limit=3)
    assert len(runs) == 3


def test_steps_empty_for_unknown_run(mem):
    steps = mem.get_steps_for_run(9999)
    assert steps == []
