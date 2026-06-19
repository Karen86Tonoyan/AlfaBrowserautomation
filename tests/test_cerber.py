"""Tests for Cerber guard."""

import pytest
from alfa.cerber import Cerber, CerberViolation, CerberReport
from alfa.execution_agent import StepResult
from alfa.planner import PlanStep


def _step(index=0, action="navigate", desc="desc", params=None):
    return PlanStep(index=index, description=desc, action=action, parameters=params or {})


def _result(index=0, action="navigate", status="success", output=None, error=None):
    return StepResult(index, "desc", action, status, output=output, error=error)


# ── Goal checks ──────────────────────────────────────────────────────────────

def test_clean_goal_is_safe():
    c = Cerber()
    report = c.check_goal("open https://example.com")
    assert report.safe is True


def test_xss_goal_is_blocked():
    c = Cerber()
    report = c.check_goal('<script>alert("xss")</script>')
    assert report.safe is False


def test_sql_injection_blocked():
    c = Cerber()
    report = c.check_goal("1 UNION SELECT * FROM users")
    assert report.safe is False


def test_path_traversal_blocked():
    c = Cerber()
    report = c.check_goal("read ../../etc/passwd")
    assert report.safe is False


# ── Plan checks ──────────────────────────────────────────────────────────────

def test_clean_plan_is_safe():
    c = Cerber()
    plan = [_step(0, "navigate"), _step(1, "click")]
    report = c.check_plan(plan)
    assert report.safe is True


def test_plan_exceeds_max_steps():
    c = Cerber(max_steps=2)
    plan = [_step(i, "navigate") for i in range(3)]
    report = c.check_plan(plan)
    assert report.safe is False


def test_plan_disallowed_action():
    c = Cerber(allowed_actions=["navigate", "click"])
    plan = [_step(0, "navigate"), _step(1, "delete")]
    report = c.check_plan(plan)
    assert report.safe is False


def test_plan_allowed_actions_pass():
    c = Cerber(allowed_actions=["navigate", "click"])
    plan = [_step(0, "navigate"), _step(1, "click")]
    report = c.check_plan(plan)
    assert report.safe is True


# ── Result checks ─────────────────────────────────────────────────────────────

def test_clean_results_are_safe():
    c = Cerber()
    results = [_result(output="hello world")]
    report = c.check_results(results)
    assert report.safe is True


def test_xss_in_output_blocked():
    c = Cerber()
    results = [_result(output='<script>evil()</script>')]
    report = c.check_results(results)
    assert report.safe is False


# ── Drift checks ─────────────────────────────────────────────────────────────

def test_no_drift():
    c = Cerber()
    plan = [_step(0), _step(1)]
    results = [_result(0), _result(1)]
    report = c.check_drift(plan, results)
    assert report.safe is True


def test_drift_detected():
    c = Cerber()
    plan = [_step(0), _step(1)]
    results = [_result(0), _result(1), _result(2)]  # step 2 not in plan
    report = c.check_drift(plan, results)
    assert report.safe is False


# ── enforce ──────────────────────────────────────────────────────────────────

def test_enforce_raises_on_unsafe():
    c = Cerber()
    bad_report = CerberReport(safe=False, violations=["bad thing"])
    with pytest.raises(CerberViolation):
        c.enforce(bad_report)


def test_enforce_passes_on_safe():
    c = Cerber()
    good_report = CerberReport(safe=True)
    c.enforce(good_report)   # should not raise
