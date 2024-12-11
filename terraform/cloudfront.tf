resource "aws_cloudfront_distribution" "frontend_cdn" {
  origin {
    domain_name = aws_lb.frontend_alb.dns_name
    origin_id   = "FrontendALB"

    custom_origin_config {
      http_port  = 80
      https_port = 443
      origin_ssl_protocols = ["TLSv1.2", "TLSv1.1"]
      origin_protocol_policy = "http-only"
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CloudFront for frontend EC2"
  #default_root_object = "index.html"  # The default page to return

  # Cache settings, you can adjust based on your needs
  default_cache_behavior {
    target_origin_id     = "FrontendALB"
    viewer_protocol_policy = "redirect-to-https"  # Optionally redirect to HTTPS

    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400

    forwarded_values {
      query_string = false  # Set to true if you need to forward query strings to your origin
      cookies {
        forward = "none"  # Can also be set to "all" if you want to forward all cookies
      }
      headers = []  # Use an empty list for no headers, or specify a set of headers to forward
    }

  }

  price_class = "PriceClass_100"  # Based on your region choice

  # Viewer certificate (use default or custom)
  viewer_certificate {
    cloudfront_default_certificate = true  # Use CloudFront's default certificate
  }

  # Optional: Set up restrictions (geo-blocking)
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}
