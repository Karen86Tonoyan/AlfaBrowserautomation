"""
Execution Agent
---------------
Receives a list of :class:`~alfa.planner.PlanStep` objects and
executes them one by one, invoking the registered action handler for
each step.

Handlers are plain callables registered via :meth:`ExecutionAgent.register`.
This design keeps the agent decoupled from any specific browser or API
library — swap the handlers to target Playwright, Selenium, requests, etc.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass
class StepResult:
    """Outcome of executing a single plan step."""

    step_index: int
    description: str
    action: str
    status: str          # "success" | "failure" | "skipped"
    output: Any = None
    error: str | None = None


# A handler receives (action, parameters) and returns any output value.
ActionHandler = Callable[[str, dict], Any]


class ExecutionAgent:
    """Runs plan steps by dispatching to registered action handlers.

    Parameters
    ----------
    handlers:
        Optional initial mapping of ``action_name → callable``.
    """

    def __init__(self, handlers: dict[str, ActionHandler] | None = None) -> None:
        self._handlers: dict[str, ActionHandler] = {}
        for name, fn in (handlers or {}).items():
            self.register(name, fn)

    # ------------------------------------------------------------------
    # Handler registration
    # ------------------------------------------------------------------

    def register(self, action: str, handler: ActionHandler) -> None:
        """Register *handler* for *action*.

        Parameters
        ----------
        action:
            Action name as produced by the planner (e.g. ``"navigate"``).
        handler:
            Callable ``(action: str, parameters: dict) -> Any``.
        """
        if not callable(handler):
            raise TypeError(f"handler for '{action}' must be callable")
        self._handlers[action] = handler

    # ------------------------------------------------------------------
    # Execution
    # ------------------------------------------------------------------

    def execute(self, steps: list) -> list[StepResult]:
        """Execute *steps* in order and return a result for each.

        Execution continues even if a step fails so that the validator
        and Cerber can inspect the full run.

        Parameters
        ----------
        steps:
            List of :class:`~alfa.planner.PlanStep` objects.
        """
        results: list[StepResult] = []
        for step in steps:
            result = self._execute_step(step)
            results.append(result)
        return results

    def _execute_step(self, step) -> StepResult:
        handler = self._handlers.get(step.action) or self._handlers.get("*")
        if handler is None:
            return StepResult(
                step_index=step.index,
                description=step.description,
                action=step.action,
                status="failure",
                error=f"No handler registered for action '{step.action}'",
            )

        try:
            output = handler(step.action, step.parameters)
            return StepResult(
                step_index=step.index,
                description=step.description,
                action=step.action,
                status="success",
                output=output,
            )
        except Exception as exc:  # noqa: BLE001
            return StepResult(
                step_index=step.index,
                description=step.description,
                action=step.action,
                status="failure",
                error=str(exc),
            )
