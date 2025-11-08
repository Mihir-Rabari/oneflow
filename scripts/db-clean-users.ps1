# Clean only user data (keep schema)
# Useful for testing registration/auth flows

Write-Host "Cleaning user data..." -ForegroundColor Cyan

docker exec oneflow-postgres psql -U postgres oneflow -c 'TRUNCATE TABLE users CASCADE;'
docker exec oneflow-postgres psql -U postgres oneflow -c 'TRUNCATE TABLE otps CASCADE;'
docker exec oneflow-postgres psql -U postgres oneflow -c 'TRUNCATE TABLE audit_logs CASCADE;'

Write-Host "User data cleaned!" -ForegroundColor Green
$count = docker exec oneflow-postgres psql -U postgres oneflow -t -c 'SELECT COUNT(*) FROM users;'
Write-Host "Remaining users: $count" -ForegroundColor Cyan
