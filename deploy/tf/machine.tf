resource "aws_instance" "machine01" {
  ami                         = "ami-0d9a499b43edd7ae0" // "ami-2757f631"
  instance_type               = "t2.micro"
  associate_public_ip_address = true
  key_name                    = var.key_name
  vpc_security_group_ids      = [aws_security_group.PRACTICAS_DEVOPS.id]

  root_block_device {
    volume_size = 20 #20 Gb
  }

  tags = {
    Name        = "${var.author}.machine01"
    Author      = var.author
    Date        = "2020.03.25"
    Environment = "LAB"
    Location    = "Paris"
    Project     = "ACME_EXPLORER"
  }

  connection {
    type        = "ssh"
    host        = self.public_ip
    user        = "ec2-user"
    private_key = file(var.key_path)
  }

  provisioner "remote-exec" {
    inline = [
      "sudo yum update -y",
      "sudo yum install -y docker httpd-tools",
      "sudo usermod -a -G docker ec2-user",
      "sudo curl -L https://github.com/docker/compose/releases/download/1.28.6/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose",
      "sudo chmod +x /usr/local/bin/docker-compose",
      "sudo chkconfig docker on",
      "sudo service docker start"
    ]
  }

  provisioner "file" {
    source = "./secrets.sh"
    destination = "/home/ec2-user/secrets.sh"
  }

  provisioner "file" {
    source = "./start.sh"
    destination = "/home/ec2-user/start.sh"
  }

    provisioner "file" {
    source = "./docker-compose.yml"
    destination = "/home/ec2-user/docker-compose.yml"
  }

  provisioner "remote-exec" {
    script= "./start.sh"
  }


}