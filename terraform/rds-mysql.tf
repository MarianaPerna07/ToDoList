# Create a Security Group for RDS
resource "aws_security_group" "rds" {
  name_prefix = "rds-sg-"
  vpc_id      = aws_vpc.main.id

  # Allow MySQL traffic within the VPC
  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["10.20.0.0/16"] # VPC CIDR block
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "RDSSecurityGroup"
  }
}

# Create a Parameter Group for MySQL
resource "aws_db_parameter_group" "mysql" {
  name        = "mysql-parameter-group"
  family      = "mysql8.0"
  description = "Parameter group for MySQL"

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }

  parameter {
    name  = "collation_server"
    value = "utf8mb4_general_ci"
  }

  tags = {
    Name = "MySQLParameterGroup"
  }
}

# Create Subnet Group for RDS
resource "aws_db_subnet_group" "rds" {
  name       = "rds-subnet-group"
  subnet_ids = aws_subnet.private.*.id

  tags = {
    Name = "RDSSubnetGroup"
  }
}

# Primary RDS Instance
resource "aws_db_instance" "primary" {
  identifier              = "mysql-primary"
  engine                  = "mysql"
  engine_version          = "8.0.40"
  instance_class          = "db.t3.micro"
  allocated_storage       = 20
  max_allocated_storage   = 100
  storage_type            = "gp2"
  username                = "admin"
  password                = "adminpassword" # Replace with a secure password
  db_subnet_group_name    = aws_db_subnet_group.rds.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  parameter_group_name    = aws_db_parameter_group.mysql.name
  multi_az                = true
  publicly_accessible     = false

  backup_retention_period = 7  # Retain backups for 7 days
  # Enable final snapshot on destroy
  final_snapshot_identifier = "mysql-primary-final-snapshot"  # Name of the snapshot
  skip_final_snapshot       = false  # Ensure this is set to false (default)

  tags = {
    Name = "MySQLPrimary"
  }
}

# # Read Replica 1
# resource "aws_db_instance" "replica_1" {
#   identifier                = "mysql-replica-1"
#   engine                    = "mysql"
#   engine_version            = aws_db_instance.primary.engine_version
#   instance_class            = aws_db_instance.primary.instance_class
#   storage_type              = aws_db_instance.primary.storage_type
#   replicate_source_db       = "mysql-primary"
#   vpc_security_group_ids    = [aws_security_group.rds.id]
#   publicly_accessible       = false
#   allocated_storage         = aws_db_instance.primary.allocated_storage
#   tags = {
#     Name = "MySQLReplica1"
#   }
# }

# # Read Replica 2
# resource "aws_db_instance" "replica_2" {
#   identifier                = "mysql-replica-2"
#   engine                    = "mysql"
#   engine_version            = aws_db_instance.primary.engine_version
#   instance_class            = aws_db_instance.primary.instance_class
#   storage_type              = aws_db_instance.primary.storage_type
#   replicate_source_db       = "mysql-primary"
#   vpc_security_group_ids    = [aws_security_group.rds.id]
#   publicly_accessible       = false
#   allocated_storage         = aws_db_instance.primary.allocated_storage
#   tags = {
#     Name = "MySQLReplica2"
#   }
# }

