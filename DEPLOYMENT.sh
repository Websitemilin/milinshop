#!/bin/bash
set -e

# ============================================
# MILIN SHOP - Automated Deployment Script
# ============================================
# Usage: ./DEPLOYMENT.sh [environment: dev|staging|prod]
# Example: ./DEPLOYMENT.sh prod

ENVIRONMENT=${1:-staging}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${SCRIPT_DIR}/backups"
LOGS_DIR="${SCRIPT_DIR}/logs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
  echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "${LOGS_DIR}/deployment_${TIMESTAMP}.log"
}

success() {
  echo -e "${GREEN}✓ $1${NC}"
  echo "✓ $1" >> "${LOGS_DIR}/deployment_${TIMESTAMP}.log"
}

error() {
  echo -e "${RED}✗ $1${NC}"
  echo "✗ $1" >> "${LOGS_DIR}/deployment_${TIMESTAMP}.log"
  exit 1
}

warn() {
  echo -e "${YELLOW}⚠ $1${NC}"
  echo "⚠ $1" >> "${LOGS_DIR}/deployment_${TIMESTAMP}.log"
}

# Initialize directories
mkdir -p "${BACKUP_DIR}" "${LOGS_DIR}"

log "Starting Milin Shop deployment to ${ENVIRONMENT}..."
log "Timestamp: ${TIMESTAMP}"

# PRE-DEPLOYMENT CHECKS
log "Running pre-deployment checks..."

if [[ ! -f ".env.${ENVIRONMENT}" ]] && [[ "${ENVIRONMENT}" != "dev" ]]; then
  error "Environment file .env.${ENVIRONMENT} not found!"
fi

if ! command -v node &> /dev/null; then
  error "Node.js is not installed"
fi
success "Node.js $(node -v) detected"

# BUILD PROCESS
log "Building application..."

npm ci --legacy-peer-deps || error "npm install failed"
success "Dependencies installed"

cd apps/api
npm run build || error "API build failed"
success "API built successfully"

cd ../admin
npm run build || error "Admin build failed"
success "Admin built successfully"

cd "${SCRIPT_DIR}"

# DATABASE MIGRATION
if [[ "${ENVIRONMENT}" != "dev" ]]; then
  log "Running database migrations..."
  
  if command -v pg_dump &> /dev/null; then
    DB_NAME=$(grep DATABASE_URL ".env.${ENVIRONMENT}" | cut -d'/' -f4)
    pg_dump "${DB_NAME}" > "${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql" 2>/dev/null || warn "Database backup failed"
    success "Database backed up"
  fi
  
  cd apps/api
  npx prisma migrate deploy --skip-generate || error "Migration failed"
  success "Database migrations completed"
  cd "${SCRIPT_DIR}"
fi

# DOCKER BUILD
if command -v docker &> /dev/null; then
  log "Building Docker images..."
  
  docker build -f Dockerfile.api -t milinshop-api:${TIMESTAMP} -t milinshop-api:latest . || error "API Docker build failed"
  success "API image built"
  
  docker build -f Dockerfile.admin -t milinshop-admin:${TIMESTAMP} -t milinshop-admin:latest . || error "Admin Docker build failed"
  success "Admin image built"
fi

# DEPLOYMENT
if [[ -f "docker-compose.yml" ]]; then
  log "Deploying with Docker Compose..."
  
  docker compose down || warn "No existing containers"
  docker compose -f docker-compose.yml -f docker-compose.${ENVIRONMENT}.yml up -d || error "Deployment failed"
  
  success "Services deployed"
  
  sleep 5
  if curl -f http://localhost:4000/health >/dev/null 2>&1; then
    success "Health check passed"
  else
    error "Health check failed"
  fi
fi

# POST-DEPLOYMENT
log "Running post-deployment checks..."

if curl -s http://localhost:4000/health | grep -q "ok"; then
  success "API is healthy"
else
  error "API health check failed"
fi

log "Deployment completed successfully!"

echo -e "\n${GREEN}========== DEPLOYMENT SUMMARY ==========${NC}"
echo "Environment: ${ENVIRONMENT}"
echo "Timestamp: ${TIMESTAMP}"
echo "API: http://localhost:4000"
echo "Admin: http://localhost:3000"
echo -e "${GREEN}========================================${NC}\n"

success "Deployment finished"
exit 0
echo "$ docker tag luxe-api:1.0 your-registry/luxe-api:1.0"
echo "$ docker push your-registry/luxe-api:1.0"
echo ""

echo "Step 6: Deploy to Kubernetes"
echo "$ kubectl create namespace luxe-production"
echo "$ kubectl apply -f k8s/secrets.yaml -n luxe-production"
echo "$ kubectl apply -f k8s/api-deployment.yaml -n luxe-production"
echo "$ kubectl apply -f k8s/admin-deployment.yaml -n luxe-production"
echo ""

echo "Step 7: Setup SSL/TLS"
echo "$ kubectl apply -f cert-manager/"
echo "$ kubectl apply -f ingress.yaml"
echo ""

echo "Step 8: Verify deployment"
echo "$ kubectl get pods -n luxe-production"
echo "$ kubectl logs -n luxe-production deployment/api"
echo ""

echo "Step 9: Setup monitoring"
echo "$ helm install prometheus prometheus-community/kube-prometheus-stack"
echo "$ helm install grafana grafana/grafana"
echo ""

echo "🎉 Deployment complete!"
echo ""
echo "Access your services:"
echo "  - API: https://api.yourdomain.com"
echo "  - Admin: https://admin.yourdomain.com"
echo ""
echo "Health checks:"
echo "  - API: curl https://api.yourdomain.com/health"
echo ""
