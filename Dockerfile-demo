FROM python:2.7
ENV PYTHONUNBUFFERED 1
ADD requirements /requirements

RUN pip install -r /requirements/local.txt --trusted-host pypi.douban.com

RUN mkdir /code
WORKDIR /code

COPY demo/files/shared/ssh/id_rsa.pub /root/.ssh/id_rsa.pub
COPY demo/files/shared/ssh/id_rsa /root/.ssh/id_rsa
COPY demo/files/shared/ssh/authorized_keys /root/.ssh/authorized_keys

RUN chmod 600 /root/.ssh/authorized_keys
RUN chmod 600 /root/.ssh/id_rsa

RUN chown -R root:root /root/.ssh
