# Security Group for Backend ALB
resource "aws_security_group" "backend_alb" {
  name_prefix = "backend-alb-sg"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "BackendALBSecurityGroup"
  }
}

# Backend ALB
resource "aws_lb" "backend" {
  name               = "backend-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.backend_alb.id]
  subnets            = aws_subnet.public[*].id

  tags = {
    Name = "BackendLoadBalancer"
  }
}

# Backend Target Group
resource "aws_lb_target_group" "backend" {
  name        = "backend-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "BackendTargetGroup"
  }
}

# Register Backend EC2 Instances to ALB
resource "aws_lb_target_group_attachment" "backend" {
  count            = length(aws_instance.frontend)
  target_group_arn = aws_lb_target_group.backend.arn
  target_id        = aws_instance.frontend[count.index].id
  port             = 80
}

# ALB Listener for Backend
resource "aws_lb_listener" "backend_http" {
  load_balancer_arn = aws_lb.backend.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# Outputs for Backend ALB
output "backend_alb_dns" {
  value = aws_lb.backend.dns_name
  description = "DNS name of the backend Application Load Balancer"
}
