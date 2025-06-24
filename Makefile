.PHONY: up down test test-unit logs

up:
	docker compose up -d

down:
	docker compose down

test:
	docker compose run --rm test

test-unit:
	docker compose run --rm test uv run pytest -k "not playwright"

logs:
	docker compose logs --follow
