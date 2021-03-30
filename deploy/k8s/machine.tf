resource "aws_instance" "machine01" {
  ami                         = "ami-00dd995cb6f0a5219"
  instance_type               = "t2.medium"
  associate_public_ip_address = true
  key_name                    = var.key_name
  vpc_security_group_ids      = [aws_security_group.test_sg.id]

  root_block_device {
    volume_size = 64 #GiB
  }

  connection {
    type        = "ssh"
    host        = self.public_ip
    user        = "ec2-user"
    private_key = file(var.key_path)
  }

  provisioner "file" {
    source      = "./manifests"
    destination = "/home/ec2-user/manifests"
  }

  provisioner "remote-exec" {
    inline = [
      "sudo yum update -y",
      "sudo yum install -y docker conntrack",
      "sudo usermod -a -G docker ec2-user",
      "sudo chkconfig docker on",
      "sudo service docker start",
      "curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64",
      "sudo chmod u+x minikube-linux-amd64",
      "mv minikube-linux-amd64 minikube",
      "sudo chmod 777 /var/run/docker.sock",
    ]
  }
}
