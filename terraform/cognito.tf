resource "aws_cognito_user_pool" "main" {
  name = "my-user-pool"

  # Add password policy
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  # Add username attributes and auto verify email
  username_attributes = ["email"]
  auto_verified_attributes = ["email"]

  # Add schema attributes
  schema {
    name                = "name"
    attribute_data_type = "String"
    mutable            = true
    required           = true
    
    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    name                = "email"
    attribute_data_type = "String"
    mutable             = true
    required            = true

    string_attribute_constraints {
      min_length = 7
      max_length = 256
    }
  }

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  tags = {
    Name        = "MainUserPool"
  }
}

resource "aws_cognito_user_pool_client" "frontend_client" {
  name         = "frontend-client"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = false
  
  # OAuth configuration
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  callback_urls = ["https://${aws_cloudfront_distribution.frontend_cdn.domain_name}/callback"]
  logout_urls   = ["https://${aws_cloudfront_distribution.frontend_cdn.domain_name}/logout"]
  supported_identity_providers         = ["COGNITO"]
}

resource "aws_cognito_user_pool_domain" "domain" {
  domain       = "my-random-domain"
  user_pool_id = aws_cognito_user_pool.main.id
}

