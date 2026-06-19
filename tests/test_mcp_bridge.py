"""Tests for MCPBridge."""

import json
import pytest
from unittest.mock import MagicMock, patch
from alfa.mcp_bridge import MCPBridge, ServiceConfig, BridgeResponse


def _api_config(name="svc"):
    return ServiceConfig(name=name, transport="api", endpoint="http://localhost:9999", api_key="test_key")


def _mcp_config(name="mcp_svc"):
    return ServiceConfig(name=name, transport="mcp", endpoint="http://localhost:8888/mcp", api_key="tok")


def test_register_and_list():
    bridge = MCPBridge()
    bridge.register(_api_config("svc1"))
    bridge.register(_api_config("svc2"))
    assert set(bridge.list_services()) == {"svc1", "svc2"}


def test_unregister():
    bridge = MCPBridge()
    bridge.register(_api_config("svc1"))
    bridge.unregister("svc1")
    assert "svc1" not in bridge.list_services()


def test_call_unregistered_service():
    bridge = MCPBridge()
    response = bridge.call("missing_svc", "tool")
    assert response.success is False
    assert "not registered" in (response.error or "")


def test_unknown_transport():
    bridge = MCPBridge()
    bridge.register(ServiceConfig(name="bad", transport="ftp", endpoint="ftp://x"))
    response = bridge.call("bad", "tool")
    assert response.success is False
    assert "Unknown transport" in (response.error or "")


def test_api_call_success():
    bridge = MCPBridge()
    bridge.register(_api_config())

    mock_resp = MagicMock()
    mock_resp.read.return_value = b'{"result": "ok"}'
    mock_resp.status = 200
    mock_resp.__enter__ = lambda s: s
    mock_resp.__exit__ = MagicMock(return_value=False)

    with patch("urllib.request.urlopen", return_value=mock_resp):
        response = bridge.call("svc", "endpoint", {"key": "value"})

    assert response.success is True
    assert response.data == {"result": "ok"}
    assert response.status_code == 200


def test_api_call_http_error():
    import urllib.error
    bridge = MCPBridge()
    bridge.register(_api_config())

    with patch("urllib.request.urlopen", side_effect=urllib.error.HTTPError(
        url=None, code=500, msg="Internal Server Error", hdrs=None, fp=None
    )):
        response = bridge.call("svc", "endpoint")

    assert response.success is False
    assert response.status_code == 500


def test_api_call_connection_error():
    bridge = MCPBridge()
    bridge.register(_api_config())

    with patch("urllib.request.urlopen", side_effect=ConnectionRefusedError("refused")):
        response = bridge.call("svc", "endpoint")

    assert response.success is False
    assert response.error is not None


def test_mcp_call_success():
    bridge = MCPBridge()
    bridge.register(_mcp_config())

    mock_resp = MagicMock()
    mock_resp.read.return_value = b'{"jsonrpc":"2.0","id":1,"result":{"content":"data"}}'
    mock_resp.status = 200
    mock_resp.__enter__ = lambda s: s
    mock_resp.__exit__ = MagicMock(return_value=False)

    with patch("urllib.request.urlopen", return_value=mock_resp):
        response = bridge.call("mcp_svc", "some_tool", {"arg": 1})

    assert response.success is True
