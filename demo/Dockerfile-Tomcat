FROM centos:7

COPY files/tomcat/etc/yum.repos.d/CentOS-Epel.repo /etc/yum.repos.d/CentOS-Epel.repo

# Install software
RUN yum install -y sudo net-tools openssh-server openssh-clients supervisor tomcat unzip

# Manage ssh key
RUN mkdir -p /root/.ssh

COPY files/shared/ssh/id_rsa.pub /root/.ssh/id_rsa.pub
COPY files/shared/ssh/id_rsa /root/.ssh/id_rsa
COPY files/shared/ssh/authorized_keys /root/.ssh/authorized_keys
COPY files/tomcat/etc/ssh/ssh_host_rsa_key /etc/ssh/ssh_host_rsa_key
COPY files/tomcat/etc/ssh/ssh_host_rsa_key.pub /etc/ssh/ssh_host_rsa_key.pub

RUN chmod 600 /root/.ssh/authorized_keys
RUN chmod 600 /root/.ssh/id_rsa
RUN chmod 600 /etc/ssh/ssh_host_rsa_key

RUN chown -R root:root /root/.ssh
RUN chown -R root:root /etc/ssh/

# Clean all
RUN yum clean all

CMD [ "supervisord", "-n" ]
