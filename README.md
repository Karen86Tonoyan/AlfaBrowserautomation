# AlfaBrowserautomation

Agenci przegladarki sterowani przez gigantow ale wciaz zachowujesz prywatnosc i lokalne dane.

---

## ALFA Agent Control System

> **ALFA Operational Learning Loop**
>
> ```
> PLAN → EXECUTE → VALIDATE → LOG → LEARN → SKILL → NEXT RUN
> ```

### Architecture

| Component | Module | Responsibility |
|---|---|---|
| **Planner Head** | `alfa/planner.py` | Receives a goal and produces an ordered list of `PlanStep` objects. Supports pluggable LLM backends (OpenAI, Anthropic, local Ollama, …). |
| **Execution Agent** | `alfa/execution_agent.py` | Runs each step by dispatching to registered action handlers (Playwright, requests, …). |
| **Local Validator** | `alfa/validator.py` | Checks every `StepResult` against named checkpoint rules. Fully extensible. |
| **Cerber** | `alfa/cerber.py` | Security & integrity guard — blocks prompt injection, path traversal, SQL injection, execution drift, and policy violations. |
| **Skill Builder** | `alfa/skill_builder.py` | Distils run outcomes (success / failure) into named skill rules for future runs. |
| **Memory Store** | `alfa/memory_store.py` | SQLite-backed, fully local persistence of runs, steps, and skills. |
| **MCP/API Bridge** | `alfa/mcp_bridge.py` | Unified gateway to external services via MCP (JSON-RPC) or REST API key. |

### Quick Start

```python
from alfa import ALFAAgent

# Create agent (in-memory SQLite by default)
agent = ALFAAgent()

# Register action handlers (e.g. Playwright-based)
agent.execution_agent.register("navigate", lambda action, params: ...)
agent.execution_agent.register("click",    lambda action, params: ...)
agent.execution_agent.register("type",     lambda action, params: ...)

# Run the full loop
result = agent.run("Open https://example.com and extract the page title")
print(result.status)           # "success" | "failure" | "blocked"
print(result.skills_learned)   # rules learned from this run
```

### Connect an external LLM planner

```python
import openai
from alfa import ALFAAgent
from alfa.planner import Planner

def openai_backend(goal: str, context: dict) -> list[dict]:
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": f"Break this task into steps: {goal}"}],
    )
    # parse response into list[dict] with "action" and "description" keys
    ...

agent = ALFAAgent(planner=Planner(backend=openai_backend))
```

### Connect an MCP service

```python
from alfa.mcp_bridge import MCPBridge, ServiceConfig

bridge = MCPBridge()
bridge.register(ServiceConfig(
    name="browser",
    transport="mcp",
    endpoint="http://localhost:3000/mcp",
    api_key="my_secret_key",
))
response = bridge.call("browser", "screenshot", {"url": "https://example.com"})
```

### Persistent memory

```python
from alfa import ALFAAgent
from alfa.memory_store import MemoryStore

agent = ALFAAgent(memory_store=MemoryStore("alfa_memory.db"))
agent.run("...")                        # results saved to disk
print(agent.memory.get_recent_runs())  # browse history
print(agent.memory.get_skills())       # browse learned rules
```

### Development

```bash
pip install -r requirements.txt
pytest
```

### Privacy

All decision history and learned skills are stored in a **local SQLite database** (`alfa_memory.db`).  
No data is sent to any external service unless you explicitly register and call an `MCPBridge` service.
