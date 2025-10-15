# ---- build stage ----------------------------------------------------------
FROM python:3.11-slim AS builder

WORKDIR /build
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir=/wheels -r requirements.txt

# ---- runtime stage --------------------------------------------------------
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    APP_ROOT=/app

WORKDIR $APP_ROOT

# копируем заранее собранные whl + сам код
COPY --from=builder /wheels /wheels
RUN pip install --no-cache /wheels/* && rm -rf /wheels

COPY bot_main.py .
COPY . .

# порт, на котором слушает ваше приложение (указано в config.py или ниже)
EXPOSE 8080

# предполагаем, что api_main.py содержит `uvicorn.run(app, host="0.0.0.0", port=8000)`
CMD ["python", "-m", "bot_main"]