"""Tests for Planner."""

import pytest
from alfa.planner import Planner, PlanStep


def test_plan_returns_steps():
    planner = Planner()
    steps = planner.plan("navigate to example.com")
    assert len(steps) > 0
    assert all(isinstance(s, PlanStep) for s in steps)


def test_step_indices_are_sequential():
    planner = Planner()
    steps = planner.plan("click the submit button")
    for i, step in enumerate(steps):
        assert step.index == i


def test_empty_goal_raises():
    planner = Planner()
    with pytest.raises(ValueError):
        planner.plan("")


def test_whitespace_goal_raises():
    planner = Planner()
    with pytest.raises(ValueError):
        planner.plan("   ")


def test_navigate_action():
    planner = Planner()
    steps = planner.plan("go to https://example.com")
    actions = [s.action for s in steps]
    assert "navigate" in actions


def test_click_action():
    planner = Planner()
    steps = planner.plan("click the login button")
    actions = [s.action for s in steps]
    assert "click" in actions


def test_type_action():
    planner = Planner()
    steps = planner.plan("type my username into the input field")
    actions = [s.action for s in steps]
    assert "type" in actions


def test_search_action():
    planner = Planner()
    steps = planner.plan("search for cookies policy")
    actions = [s.action for s in steps]
    assert "search" in actions


def test_custom_backend():
    def my_backend(goal, context):
        return [{"action": "custom", "description": "custom step"}]

    planner = Planner(backend=my_backend)
    steps = planner.plan("anything")
    assert steps[0].action == "custom"


def test_unknown_goal_produces_run_step():
    planner = Planner()
    steps = planner.plan("zxqwerty something unusual")
    assert len(steps) == 1
    assert steps[0].action == "run"
