# Makefile

# Используем .PHONY, чтобы команды выполнялись всегда, даже если есть файлы с такими именами
.PHONY: all clean up down

# Основная команда — очистка Docker'а
all: clean

# Полная очистка Docker (контейнеры, образы, volume'ы, кэш и сети)
clean:
	@echo "🧹 Полная очистка Docker..."
	@docker compose down -v --remove-orphans || true
	@docker system prune -a --volumes -f
	@docker rm -f $$(docker ps -aq) 2>/dev/null || true
	@docker rmi -f $$(docker images -q) 2>/dev/null || true
	@echo "✅ Docker очищен полностью."

# Запуск контейнеров
up:
	@echo "🚀 Запуск Docker Compose..."
	@docker compose up -d
	@echo "✅ Контейнеры запущены."

# Остановка контейнеров
down:
	@echo "🛑 Остановка Docker Compose..."
	@docker compose down
	@echo "✅ Контейнеры остановлены."

