# API Gateway HTTP API
resource "aws_apigatewayv2_api" "http_api" {
  name          = "BackendAPI"
  protocol_type = "HTTP"
}

# API Gateway Integration
resource "aws_apigatewayv2_integration" "alb_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = "http://${aws_lb.backend.dns_name}:8000" # Use ALB DNS Name
}

# Default Route for Unprotected Endpoints
resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.alb_integration.id}"
}

# Deploy the API Gateway
resource "aws_apigatewayv2_stage" "default_stage" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

# Output API Gateway URL
output "api_gateway_url" {
  value       = aws_apigatewayv2_stage.default_stage.invoke_url
  description = "Public URL for the API Gateway"
}

