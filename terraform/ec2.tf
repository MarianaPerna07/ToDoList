# Security Group for EC2 instances
resource "aws_security_group" "ec2" {
  name_prefix = "ec2-sg-"
  vpc_id      = aws_vpc.main.id

  # Allow all inbound traffic
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "EC2SecurityGroup"
  }
}

resource "aws_instance" "frontend" {
  count             = 3
  ami               = "ami-08eb150f611ca277f"  # replace with your preferred AMI ID
  instance_type     = "t3.xlarge"
  subnet_id         = aws_subnet.public[count.index].id
  key_name          = "ec2-key"
  associate_public_ip_address = true

  # Attach the security group
  vpc_security_group_ids = [aws_security_group.ec2.id]

  # Define the storage
  root_block_device {
    volume_size = 20
    volume_type = "gp2"
  }

  tags = {
    Name = "FrontendEC2Instance-${count.index + 1}"
  }
}

resource "aws_instance" "backend" {
  count             = 3
  ami               = "ami-08eb150f611ca277f"  # replace with your preferred AMI ID
  instance_type     = "t3.xlarge" #t3.micro
  subnet_id         = aws_subnet.private[count.index].id
  key_name          = "ec2-key"
  associate_public_ip_address = false

  # Attach the security group
  vpc_security_group_ids = [aws_security_group.ec2.id]

  # Define the storage
  root_block_device {
    volume_size = 20
    volume_type = "gp2"
  }

  tags = {
    Name = "BackendEC2Instance-${count.index + 1}"
  }
}

# Define EC2 instances
# resource "aws_instance" "ec2_instance" {
#   count         = 6
#   ami           = "ami-08eb150f611ca277f" # Replace with the latest Ubuntu AMI ID for your region
#   instance_type = "t3.micro"
#   key_name      = "ec2-key" # Predefined key pair name

#   # Assign a subnet from the earlier configuration
#   subnet_id = [
#     aws_subnet.public[0].id,
#     aws_subnet.public[1].id,
#     aws_subnet.public[2].id,
#     aws_subnet.private[0].id,
#     aws_subnet.private[1].id,
#     aws_subnet.private[2].id
#   ][count.index]

#   # Enable public IP only for instances in public subnets
#   associate_public_ip_address = count.index < 3

#   # Attach the security group
#   vpc_security_group_ids = [aws_security_group.ec2.id]

#   # Define the storage
#   root_block_device {
#     volume_size = 8
#     volume_type = "gp2"
#   }

#   tags = {
#     Name = "EC2Instance-${count.index + 1}"
#   }
# }

