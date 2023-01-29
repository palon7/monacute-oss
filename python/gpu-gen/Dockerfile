FROM tensorflow/tensorflow:1.14.0-gpu-py3
RUN apt update && apt install -y libpq-dev libmagickwand-dev
RUN mkdir /app
COPY . /app

WORKDIR /app
RUN pip install -r requirements.txt
