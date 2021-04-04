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
      "sudo service docker start",
    ]
  }

  provisioner "file" {
    source = ".env"
    destination = "/home/ec2-user/.env"
  }

  provisioner "file" {
    source = "env2.sh"
    destination = "/home/ec2-user/env2.sh"
  }

  provisioner "file" {
    source = "exportVenvs.sh"
    destination = "/home/ec2-user/vEnvs.sh"
  }
    provisioner "file" {
    source = "docker-compose.yml"
    destination = "/home/ec2-user/docker-compose.yml"
  }

  provisioner "remote-exec" {
    inline = [
      "sudo docker network create service-tier",
      "sudo docker run -d -p 80:80 --name nginx-proxy -v /var/run/docker.sock:/tmp/docker.sock:ro jwilder/nginx-proxy",
      "sudo docker network connect service-tier nginx-proxy",
      "npm install",
      "chmod +x /home/ec2-user/vEnvs.sh",
      "source /home/ec2-user/vEnvs.sh",
      "echo $FIREBASE_PRIVATE_KEY",
      "echo $PAYPAL_MODE",
      "export PORT=8001",
      "export DBPORT=27017",
      "export VIRTUAL_HOST=do2021-grupal.com",
      "export NODE_ENV=development",
      "docker-compose -p ${var.hostname} --env-file=/home/ec2-user/.env up -d",
      "docker run -d --name portainer -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock portainer/portainer"
    ]
  }
}