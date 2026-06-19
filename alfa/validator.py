"""
Local Validator
---------------
Checks each :class:`~alfa.execution_agent.StepResult` against a set of
*checkpoint* rules and produces a :class:`ValidationReport`.

Validators are plain callables: ``(StepResult) -> bool``.
Custom validators can be added via :meth:`LocalValidator.add_checkpoint`.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable

from .execution_agent import StepResult


@dataclass
class CheckpointResult:
    """Outcome of a single checkpoint evaluation."""

    checkpoint_name: str
    passed: bool
    step_index: int
    message: str = ""


@dataclass
class ValidationReport:
    """Aggregated validation result for a full run."""

    passed: bool
    checkpoint_results: list[CheckpointResult] = field(default_factory=list)

    @property
    def failed_checkpoints(self) -> list[CheckpointResult]:
        return [c for c in self.checkpoint_results if not c.passed]


# A checkpoint is callable: (StepResult) -> bool
CheckpointFn = Callable[[StepResult], bool]


class LocalValidator:
    """Validates step results against registered checkpoints.

    The validator ships with sensible built-in checks; additional
    domain-specific rules can be injected at runtime.
    """

    def __init__(self) -> None:
        self._checkpoints: dict[str, CheckpointFn] = {}
        self._register_builtin_checkpoints()

    # ------------------------------------------------------------------
    # Checkpoint management
    # ------------------------------------------------------------------

    def add_checkpoint(self, name: str, fn: CheckpointFn) -> None:
        """Register a named checkpoint function.

        Parameters
        ----------
        name:
            Unique name for the checkpoint (used in reports).
        fn:
            Callable ``(StepResult) -> bool``; return ``True`` to pass.
        """
        if not callable(fn):
            raise TypeError(f"checkpoint '{name}' must be callable")
        self._checkpoints[name] = fn

    def remove_checkpoint(self, name: str) -> None:
        """Remove a checkpoint by name (no-op if not found)."""
        self._checkpoints.pop(name, None)

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------

    def validate(self, results: list[StepResult]) -> ValidationReport:
        """Validate every step result and return a :class:`ValidationReport`.

        Parameters
        ----------
        results:
            List of step results from :class:`~alfa.execution_agent.ExecutionAgent`.
        """
        checkpoint_results: list[CheckpointResult] = []

        for step_result in results:
            for cp_name, cp_fn in self._checkpoints.items():
                try:
                    passed = bool(cp_fn(step_result))
                    msg = "" if passed else f"checkpoint '{cp_name}' failed for step {step_result.step_index}"
                except Exception as exc:  # noqa: BLE001
                    passed = False
                    msg = f"checkpoint '{cp_name}' raised {exc}"

                checkpoint_results.append(
                    CheckpointResult(
                        checkpoint_name=cp_name,
                        passed=passed,
                        step_index=step_result.step_index,
                        message=msg,
                    )
                )

        overall = all(cr.passed for cr in checkpoint_results)
        return ValidationReport(passed=overall, checkpoint_results=checkpoint_results)

    # ------------------------------------------------------------------
    # Built-in checkpoints
    # ------------------------------------------------------------------

    def _register_builtin_checkpoints(self) -> None:
        self.add_checkpoint("no_critical_failure", _check_no_critical_failure)
        self.add_checkpoint("has_action", _check_has_action)


# ---------------------------------------------------------------------------
# Built-in checkpoint implementations
# ---------------------------------------------------------------------------

def _check_no_critical_failure(result: StepResult) -> bool:
    """Pass unless the step failed AND the error looks critical."""
    if result.status != "failure":
        return True
    error = (result.error or "").lower()
    critical_keywords = ("exception", "crash", "timeout", "killed", "segfault")
    return not any(kw in error for kw in critical_keywords)


def _check_has_action(result: StepResult) -> bool:
    """Pass if the step has a non-empty action string."""
    return bool(result.action and result.action.strip())
