"""
MCP / API Bridge
----------------
Connects the ALFA agent to external services via two mechanisms:

1. **MCP Server** — Model Context Protocol (tool-call JSON over stdio / HTTP).
2. **API Key** — simple REST calls authenticated with a bearer token.

Both mechanisms expose a uniform :meth:`MCPBridge.call` interface so that
the rest of the system doesn't care which transport is used.
"""

from __future__ import annotations

import json
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from typing import Any


@dataclass
class ServiceConfig:
    """Configuration for a single external service."""

    name: str
    transport: str              # "mcp" | "api"
    endpoint: str               # URL or command path
    api_key: str = ""
    headers: dict[str, str] = field(default_factory=dict)
    timeout: int = 30


@dataclass
class BridgeResponse:
    """Normalised response from any external service call."""

    service: str
    success: bool
    data: Any = None
    error: str | None = None
    status_code: int | None = None


class MCPBridge:
    """Unified gateway to external services (MCP or REST API).

    Parameters
    ----------
    services:
        Optional list of :class:`ServiceConfig` objects to pre-register.
    """

    def __init__(self, services: list[ServiceConfig] | None = None) -> None:
        self._services: dict[str, ServiceConfig] = {}
        for svc in (services or []):
            self.register(svc)

    # ------------------------------------------------------------------
    # Service registry
    # ------------------------------------------------------------------

    def register(self, config: ServiceConfig) -> None:
        """Register (or replace) a service configuration."""
        self._services[config.name] = config

    def unregister(self, name: str) -> None:
        """Remove a service by name (no-op if not registered)."""
        self._services.pop(name, None)

    def list_services(self) -> list[str]:
        """Return names of all registered services."""
        return list(self._services.keys())

    # ------------------------------------------------------------------
    # Unified call interface
    # ------------------------------------------------------------------

    def call(
        self,
        service_name: str,
        tool_or_path: str,
        payload: dict | None = None,
    ) -> BridgeResponse:
        """Invoke a tool or endpoint on the named service.

        Parameters
        ----------
        service_name:
            Name used when registering the service.
        tool_or_path:
            For MCP: tool name.  For API: URL path suffix.
        payload:
            Request body / arguments dict.

        Returns
        -------
        BridgeResponse
        """
        config = self._services.get(service_name)
        if config is None:
            return BridgeResponse(
                service=service_name,
                success=False,
                error=f"Service '{service_name}' is not registered",
            )

        if config.transport == "mcp":
            return self._call_mcp(config, tool_or_path, payload or {})
        if config.transport == "api":
            return self._call_api(config, tool_or_path, payload or {})

        return BridgeResponse(
            service=service_name,
            success=False,
            error=f"Unknown transport '{config.transport}'",
        )

    # ------------------------------------------------------------------
    # MCP transport
    # ------------------------------------------------------------------

    def _call_mcp(
        self, config: ServiceConfig, tool: str, arguments: dict
    ) -> BridgeResponse:
        """Send a JSON-RPC tool-call request to an MCP HTTP server."""
        body = json.dumps(
            {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "tools/call",
                "params": {"name": tool, "arguments": arguments},
            }
        ).encode()

        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            **config.headers,
        }
        if config.api_key:
            headers["Authorization"] = "Bearer " + config.api_key

        return self._http_request(config, config.endpoint, headers, body)

    # ------------------------------------------------------------------
    # REST API transport
    # ------------------------------------------------------------------

    def _call_api(
        self, config: ServiceConfig, path: str, payload: dict
    ) -> BridgeResponse:
        """POST *payload* to ``config.endpoint + path``."""
        url = config.endpoint.rstrip("/") + "/" + path.lstrip("/")
        body = json.dumps(payload).encode()

        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            **config.headers,
        }
        if config.api_key:
            headers["Authorization"] = "Bearer " + config.api_key

        return self._http_request(config, url, headers, body)

    # ------------------------------------------------------------------
    # Low-level HTTP helper (stdlib only — no extra dependencies)
    # ------------------------------------------------------------------

    def _http_request(
        self, config: ServiceConfig, url: str, headers: dict, body: bytes
    ) -> BridgeResponse:
        req = urllib.request.Request(url, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=config.timeout) as resp:
                raw = resp.read().decode()
                data = json.loads(raw) if raw else {}
                return BridgeResponse(
                    service=config.name,
                    success=True,
                    data=data,
                    status_code=resp.status,
                )
        except urllib.error.HTTPError as exc:
            return BridgeResponse(
                service=config.name,
                success=False,
                error=str(exc),
                status_code=exc.code,
            )
        except Exception as exc:  # noqa: BLE001
            return BridgeResponse(
                service=config.name,
                success=False,
                error=str(exc),
            )
