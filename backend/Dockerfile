FROM python:3.11-slim

WORKDIR /workspace

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/workspace

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /tmp/backend-requirements.txt
COPY ml/requirements.txt /tmp/ml-requirements.txt
RUN pip install --no-cache-dir -r /tmp/backend-requirements.txt -r /tmp/ml-requirements.txt

COPY backend /workspace/backend
COPY ml /workspace/ml

# Production ML artifacts — generate before build: python ml/scripts/serialize_model.py
COPY models /workspace/models
RUN test -f /workspace/models/model.pkl \
    && test -f /workspace/models/preprocessor.pkl \
    && test -f /workspace/models/model_manifest.json \
    || (echo "ERROR: Missing models/. Run: python ml/scripts/serialize_model.py" && exit 1)

COPY backend/docker-entrypoint.sh /usr/local/bin/medscope-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/medscope-entrypoint.sh \
    && chmod +x /usr/local/bin/medscope-entrypoint.sh

WORKDIR /workspace/backend

EXPOSE 8000

ENTRYPOINT ["/bin/sh", "/usr/local/bin/medscope-entrypoint.sh"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
