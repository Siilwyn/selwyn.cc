---
title: Setting up a secure Linux server
description: How to setup a secure Linux server from 0 to 1.
date: "2017-07-25"
---

Spinning up a fresh new server gives a shiny clean slate to work from. I like to have my own controlled server but a new Linux box is often pretty open to the rest of the world. Securing it is a daunting task the first time. Following is a guide aimed to help with the security essentials. From connecting to the server to setting configuration rules. For this guide I will be using Ubuntu but for most Linux distributions the same applies. Note that almost all server commands need superuser access. To prevent typing `sudo` over and over again, use `sudo -s` in the server beforehand to run a shell with root privileges.

## Get in there
Connecting to the server with a SSH key pair is more secure than using a password because it [requires more information](https://security.stackexchange.com/a/3898). Enforcing SSH is a good first step to prevent attackers from getting in. A SSH key pair consists of a private key that you keep at the machine you connect from and a public one to put on the server. Run `ssh-keygen` and go through the prompted dialog to generate a pair. For the file name I like to use the computer name to make it obvious which device the key belongs to. It is also good to encrypt the private key with a password. This way in case somebody gets access to the computer the key is not readable.

To put the key on the server, first connect to the server using root and a password with `ssh root@serverIp`. Then create a new user and add that user to the sudo group:

```
adduser newUsername
adduser newUsername sudo
```

To connect with that new user. Disconnect with `Ctrl + D` then upload the generated public key:
```
ssh-copy-id -i /home/localUser/.ssh/publicKeyName newUser@serverIp
```

Now that is set up the server is accessible with the `ssh` command, like so: `ssh newUsername@serverIp`. And we are in!

## Locking down
First run the commands `apt update && apt upgrade` to update installed packages with the package manager. This will also tell if the package manager is working and the server has access to the internet. The second step is to change the port and restrict access by editing the SSH configuration file. Edit it with a text editor like `vim` or `nano`. Once open, change the default port to a random number between 0 - 65535, disable root login and disable password authentication:
```
vim /etc/ssh/sshd_config

Port chosenPort
PermitRootLogin no
PasswordAuthentication no
```

Then I like to `reboot` the server to apply the changes and check if I can still get in after a restart.

To connect again use the `ssh` command like before adding the chosen ‘random port’ number for SSH:
`ssh newUser@serverIp -p chosenPort`

Next are a few commands to get the firewall up and opening the chosen SSH port so you can still access the server.
```
apt install ufw
ufw default deny
ufw allow chosenPort/tcp
ufw enable
ufw status
```

`fail2ban` is a background process that keeps an eye on your server logs. Blocking suspicious activity like many failed SSH attempts.
```
apt install fail2ban
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
vim /etc/fail2ban/jail.local
```

By default `fail2ban` comes well configured. Again one thing to change here is the SSH port.
```
[sshd]
port = chosenPort
```

Restart fail2ban to apply the changes:
```
service fail2ban restart
```

Next is making sure the system stays up-to-date with  the latest security updates:
```
apt install unattended-upgrades
dpkg-reconfigure unattended-upgrades
```

Depending on the server use-case it can be nice to also set automatic rebooting on when needed. The file `/etc/apt/apt.conf.d/50unattended-upgrades` contains the unattended upgrades configuration. To enable rebooting look for the `Automatic-Reboot` line, remove the comment and change the value like so:
```
Unattended-Upgrade::Automatic-Reboot "true";
```

Finally check the system security with an auditing tool to make sure nothing wonky is going on:
```
apt install lynis
lynis audit system
```

## World wide web
If you are running a server and want to serve a website the firewall also needs to let through HTTP(S) traffic:

```
ufw allow 80/tcp
ufw allow 443/tcp
```

To try out if that is working you can use `docker` to spin up a temporary web server.
```
docker run --rm -p 80:80 nginx
```

Visiting the IP address of the server in the browser should return a default Nginx page.

## Up and running
Now those were quite a few commands but it wasn’t that hard either right? Now your digital box is running smooth and secure. With this configuration no [random surfing dog](https://en.wikipedia.org/wiki/On_the_Internet,_nobody_knows_you're_a_dog) can get into your server.
