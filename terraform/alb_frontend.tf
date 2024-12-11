resource "aws_security_group" "frontend_alb" {
  name_prefix = "frontend-alb-sg"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Allow from CloudFront or public internet
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "FrontendALBSecurityGroup"
  }
}

resource "aws_lb" "frontend_alb" {
  name               = "frontend-alb"
  internal           = false  # Public ALB
  load_balancer_type = "application"
  security_groups    = [aws_security_group.frontend_alb.id]
  subnets            = aws_subnet.public[*].id

  tags = {
    Name = "FrontendALB"
  }
}

# ALB Listener for HTTP (or HTTPS if you're using SSL)
resource "aws_lb_listener" "frontend_http" {
  load_balancer_arn = aws_lb.frontend_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_tg.arn
  }
}

# Target Group for ALB
resource "aws_lb_target_group" "frontend_tg" {
  name     = "frontend-tg"
  port     = 3000  # The port on which your EC2 instances are running
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/health"  # Health check endpoint on your EC2 instances
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    Name = "FrontendTargetGroup"
  }
}

# Register EC2 instances to the target group
resource "aws_lb_target_group_attachment" "frontend_tg_attachment" {
  count            = length(aws_instance.frontend)
  target_group_arn = aws_lb_target_group.frontend_tg.arn
  target_id        = aws_instance.frontend[count.index].id
  port             = 3000
}









