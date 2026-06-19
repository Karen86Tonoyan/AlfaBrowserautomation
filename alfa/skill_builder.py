"""
Skill Builder
-------------
Analyses run outcomes and distils them into reusable *skills* — named
rules that the Planner can consult in future runs to make better plans.

Skills are persisted via :class:`~alfa.memory_store.MemoryStore`.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

from .execution_agent import StepResult
from .validator import ValidationReport


@dataclass
class Skill:
    """A learned rule derived from run experience."""

    name: str
    rule: str
    origin: str = ""


class SkillBuilder:
    """Converts run success / failure into reusable skill rules.

    Parameters
    ----------
    min_failure_rate:
        Fraction of failed steps above which a *avoid* skill is created.
        Default is ``0.5`` (50 %).
    """

    def __init__(self, min_failure_rate: float = 0.5) -> None:
        if not 0.0 <= min_failure_rate <= 1.0:
            raise ValueError("min_failure_rate must be between 0.0 and 1.0")
        self._min_failure_rate = min_failure_rate

    # ------------------------------------------------------------------
    # Core API
    # ------------------------------------------------------------------

    def extract_skills(
        self,
        goal: str,
        results: list[StepResult],
        report: ValidationReport,
    ) -> list[Skill]:
        """Derive skills from the outcomes of a run.

        Parameters
        ----------
        goal:
            The original task goal.
        results:
            Step-level execution results.
        report:
            Validation report produced by :class:`~alfa.validator.LocalValidator`.

        Returns
        -------
        list[Skill]
            Zero or more skills that should be persisted.
        """
        skills: list[Skill] = []

        if not results:
            return skills

        total = len(results)
        failed = sum(1 for r in results if r.status == "failure")
        failure_rate = failed / total

        # --- success skill ---
        if report.passed and failure_rate == 0:
            skills.append(
                Skill(
                    name=_goal_to_skill_name(goal, "success"),
                    rule=(
                        f"When goal matches '{_truncate(goal)}': all {total} steps succeeded. "
                        "Reuse this plan structure."
                    ),
                    origin=f"auto:success:{goal[:60]}",
                )
            )

        # --- failure avoidance skill ---
        if failure_rate >= self._min_failure_rate:
            failed_actions = list({r.action for r in results if r.status == "failure"})
            skills.append(
                Skill(
                    name=_goal_to_skill_name(goal, "avoid"),
                    rule=(
                        f"When goal matches '{_truncate(goal)}': "
                        f"{failed} of {total} steps failed "
                        f"(actions: {failed_actions}). "
                        "Consider a different approach or pre-condition check."
                    ),
                    origin=f"auto:failure:{goal[:60]}",
                )
            )

        # --- per-action failure skill ---
        for result in results:
            if result.status == "failure" and result.error:
                skills.append(
                    Skill(
                        name=f"fix_{result.action}_{_sanitize(result.error[:30])}",
                        rule=(
                            f"Action '{result.action}' failed with: {result.error}. "
                            "Add a pre-check or fallback handler."
                        ),
                        origin=f"auto:step_error:{result.action}",
                    )
                )

        return skills

    # ------------------------------------------------------------------
    # Convenience: persist directly to a MemoryStore
    # ------------------------------------------------------------------

    def learn(self, goal: str, results: list[StepResult], report: ValidationReport, memory) -> list[Skill]:
        """Extract skills and save them to *memory*.

        Parameters
        ----------
        memory:
            A :class:`~alfa.memory_store.MemoryStore` instance.
        """
        skills = self.extract_skills(goal, results, report)
        for skill in skills:
            memory.save_skill(skill.name, skill.rule, skill.origin)
        return skills


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _goal_to_skill_name(goal: str, suffix: str) -> str:
    base = _sanitize(goal[:40])
    return f"{base}_{suffix}"


def _sanitize(text: str) -> str:
    """Convert arbitrary text to a snake_case identifier fragment."""
    return re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")


def _truncate(text: str, max_len: int = 60) -> str:
    return text[:max_len] + ("…" if len(text) > max_len else "")
