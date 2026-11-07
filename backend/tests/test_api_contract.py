def test_health_endpoint_and_versioned_openapi(api_client):
    client, _ = api_client

    health = client.get("/api/v1/health")
    assert health.status_code == 200
    assert health.json() == {"status": "ok", "service": "api"}

    specification = client.get("/api/v1/openapi.json").json()
    assert "/api/v1/auth/sign-in/email" in specification["paths"]
    assert "/api/v1/organizations/{organizationId}/members" in specification["paths"]
    assert "CreateOrganizationRequest" in specification["components"]["schemas"]
    assert "ApiErrorResponse" in specification["components"]["schemas"]
