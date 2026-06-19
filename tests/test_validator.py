"""Tests for LocalValidator."""

import pytest
from alfa.execution_agent import StepResult
from alfa.validator import LocalValidator, ValidationReport


def _success(index=0):
    return StepResult(index, "desc", "navigate", "success", output="ok")


def _failure(index=0, error="timeout"):
    return StepResult(index, "desc", "navigate", "failure", error=error)


def test_all_success_passes():
    v = LocalValidator()
    report = v.validate([_success(0), _success(1)])
    assert report.passed is True


def test_critical_failure_fails_report():
    v = LocalValidator()
    report = v.validate([_failure(error="timeout exception in browser")])
    assert report.passed is False


def test_non_critical_failure_passes_builtin():
    v = LocalValidator()
    # "element not found" is not in the critical keywords list
    report = v.validate([_failure(error="element not found")])
    assert report.passed is True


def test_custom_checkpoint_passes():
    v = LocalValidator()
    v.add_checkpoint("output_not_none", lambda r: r.output is not None)
    report = v.validate([_success()])
    assert all(c.passed for c in report.checkpoint_results if c.checkpoint_name == "output_not_none")


def test_custom_checkpoint_fails():
    v = LocalValidator()
    v.add_checkpoint("always_fail", lambda r: False)
    report = v.validate([_success()])
    assert report.passed is False


def test_remove_checkpoint():
    v = LocalValidator()
    v.add_checkpoint("temp", lambda r: False)
    v.remove_checkpoint("temp")
    report = v.validate([_success()])
    assert report.passed is True


def test_no_checkpoint_non_callable_raises():
    v = LocalValidator()
    with pytest.raises(TypeError):
        v.add_checkpoint("bad", "not_callable")  # type: ignore


def test_failed_checkpoints_property():
    v = LocalValidator()
    v.add_checkpoint("always_fail", lambda r: False)
    report = v.validate([_success()])
    assert len(report.failed_checkpoints) > 0


def test_checkpoint_exception_handled():
    v = LocalValidator()
    def exploding(r):
        raise RuntimeError("boom")
    v.add_checkpoint("exploder", exploding)
    report = v.validate([_success()])
    assert report.passed is False
