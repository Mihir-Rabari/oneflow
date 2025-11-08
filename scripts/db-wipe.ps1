# Database Wipe and Reset Script for Windows
# This script completely wipes the database and recreates it from scratch

Write-Host "🗑️  Database Wipe Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Confirm action
$confirmation = Read-Host "⚠️  This will DELETE ALL DATA in the database. Continue? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "❌ Operation cancelled." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 1: Dropping existing database..." -ForegroundColor Yellow
docker exec oneflow-postgres psql -U postgres -c "DROP DATABASE IF EXISTS oneflow;"

Write-Host "Step 2: Creating fresh database..." -ForegroundColor Yellow
docker exec oneflow-postgres psql -U postgres -c "CREATE DATABASE oneflow;"

Write-Host "Step 3: Creating shadow database..." -ForegroundColor Yellow
docker exec oneflow-postgres psql -U postgres -c "DROP DATABASE IF EXISTS oneflow_shadow;"
docker exec oneflow-postgres psql -U postgres -c "CREATE DATABASE oneflow_shadow;"

Write-Host "Step 4: Running migrations..." -ForegroundColor Yellow
cd server
npx prisma migrate deploy

Write-Host ""
Write-Host "✅ Database wiped and reset successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  - Run 'npm run db:seed' to add sample data (if seed script exists)" -ForegroundColor Gray
Write-Host "  - Restart your server: 'npm run dev'" -ForegroundColor Gray
