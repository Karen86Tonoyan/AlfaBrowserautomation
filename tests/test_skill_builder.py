"""Tests for SkillBuilder."""

import pytest
from alfa.execution_agent import StepResult
from alfa.skill_builder import Skill, SkillBuilder
from alfa.validator import ValidationReport, CheckpointResult


def _success_result(index=0):
    return StepResult(index, "desc", "navigate", "success", output="ok")


def _failure_result(index=0, error="handler crashed"):
    return StepResult(index, "desc", "navigate", "failure", error=error)


def _passed_report():
    return ValidationReport(passed=True, checkpoint_results=[
        CheckpointResult("cp", True, 0),
    ])


def _failed_report():
    return ValidationReport(passed=False, checkpoint_results=[
        CheckpointResult("cp", False, 0, "failed"),
    ])


def test_success_skill_extracted():
    sb = SkillBuilder()
    skills = sb.extract_skills("open example.com", [_success_result()], _passed_report())
    assert any("success" in s.name for s in skills)


def test_failure_skill_extracted():
    sb = SkillBuilder(min_failure_rate=0.5)
    results = [_failure_result(0), _failure_result(1)]
    skills = sb.extract_skills("do something", results, _failed_report())
    assert any("avoid" in s.name for s in skills)


def test_step_error_skill():
    sb = SkillBuilder()
    results = [_failure_result(error="connection refused")]
    skills = sb.extract_skills("connect", results, _failed_report())
    assert any("fix_" in s.name for s in skills)


def test_empty_results_returns_no_skills():
    sb = SkillBuilder()
    skills = sb.extract_skills("nothing", [], _passed_report())
    assert skills == []


def test_min_failure_rate_boundary():
    sb = SkillBuilder(min_failure_rate=1.0)
    results = [_success_result(0), _failure_result(1)]
    skills = sb.extract_skills("mixed run", results, _failed_report())
    # 50 % failure < 100 % threshold → no avoid skill
    assert not any("avoid" in s.name for s in skills)


def test_invalid_failure_rate_raises():
    with pytest.raises(ValueError):
        SkillBuilder(min_failure_rate=1.5)


def test_learn_persists_to_memory():
    from alfa.memory_store import MemoryStore
    with MemoryStore(":memory:") as mem:
        sb = SkillBuilder()
        results = [_success_result()]
        report = _passed_report()
        skills = sb.learn("test goal", results, report, mem)
        stored = mem.get_skills()
        assert len(stored) >= len(skills)
