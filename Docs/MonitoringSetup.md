# 📊 OneFlow Monitoring Setup

**Last Updated**: November 8, 2025

## 🚀 Overview

Complete monitoring stack with Prometheus and Grafana for OneFlow backend, PostgreSQL, and Redis.

---

## 🐳 Services Running

| Service | Container Name | Port | Purpose |
|---------|---------------|------|---------|
| **PostgreSQL** | oneflow-postgres | 5432 | Main database |
| **Redis** | oneflow-redis | 6379 | Cache & sessions |
| **Postgres Exporter** | oneflow-postgres-exporter | 9187 | PostgreSQL metrics |
| **Redis Exporter** | oneflow-redis-exporter | 9121 | Redis metrics |
| **Prometheus** | oneflow-prometheus | 9090 | Metrics collection |
| **Grafana** | oneflow-grafana | 3000 | Metrics visualization |

---

## 🎯 Quick Access

### **Prometheus Dashboard**
```
URL: http://localhost:9090
```
- View all metrics
- Run PromQL queries
- Check targets status
- View alerts

### **Grafana Dashboard**
```
URL: http://localhost:3000
Username: admin
Password: admin
```
- Beautiful visualizations
- Pre-built dashboards
- Custom queries
- Alerting

---

## 📈 Available Metrics

### **OneFlow API Metrics** (Port 4000)
- **HTTP requests**: `http_requests_total`, `http_request_duration_seconds`
- **Response times**: `http_response_time_seconds`
- **Error rates**: `http_errors_total`
- **Active connections**: `http_active_connections`

### **PostgreSQL Metrics** (Port 9187)
- **Connections**: `pg_stat_database_numbackends`
- **Transaction rate**: `pg_stat_database_xact_commit`, `pg_stat_database_xact_rollback`
- **Query performance**: `pg_stat_statements_mean_exec_time`
- **Database size**: `pg_database_size_bytes`
- **Table sizes**: `pg_table_size_bytes`
- **Index usage**: `pg_stat_user_indexes_idx_scan`
- **Cache hit ratio**: `pg_stat_database_blks_hit` / `pg_stat_database_blks_read`
- **Locks**: `pg_locks_count`
- **Replication lag**: `pg_replication_lag`

### **Redis Metrics** (Port 9121)
- **Memory usage**: `redis_memory_used_bytes`, `redis_memory_max_bytes`
- **Connected clients**: `redis_connected_clients`
- **Commands processed**: `redis_commands_processed_total`
- **Keyspace**: `redis_db_keys`, `redis_db_expires`
- **Hit rate**: `redis_keyspace_hits_total` / `redis_keyspace_misses_total`
- **Network I/O**: `redis_net_input_bytes_total`, `redis_net_output_bytes_total`
- **Evicted keys**: `redis_evicted_keys_total`
- **Expired keys**: `redis_expired_keys_total`
- **CPU usage**: `redis_cpu_sys_seconds_total`, `redis_cpu_user_seconds_total`

---

## 🔍 Prometheus Queries

### **Check if targets are up**
```promql
up
```

### **API Request Rate (requests/second)**
```promql
rate(http_requests_total[5m])
```

### **API Average Response Time**
```promql
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

### **PostgreSQL Active Connections**
```promql
pg_stat_database_numbackends{datname="oneflow"}
```

### **PostgreSQL Cache Hit Ratio**
```promql
(pg_stat_database_blks_hit / (pg_stat_database_blks_hit + pg_stat_database_blks_read)) * 100
```

### **PostgreSQL Transaction Rate**
```promql
rate(pg_stat_database_xact_commit{datname="oneflow"}[5m])
```

### **Redis Memory Usage (%)**
```promql
(redis_memory_used_bytes / redis_memory_max_bytes) * 100
```

### **Redis Connected Clients**
```promql
redis_connected_clients
```

### **Redis Hit Rate (%)**
```promql
(rate(redis_keyspace_hits_total[5m]) / (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m]))) * 100
```

### **Redis Commands Per Second**
```promql
rate(redis_commands_processed_total[5m])
```

### **Redis Keys Count**
```promql
redis_db_keys
```

---

## 📊 Grafana Dashboards

### **Import Pre-built Dashboards**

1. **PostgreSQL Dashboard**
   - Go to Grafana → Dashboards → Import
   - Dashboard ID: `9628` (PostgreSQL Database)
   - Select Prometheus as data source
   - Click Import

2. **Redis Dashboard**
   - Go to Grafana → Dashboards → Import
   - Dashboard ID: `11835` (Redis Dashboard for Prometheus)
   - Select Prometheus as data source
   - Click Import

3. **Node.js Dashboard** (for OneFlow API)
   - Go to Grafana → Dashboards → Import
   - Dashboard ID: `11159` (Node.js Application Dashboard)
   - Select Prometheus as data source
   - Click Import

### **Create Custom Dashboard**

1. Click **"+"** → **"Dashboard"**
2. Click **"Add visualization"**
3. Select **Prometheus** as data source
4. Enter your query (e.g., `rate(http_requests_total[5m])`)
5. Customize visualization type (Graph, Gauge, Table, etc.)
6. Click **"Apply"**

---

## 🎨 Recommended Panels for Custom Dashboard

### **API Performance Panel**
```promql
# HTTP Request Rate
rate(http_requests_total[5m])

# Average Response Time
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Error Rate
rate(http_errors_total[5m])
```

### **Database Health Panel**
```promql
# Active Connections
pg_stat_database_numbackends{datname="oneflow"}

# Cache Hit Ratio
(pg_stat_database_blks_hit / (pg_stat_database_blks_hit + pg_stat_database_blks_read)) * 100

# Database Size
pg_database_size_bytes{datname="oneflow"}
```

### **Cache Performance Panel**
```promql
# Redis Memory Usage
redis_memory_used_bytes

# Redis Hit Rate
(rate(redis_keyspace_hits_total[5m]) / (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m]))) * 100

# Connected Clients
redis_connected_clients
```

---

## 🔧 Configuration Files

### **Prometheus Config** (`monitoring/prometheus.yml`)
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'oneflow-monitor'

scrape_configs:
  # OneFlow API metrics
  - job_name: 'oneflow-api'
    static_configs:
      - targets: ['host.docker.internal:4000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  # PostgreSQL metrics
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres_exporter:9187']
    scrape_interval: 15s

  # Redis metrics
  - job_name: 'redis'
    static_configs:
      - targets: ['redis_exporter:9121']
    scrape_interval: 15s
```

---

## 🚨 Alerts Configuration (Optional)

Create `monitoring/alerts.yml`:

```yaml
groups:
  - name: oneflow_alerts
    interval: 30s
    rules:
      # API is down
      - alert: APIDown
        expr: up{job="oneflow-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "OneFlow API is down"
          description: "API has been down for more than 1 minute"

      # High error rate
      - alert: HighErrorRate
        expr: rate(http_errors_total[5m]) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/sec"

      # PostgreSQL down
      - alert: PostgresDown
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is down"

      # High database connections
      - alert: HighDBConnections
        expr: pg_stat_database_numbackends > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
          description: "{{ $value }} active connections"

      # Low cache hit ratio
      - alert: LowCacheHitRatio
        expr: (pg_stat_database_blks_hit / (pg_stat_database_blks_hit + pg_stat_database_blks_read)) * 100 < 90
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Low PostgreSQL cache hit ratio"
          description: "Cache hit ratio is {{ $value }}%"

      # Redis down
      - alert: RedisDown
        expr: up{job="redis"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis is down"

      # High Redis memory usage
      - alert: HighRedisMemory
        expr: (redis_memory_used_bytes / redis_memory_max_bytes) * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High Redis memory usage"
          description: "Redis memory usage is {{ $value }}%"
```

---

## 🧪 Testing Metrics

### **1. Check Prometheus Targets**
```
URL: http://localhost:9090/targets

Expected status: All targets should be "UP"
- oneflow-api (host.docker.internal:4000)
- postgres (postgres_exporter:9187)
- redis (redis_exporter:9121)
```

### **2. Query Sample Metrics**

**PostgreSQL:**
```bash
curl http://localhost:9187/metrics | grep pg_stat_database
```

**Redis:**
```bash
curl http://localhost:9121/metrics | grep redis_connected_clients
```

### **3. View in Grafana**
1. Login to Grafana (http://localhost:3000)
2. Go to "Explore"
3. Select Prometheus
4. Run query: `up`
5. All jobs should show value = 1

---

## 📊 Key Metrics to Monitor

### **Performance Metrics**
- ✅ API response time < 100ms
- ✅ Database cache hit ratio > 95%
- ✅ Redis hit rate > 80%
- ✅ Error rate < 1%

### **Resource Metrics**
- ✅ Database connections < 100
- ✅ Redis memory usage < 80%
- ✅ CPU usage < 70%
- ✅ Disk usage < 80%

### **Business Metrics**
- ✅ Active users
- ✅ Requests per minute
- ✅ Projects created
- ✅ Tasks completed

---

## 🔄 Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart prometheus
docker-compose restart postgres_exporter
docker-compose restart redis_exporter

# View logs
docker-compose logs -f prometheus
docker-compose logs -f postgres_exporter
docker-compose logs -f redis_exporter
```

---

## 🎯 Next Steps

1. **Start your API server**: `npm run dev`
2. **Access Prometheus**: http://localhost:9090
3. **Access Grafana**: http://localhost:3000
4. **Import dashboards**: PostgreSQL (9628), Redis (11835)
5. **Create custom dashboards** for your specific metrics
6. **Set up alerts** for critical metrics
7. **Monitor performance** in real-time

---

## 📚 Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PostgreSQL Exporter](https://github.com/prometheus-community/postgres_exporter)
- [Redis Exporter](https://github.com/oliver006/redis_exporter)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)

---

**Happy Monitoring! 📊🚀**
