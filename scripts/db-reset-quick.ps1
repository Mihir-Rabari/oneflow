# Quick Database Reset (no confirmation)
# For rapid development iterations

Write-Host "🔄 Quick Database Reset..." -ForegroundColor Cyan

docker exec oneflow-postgres psql -U postgres -c "DROP DATABASE IF EXISTS oneflow;" > $null 2>&1
docker exec oneflow-postgres psql -U postgres -c "CREATE DATABASE oneflow;" > $null 2>&1
docker exec oneflow-postgres psql -U postgres -c "DROP DATABASE IF EXISTS oneflow_shadow;" > $null 2>&1
docker exec oneflow-postgres psql -U postgres -c "CREATE DATABASE oneflow_shadow;" > $null 2>&1

cd server
npx prisma migrate deploy > $null 2>&1

Write-Host "✅ Database reset complete!" -ForegroundColor Green
