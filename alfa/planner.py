"""
Planner Head
------------
Receives a high-level *goal* and produces an ordered list of
:class:`PlanStep` objects that the Execution Agent will carry out.

In production the ``LLMBackend`` callable is replaced by a real LLM
(OpenAI, Anthropic, local Ollama, etc.).  During testing / offline
use the built-in ``SimplePlanner`` heuristic is used instead.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Sequence


@dataclass
class PlanStep:
    """A single, atomic step in the execution plan."""

    index: int
    description: str
    action: str
    parameters: dict = field(default_factory=dict)


# Type alias for any callable that takes (goal, context) → list[dict]
LLMBackend = Callable[[str, dict], list[dict]]


class Planner:
    """Planner Head — decomposes a goal into executable steps.

    Parameters
    ----------
    backend:
        Optional LLM backend.  Must be a callable with signature
        ``(goal: str, context: dict) -> list[dict]`` where each dict
        contains at least ``action`` and ``description`` keys.
        When *None*, :class:`SimplePlanner` heuristics are used.
    """

    def __init__(self, backend: LLMBackend | None = None) -> None:
        self._backend = backend or _simple_heuristic

    def plan(self, goal: str, context: dict | None = None) -> list[PlanStep]:
        """Generate an ordered execution plan for *goal*.

        Parameters
        ----------
        goal:
            Natural-language description of the task to accomplish.
        context:
            Optional dict with extra information (skills, memory
            excerpts, available tools, …).

        Returns
        -------
        list[PlanStep]
            Ordered list of steps to execute.
        """
        if not goal or not goal.strip():
            raise ValueError("goal must be a non-empty string")

        raw_steps: list[dict] = self._backend(goal.strip(), context or {})
        return [
            PlanStep(
                index=i,
                description=s.get("description", s.get("action", "")),
                action=s.get("action", "run"),
                parameters=s.get("parameters", {}),
            )
            for i, s in enumerate(raw_steps)
        ]


# ---------------------------------------------------------------------------
# Built-in fallback heuristic (no LLM required)
# ---------------------------------------------------------------------------

def _simple_heuristic(goal: str, context: dict) -> list[dict]:  # noqa: ARG001
    """Minimal, rule-based decomposition used when no LLM is configured."""
    tokens = goal.lower().split()
    steps: list[dict] = []

    if any(kw in tokens for kw in ("open", "navigate", "go", "visit", "browse")):
        steps.append({"action": "navigate", "description": f"Navigate as required: {goal}"})

    if any(kw in tokens for kw in ("click", "press", "submit", "tap")):
        steps.append({"action": "click", "description": f"Interact with element: {goal}"})

    if any(kw in tokens for kw in ("type", "fill", "enter", "input", "write")):
        steps.append({"action": "type", "description": f"Enter text: {goal}"})

    if any(kw in tokens for kw in ("read", "extract", "scrape", "get", "fetch")):
        steps.append({"action": "extract", "description": f"Extract data: {goal}"})

    if any(kw in tokens for kw in ("search", "find", "look")):
        steps.append({"action": "search", "description": f"Search: {goal}"})

    if any(kw in tokens for kw in ("wait", "pause", "sleep")):
        steps.append({"action": "wait", "description": "Wait for condition"})

    if not steps:
        steps.append({"action": "run", "description": goal})

    return steps
