# Build as
# docker build -t motuz_app:latest -f docker/app/Dockerfile .

FROM python:3.7.3

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update -y

RUN apt-get install -y build-essential man-db vim curl unzip wget krb5-user libpam-krb5 sudo

RUN curl https://rclone.org/install.sh | bash


ENV PYTHONUNBUFFERED 1
ENV DOCKER_CONTAINER 1
ENV FLASK_ENV development
ENV MOTUZ_HOST 0.0.0.0
# libpython3.7m.so.1.0 cannot be found if /etc is remapped
ENV LD_LIBRARY_PATH /usr/local/lib


COPY ./requirements.txt /code/requirements.txt
RUN pip install -r /code/requirements.txt

RUN mkdir -p /root/.config/rclone/
RUN touch /root/.config/rclone/rclone.conf
RUN chmod 755 /root

COPY ./src/backend /app/src/backend
COPY ./docker/app/app.sh /app/src/backend/app.sh
COPY ./docker/wait-for-it.sh /app/src/backend/wait-for-it.sh
WORKDIR /app/src/backend

CMD /app/src/backend/app.sh
