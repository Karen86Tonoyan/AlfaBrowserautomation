"""Tests for ExecutionAgent."""

import pytest
from alfa.execution_agent import ExecutionAgent, StepResult
from alfa.planner import PlanStep


def _make_step(index, action, desc="step", params=None):
    return PlanStep(index=index, description=desc, action=action, parameters=params or {})


def test_execute_success():
    agent = ExecutionAgent()
    agent.register("navigate", lambda a, p: "ok")
    results = agent.execute([_make_step(0, "navigate")])
    assert results[0].status == "success"
    assert results[0].output == "ok"


def test_execute_no_handler():
    agent = ExecutionAgent()
    results = agent.execute([_make_step(0, "unknown_action")])
    assert results[0].status == "failure"
    assert "No handler registered" in (results[0].error or "")


def test_execute_handler_raises():
    agent = ExecutionAgent()
    agent.register("boom", lambda a, p: (_ for _ in ()).throw(RuntimeError("exploded")))
    results = agent.execute([_make_step(0, "boom")])
    assert results[0].status == "failure"
    assert "exploded" in (results[0].error or "")


def test_execute_multiple_steps():
    agent = ExecutionAgent()
    agent.register("step", lambda a, p: p.get("val"))
    steps = [_make_step(i, "step", params={"val": i}) for i in range(3)]
    results = agent.execute(steps)
    assert len(results) == 3
    assert [r.step_index for r in results] == [0, 1, 2]


def test_wildcard_handler():
    agent = ExecutionAgent()
    agent.register("*", lambda a, p: f"handled:{a}")
    results = agent.execute([_make_step(0, "anything")])
    assert results[0].status == "success"
    assert results[0].output == "handled:anything"


def test_register_non_callable_raises():
    agent = ExecutionAgent()
    with pytest.raises(TypeError):
        agent.register("bad", "not_a_callable")  # type: ignore


def test_handler_via_constructor():
    agent = ExecutionAgent(handlers={"noop": lambda a, p: None})
    results = agent.execute([_make_step(0, "noop")])
    assert results[0].status == "success"
