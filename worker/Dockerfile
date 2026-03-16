FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY worker_app ./worker_app

CMD ["celery", "-A", "worker_app.tasks", "worker", "--loglevel=info"]
