"""
Cerber — Guard / Security Layer
---------------------------------
Cerber is the guardian of the ALFA loop.  It inspects incoming goals,
execution results, and validation reports for three classes of problems:

* **Drift** — the agent's execution deviated from the approved plan.
* **Injection** — the goal or parameters contain malicious payloads.
* **Bad execution** — the run produced dangerous side-effects or outputs.

When Cerber raises a :class:`CerberViolation` the main loop MUST abort or
rollback the current run and log the incident.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any, Callable, Sequence

from .execution_agent import StepResult
from .planner import PlanStep


# ---------------------------------------------------------------------------
# Public types
# ---------------------------------------------------------------------------

class CerberViolation(Exception):
    """Raised when Cerber detects a policy violation."""

    def __init__(self, reason: str, details: dict | None = None) -> None:
        super().__init__(reason)
        self.reason = reason
        self.details = details or {}


@dataclass
class CerberReport:
    """Result of a Cerber inspection pass."""

    safe: bool
    violations: list[str] = field(default_factory=list)
    details: dict = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Injection patterns
# ---------------------------------------------------------------------------

_INJECTION_PATTERNS: list[re.Pattern] = [
    re.compile(r"<script[\s>]", re.IGNORECASE),
    re.compile(r"javascript\s*:", re.IGNORECASE),
    re.compile(r"on\w+\s*=", re.IGNORECASE),           # onclick=, onload=, …
    re.compile(r"(;|\||\&\&|\|\|)\s*(rm|del|drop|exec|eval)\b", re.IGNORECASE),
    re.compile(r"\bUNION\b.*\bSELECT\b", re.IGNORECASE),  # SQL injection
    re.compile(r"\.\./", re.IGNORECASE),                # path traversal
    re.compile(r"%00"),                                 # null-byte injection
    re.compile(r"__import__\s*\(", re.IGNORECASE),      # Python eval injection
]


class Cerber:
    """Guards the ALFA loop against drift, injection, and bad execution.

    Parameters
    ----------
    allowed_actions:
        Whitelist of permitted action names.  Pass ``None`` to allow all.
    max_steps:
        Hard limit on the number of steps per run.
    extra_injection_patterns:
        Additional :class:`re.Pattern` objects to check for injection.
    """

    def __init__(
        self,
        allowed_actions: Sequence[str] | None = None,
        max_steps: int = 50,
        extra_injection_patterns: Sequence[re.Pattern] | None = None,
    ) -> None:
        self._allowed_actions: set[str] | None = (
            set(allowed_actions) if allowed_actions is not None else None
        )
        self._max_steps = max_steps
        self._injection_patterns = list(_INJECTION_PATTERNS) + list(
            extra_injection_patterns or []
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def check_goal(self, goal: str) -> CerberReport:
        """Scan a raw goal string for injection payloads."""
        violations = self._scan_text(goal)
        return CerberReport(safe=not violations, violations=violations)

    def check_plan(self, steps: list[PlanStep]) -> CerberReport:
        """Validate a plan for injection and policy violations."""
        violations: list[str] = []

        if len(steps) > self._max_steps:
            violations.append(
                f"plan exceeds max_steps limit ({len(steps)} > {self._max_steps})"
            )

        for step in steps:
            violations += self._scan_text(step.description, prefix=f"step[{step.index}].description")
            for k, v in step.parameters.items():
                violations += self._scan_text(str(v), prefix=f"step[{step.index}].param.{k}")

            if self._allowed_actions is not None and step.action not in self._allowed_actions:
                violations.append(
                    f"step[{step.index}] action '{step.action}' is not in allowed_actions"
                )

        return CerberReport(safe=not violations, violations=violations)

    def check_results(self, results: list[StepResult]) -> CerberReport:
        """Inspect execution results for dangerous outputs."""
        violations: list[str] = []
        for result in results:
            if result.output is not None:
                violations += self._scan_text(
                    str(result.output), prefix=f"result[{result.step_index}].output"
                )
            if result.error:
                violations += self._scan_text(
                    result.error, prefix=f"result[{result.step_index}].error"
                )
        return CerberReport(safe=not violations, violations=violations)

    def check_drift(
        self, plan: list[PlanStep], results: list[StepResult]
    ) -> CerberReport:
        """Detect execution drift — steps executed that were not in the plan."""
        planned_indices = {s.index for s in plan}
        executed_indices = {r.step_index for r in results}
        extra = executed_indices - planned_indices

        violations = (
            [f"drift detected: executed step indices {sorted(extra)} were not in plan"]
            if extra
            else []
        )
        return CerberReport(safe=not violations, violations=violations)

    def enforce(self, report: CerberReport) -> None:
        """Raise :class:`CerberViolation` if *report* is not safe."""
        if not report.safe:
            raise CerberViolation(
                "; ".join(report.violations),
                details={"violations": report.violations},
            )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _scan_text(self, text: str, prefix: str = "") -> list[str]:
        found: list[str] = []
        for pattern in self._injection_patterns:
            if pattern.search(text):
                label = f"{prefix}: " if prefix else ""
                found.append(
                    f"injection pattern '{pattern.pattern}' matched in {label}'{text[:80]}'"
                )
        return found
