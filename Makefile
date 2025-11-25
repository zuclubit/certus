# Makefile for Certus
# Common development tasks

.PHONY: help install dev build test lint format clean setup

# Default target
help:
	@echo "Certus - Available Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make setup     - Initial project setup"
	@echo "  make install   - Install dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make dev       - Start development server"
	@echo "  make build     - Production build"
	@echo "  make preview   - Preview production build"
	@echo ""
	@echo "Testing:"
	@echo "  make test      - Run unit tests"
	@echo "  make test-e2e  - Run E2E tests"
	@echo "  make test-all  - Run all tests"
	@echo "  make coverage  - Generate coverage report"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint      - Run ESLint"
	@echo "  make format    - Format code with Prettier"
	@echo "  make typecheck - Run TypeScript check"
	@echo "  make check     - Run all quality checks"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean     - Clean build artifacts"
	@echo "  make update    - Update dependencies"

# Setup
setup:
	@echo "Setting up Certus..."
	cd app && npm install
	cd app && npx husky install
	@echo "Setup complete!"

install:
	cd app && npm install

# Development
dev:
	cd app && npm run dev

build:
	cd app && npm run build

preview:
	cd app && npm run preview

# Testing
test:
	cd app && npm run test

test-e2e:
	cd app && npm run test:e2e

test-all: test test-e2e

coverage:
	cd app && npm run test -- --coverage

# Code Quality
lint:
	cd app && npm run lint

format:
	cd app && npm run format

typecheck:
	cd app && npx tsc --noEmit

check: lint typecheck test
	@echo "All checks passed!"

# Utilities
clean:
	rm -rf app/dist
	rm -rf app/coverage
	rm -rf app/playwright-report
	rm -rf app/node_modules/.vite
	@echo "Cleaned build artifacts"

update:
	cd app && npm update
	cd app && npm audit fix
