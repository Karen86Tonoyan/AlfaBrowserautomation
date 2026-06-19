"""
ALFA Agent — Main Orchestrator
-------------------------------
Implements the full **ALFA Operational Learning Loop**:

    PLAN → EXECUTE → VALIDATE → LOG → LEARN → SKILL → NEXT RUN

Usage example::

    from alfa import ALFAAgent

    agent = ALFAAgent()
    agent.execution_agent.register("navigate", my_navigate_handler)
    result = agent.run("Open https://example.com and extract the page title")
    print(result.status)          # "success" | "failure" | "blocked"
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .cerber import Cerber, CerberViolation
from .execution_agent import ExecutionAgent, StepResult
from .memory_store import MemoryStore
from .mcp_bridge import MCPBridge
from .planner import Planner
from .skill_builder import Skill, SkillBuilder
from .validator import LocalValidator, ValidationReport


# ---------------------------------------------------------------------------
# Run result
# ---------------------------------------------------------------------------

@dataclass
class RunResult:
    """Full outcome of a single ALFA loop execution."""

    run_id: int | None
    goal: str
    status: str                              # "success" | "failure" | "blocked"
    step_results: list[StepResult] = field(default_factory=list)
    validation_report: ValidationReport | None = None
    skills_learned: list[Skill] = field(default_factory=list)
    error: str | None = None


# ---------------------------------------------------------------------------
# ALFA Agent
# ---------------------------------------------------------------------------

class ALFAAgent:
    """ALFA Agent Control System.

    All sub-components are created with sensible defaults and exposed as
    public attributes so callers can customise them before or between runs.

    Parameters
    ----------
    planner:
        Custom :class:`~alfa.planner.Planner`.  Defaults to a new instance.
    execution_agent:
        Custom :class:`~alfa.execution_agent.ExecutionAgent`.
    validator:
        Custom :class:`~alfa.validator.LocalValidator`.
    cerber:
        Custom :class:`~alfa.cerber.Cerber` guard.
    skill_builder:
        Custom :class:`~alfa.skill_builder.SkillBuilder`.
    memory_store:
        Custom :class:`~alfa.memory_store.MemoryStore`.
        Pass ``None`` to use an in-memory SQLite store (``":memory:"``).
    mcp_bridge:
        Custom :class:`~alfa.mcp_bridge.MCPBridge`.
    """

    def __init__(
        self,
        planner: Planner | None = None,
        execution_agent: ExecutionAgent | None = None,
        validator: LocalValidator | None = None,
        cerber: Cerber | None = None,
        skill_builder: SkillBuilder | None = None,
        memory_store: MemoryStore | None = None,
        mcp_bridge: MCPBridge | None = None,
    ) -> None:
        self.planner = planner or Planner()
        self.execution_agent = execution_agent or ExecutionAgent()
        self.validator = validator or LocalValidator()
        self.cerber = cerber or Cerber()
        self.skill_builder = skill_builder or SkillBuilder()
        self.memory = memory_store or MemoryStore(":memory:")
        self.mcp_bridge = mcp_bridge or MCPBridge()

    # ------------------------------------------------------------------
    # Main loop
    # ------------------------------------------------------------------

    def run(self, goal: str, context: dict | None = None) -> RunResult:
        """Execute a complete ALFA loop for *goal* and return a :class:`RunResult`.

        The loop steps are:

        1. **PLAN**     — Planner decomposes goal into steps.
        2. **CERBER**   — Guard checks goal and plan for injection / policy.
        3. **EXECUTE**  — Execution Agent runs each step.
        4. **CERBER**   — Guard checks drift and execution results.
        5. **VALIDATE** — Local Validator checks results against checkpoints.
        6. **LOG**      — Memory Store persists the run history.
        7. **LEARN + SKILL** — Skill Builder extracts rules and saves them.
        """
        run_id = self.memory.start_run(goal)

        # ── 1. PLAN ──────────────────────────────────────────────────────
        try:
            ctx = dict(context or {})
            ctx["skills"] = self.memory.get_skills()
            steps = self.planner.plan(goal, ctx)
        except Exception as exc:  # noqa: BLE001
            self.memory.finish_run(run_id, "failure")
            return RunResult(run_id=run_id, goal=goal, status="failure", error=f"Plan error: {exc}")

        # ── 2. CERBER — goal + plan check ────────────────────────────────
        try:
            self.cerber.enforce(self.cerber.check_goal(goal))
            self.cerber.enforce(self.cerber.check_plan(steps))
        except CerberViolation as exc:
            self.memory.finish_run(run_id, "blocked")
            return RunResult(run_id=run_id, goal=goal, status="blocked", error=str(exc))

        # ── 3. EXECUTE ───────────────────────────────────────────────────
        step_results = self.execution_agent.execute(steps)

        # ── 4. CERBER — drift + results check ────────────────────────────
        try:
            self.cerber.enforce(self.cerber.check_drift(steps, step_results))
            self.cerber.enforce(self.cerber.check_results(step_results))
        except CerberViolation as exc:
            self._log_steps(run_id, step_results)
            self.memory.finish_run(run_id, "blocked")
            return RunResult(
                run_id=run_id,
                goal=goal,
                status="blocked",
                step_results=step_results,
                error=str(exc),
            )

        # ── 5. VALIDATE ──────────────────────────────────────────────────
        validation_report = self.validator.validate(step_results)

        # ── 6. LOG ───────────────────────────────────────────────────────
        self._log_steps(run_id, step_results)
        final_status = "success" if validation_report.passed else "failure"
        self.memory.finish_run(run_id, final_status)

        # ── 7. LEARN + SKILL ─────────────────────────────────────────────
        skills = self.skill_builder.learn(goal, step_results, validation_report, self.memory)

        return RunResult(
            run_id=run_id,
            goal=goal,
            status=final_status,
            step_results=step_results,
            validation_report=validation_report,
            skills_learned=skills,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _log_steps(self, run_id: int, results: list[StepResult]) -> None:
        for r in results:
            self.memory.log_step(
                run_id=run_id,
                step_index=r.step_index,
                description=r.description,
                status=r.status,
                result=r.output,
                error=r.error,
            )
