#!/bin/bash
# Local development setup script

set -e

echo "🚀 Setting up LUXE Rental for local development..."
echo ""

# Step 1: Check prerequisites
echo "✓ Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "Docker not found. Please install Docker."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose not found. Please install Docker Compose."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js not found. Please install Node.js 20+"; exit 1; }

# Step 2: Copy environment
if [ ! -f .env ]; then
  echo "✓ Creating .env file from .env.example..."
  cp .env.example .env
  echo "  Updated .env with local development defaults"
fi

# Step 3: Start containerized services
echo "✓ Starting PostgreSQL, Redis, and MinIO..."
docker-compose up -d postgres redis minio

# Wait for services
echo "  Waiting for PostgreSQL..."
docker-compose exec -T postgres pg_isready -U luxe > /dev/null 2>&1 || sleep 5
echo "  PostgreSQL ready!"

echo "  Waiting for Redis..."
docker-compose exec -T redis redis-cli ping > /dev/null 2>&1 || sleep 3
echo "  Redis ready!"

# Step 4: Setup API
echo ""
echo "✓ Setting up API..."
cd apps/api

if [ ! -d node_modules ]; then
  yarn install --frozen-lockfile
fi

echo "  Running database migrations..."
yarn prisma db push --skip-generate

echo "  Seeding database..."
yarn prisma db seed

echo "  API ready at http://localhost:3000"
cd ../..

# Step 5: Setup Admin
echo ""
echo "✓ Setting up Admin Dashboard..."
cd apps/admin

if [ ! -d node_modules ]; then
  yarn install --frozen-lockfile
fi

echo "  Admin ready at http://localhost:3001"
cd ../..

# Step 6: Summary
echo ""
echo "========================================="
echo "✅ Development environment is ready!"
echo "========================================="
echo ""
echo "To start development servers:"
echo ""
echo "Terminal 1 - API:"
echo "  cd apps/api && yarn dev"
echo ""
echo "Terminal 2 - Admin Dashboard:"
echo "  cd apps/admin && yarn dev"
echo ""
echo "Terminal 3 - Mobile:"
echo "  cd apps/mobile && flutter run"
echo ""
echo "Services:"
echo "  API: http://localhost:3000"
echo "  Admin: http://localhost:3001"
echo "  PostgreSQL: localhost:5432"
echo "  Redis: localhost:6379"
echo "  MinIO: http://localhost:9000 (admin/minioadmin)"
echo "  Swagger: http://localhost:3000/api/docs"
echo ""
echo "Test Credentials:"
echo "  Admin Email: admin@luxerental.com"
echo "  Admin Password: Admin@123"
echo "  User Email: user@luxerental.com"
echo "  User Password: User@123"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f api       # API logs"
echo "  docker-compose logs -f postgres  # Database logs"
echo "  yarn db:studio                   # Open Prisma Studio"
echo "  yarn db:seed                     # Re-seed database"
echo ""
