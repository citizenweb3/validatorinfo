# 📊 Observability Stack Documentation

## Overview

This project implements a complete **OpenTelemetry-based observability stack** with the **Grafana LGTM Stack**:

- **L**ogs - **Loki** (log aggregation with label-based indexing)
- **T**races - **Tempo** (distributed tracing)
- **P**rofiles - **Pyroscope** (continuous profiling)
- **G**rafana - Frontend for visualization and correlation

All telemetry data (logs, traces, metrics) is collected through **Grafana Alloy**, a unified OpenTelemetry collector optimized for the Grafana ecosystem.

### Key Features

✅ **Zero-code auto-instrumentation** - HTTP, Database, Redis automatically traced  
✅ **Task-specific logging** - 115+ unique task labels for fine-grained filtering  
✅ **Worker thread support** - File-based log collection for isolated threads  
✅ **Conditional activation** - Enable/disable via `OTEL_ENABLED` environment variable  
✅ **Full correlation** - Logs ↔ Traces ↔ Metrics ↔ Profiles linked by trace_id  
✅ **Production-ready** - Graceful shutdown, error handling, configurable sampling

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                            │
│                                                                   │
│  Frontend (Next.js)              Indexer (Worker threads)        │
│    ├─ OpenTelemetry SDK           ├─ OpenTelemetry SDK          │
│    ├─ Winston Logger              ├─ Winston Logger             │
│    └─ Pyroscope SDK               └─ File Logs (JSON)           │
│                                                                   │
└────────────────────────┬─────────────────────┬──────────────────┘
                         │                     │
                    OTLP gRPC           File Logs (logs/*.log)
                    (port 4317)               │
                         │                     │
┌────────────────────────┴─────────────────────┴──────────────────┐
│                     Grafana Alloy                                │
│  (OpenTelemetry Collector + Log Shipper)                        │
│                                                                   │
│  • OTLP Receiver (gRPC:4317, HTTP:4318)                         │
│  • Docker Log Discovery (stdout/stderr)                         │
│  • File Log Reader (worker logs with task labels)              │
│  • Batch Processor (performance optimization)                   │
│  • JSON Parsing & Label Extraction                             │
│                                                                   │
└────────┬──────────────┬──────────────┬──────────────────────────┘
         │              │              │
    ┌────▼────┐    ┌───▼────┐    ┌───▼─────┐    ┌──────────┐
    │  Loki   │    │ Tempo  │    │Pyroscope│    │ Metrics  │
    │ (Logs)  │    │(Traces)│    │(Profiles)│    │ (Debug)  │
    │         │    │        │    │         │    │          │
    │ 3.0.0   │    │ 2.4.0  │    │  1.5.0  │    │ Console  │
    └────┬────┘    └───┬────┘    └───┬─────┘    └──────────┘
         │             │              │
         └─────────────┴──────────────┴───────────────┐
                                                       │
                                                  ┌────▼─────┐
                                                  │ Grafana  │
                                                  │  10.4.0  │
                                                  │          │
                                                  │ Dashboard│
                                                  └──────────┘
```

### Data Flow

1. **Application generates telemetry**:
   - OpenTelemetry SDK → traces, metrics, logs via OTLP
   - Winston Logger → structured JSON logs to files
   - Pyroscope SDK → continuous profiling data

2. **Alloy collects & processes**:
   - Receives OTLP data from main process
   - Reads JSON log files from worker threads
   - Parses Docker container logs
   - Extracts labels (service_name, label, level, trace_id)
   - Batches for performance

3. **Backends store & index**:
   - Loki: label-based log indexing (115+ task labels)
   - Tempo: distributed trace storage
   - Pyroscope: continuous profiling data

4. **Grafana visualizes & correlates**:
   - Unified dashboard with all signals
   - Click trace_id in logs → jump to trace
   - Filter by task label or log level

## 🚀 Quick Start

> **📘 Production Deployment**: For deploying to production with remote monitoring server, see [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)

### Prerequisites

```bash
# Required
- Docker & Docker Compose
- 8GB+ RAM available (for local observability stack)
- 10GB+ free disk space

# Ports that will be used
- 3000: Frontend application
- 3001: Indexer application
- 3002: Grafana UI
- 3100: Loki API
- 3200: Tempo API
- 4040: Pyroscope API
- 4317: Alloy OTLP gRPC
- 4318: Alloy OTLP HTTP
- 12345: Alloy UI
```

### Option 1: Local Development (Full Stack)

**Step 1: Configure environment**

Edit `.env` file:
```bash
# Enable OpenTelemetry
OTEL_ENABLED=true

# Use local observability stack (default)
# OTEL_EXPORTER_OTLP_ENDPOINT=http://alloy:4317  # Already set by default
```

**Step 2: Start observability stack**

```bash
docker-compose -f docker-compose-observability.yml up -d
```

This starts:
- Grafana (visualization)
- Loki (logs)
- Tempo (traces)
- Pyroscope (profiles)
- Alloy (collector)

**Step 3: Start application**

```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Step 4: Access Grafana**

Open http://localhost:3002 (anonymous access enabled)
- Navigate to dashboard: "ValidatorInfo - Observability Overview"
- Use filters: Task (task_label) and Log Level (log_level)

### Option 2: Without Observability (Lightweight)

**Step 1: Configure environment**

Edit `.env` file:
```bash
# Disable OpenTelemetry
OTEL_ENABLED=false
```

**Step 2: Start application only**

```bash
docker-compose -f docker-compose.dev.yml up -d
```

Application works normally without telemetry overhead.

### Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application |
| **Grafana** | http://localhost:3002 | Observability dashboard |
| **Alloy UI** | http://localhost:12345 | Collector status & config |
| **Loki API** | http://localhost:3100 | Log query endpoint |
| **Tempo API** | http://localhost:3200 | Trace query endpoint |
| **Pyroscope** | http://localhost:4040 | Profiling UI |

## 📦 Implementation Details

### Application Code Changes

#### 1. **`server/instrumentation.ts`** - OpenTelemetry SDK Initialization

**Purpose**: Bootstrap OpenTelemetry with conditional activation

**Key features**:
- ✅ Conditional initialization via `OTEL_ENABLED` environment variable
- ✅ No-op mode when disabled (zero overhead)
- ✅ NodeSDK with auto-instrumentations (@opentelemetry/auto-instrumentations-node)
- ✅ OTLP exporters for traces, metrics, logs (gRPC to Alloy)
- ✅ W3C Trace Context & Baggage propagation
- ✅ WinstonInstrumentation for automatic log enrichment
- ✅ Graceful shutdown on SIGTERM/SIGINT
- ✅ Pyroscope profiling integration

**Configuration**:
```typescript
// Service identification
OTEL_SERVICE_NAME: validatorinfo-frontend | validatorinfo-indexer
OTEL_EXPORTER_OTLP_ENDPOINT: http://alloy:4317
NODE_ENV: development | production
```

#### 2. **`src/logger.ts`** - Enhanced Winston Logger

**Purpose**: Structured logging with OpenTelemetry integration

**Key features**:
- ✅ Task-specific logger factory: `logger('task-name')`
- ✅ Automatic trace context injection (trace_id, span_id, trace_flags)
- ✅ Three transports:
  - **Console**: Colorized human-readable format
  - **DailyRotateFile**: JSON logs with 14-day retention
  - **OpenTelemetryTransportV3**: OTLP export to Alloy
- ✅ Custom label support for task identification

**Usage**:
```typescript
const { logInfo, logError } = logger('prices');
logInfo('Task started');  // Logs with label="prices"
```

**Output formats**:
- Console: `2025-12-08 13:45:23 INFO [PRICES] Task started`
- JSON file: `{"level":"info","label":"prices","message":"Task started","timestamp":"2025-12-08 13:45:23"}`

#### 3. **`src/logger-winston.ts`** - Separate Frontend Logger

**Purpose**: Dedicated logger for server.ts (frontend process)

**Difference from main logger**:
- Exports a singleton instance
- Includes HTTP stream for Morgan middleware
- Pre-configured for frontend service

#### 4. **`server/profiling.ts`** - Pyroscope Integration

**Purpose**: Continuous profiling with trace correlation

**Features**:
- CPU profiling
- Heap profiling
- Wall time profiling
- Automatic trace_id/span_id tagging

### Configuration Files

#### 1. **`alloy-config.river`** - Unified Collector Config

**Components**:

**OTLP Receivers**:
```river
otelcol.receiver.otlp "default" {
  grpc { endpoint = "0.0.0.0:4317" }  // Main process
  http { endpoint = "0.0.0.0:4318" }  // Alternative
}
```

**Docker Log Collection**:
```river
discovery.docker "containers" {
  host = "unix:///var/run/docker.sock"
}

loki.source.docker "containers" {
  targets = discovery.docker.containers.targets
}
```

**Worker Log Collection** (NEW):
```river
local.file_match "worker_logs" {
  path_targets = [{
    __path__ = "/app/logs/*.log",
    job = "worker-logs",
  }]
}

loki.source.file "worker_logs" {
  targets = local.file_match.worker_logs.targets
}

loki.process "worker_json" {
  stage.json {
    expressions = {
      level = "level",
      label = "label",      // Task name!
      message = "message",
      trace_id = "trace_id",
    }
  }
  
  stage.labels {
    values = {
      level = "",
      label = "",           // Creates queryable label
      trace_id = "",
    }
  }
}
```

**Why file-based logs for workers?**
- Worker threads are isolated Node.js processes
- OpenTelemetry SDK doesn't share state between workers
- File-based collection is more reliable
- Allows task-specific labeling (115+ unique labels)

#### 2. **`docker-compose-observability.yml`** - Observability Stack

**Services**:
- **alloy**: Collector with volume mounts for logs + Docker socket
- **loki**: Log aggregation (port 3100)
- **tempo**: Trace storage (port 3200)
- **pyroscope**: Profiling (port 4040)
- **grafana**: Visualization (port 3002)

**Key configuration**:
```yaml
alloy:
  volumes:
    - ./alloy-config.river:/etc/alloy/config.river
    - ./logs:/app/logs:ro                          # Worker logs
    - /var/run/docker.sock:/var/run/docker.sock:ro # Docker logs
```

#### 3. **`docker-compose.dev.yml`** - Application Stack

**Added configuration**:
```yaml
indexer:
  environment:
    OTEL_ENABLED: "true"
    OTEL_SERVICE_NAME: "validatorinfo-indexer"
    OTEL_EXPORTER_OTLP_ENDPOINT: "http://alloy:4317"
    PYROSCOPE_SERVER_URL: "http://pyroscope:4040"
  volumes:
    - ./logs:/app/logs  # Share logs with Alloy
  networks:
    - default
    - observability     # Connect to observability network
```

#### 4. **Backend Configurations**

**`loki-config.yml`**:
- Schema v13 (latest)
- TSDB storage with 14-day retention
- Query limits: 5000 lines, 30s timeout

**`tempo-config.yml`**:
- Local storage backend
- 14-day trace retention
- Trace-to-metrics generation

**`grafana/provisioning/dashboards/validatorinfo-overview.json`**:
- 11 panels (logs, traces, metrics, stats)
- 2 template variables (task_label, log_level)
- Pre-configured datasource UIDs

## 🔍 Key Features & Use Cases

### 1. Task-Specific Logging (115+ Labels)

**Problem solved**: Worker threads generate thousands of logs, hard to filter

**Solution**: Each task gets unique label
```typescript
// In task code
const { logInfo, logError } = logger('prices');
logInfo('Fetching prices');  // → label="prices"
```

**Query in Loki**:
```logql
{job="worker-logs", label="prices"}              # Only prices task
{job="worker-logs", label=~"aztec.*"}            # All Aztec tasks
{job="worker-logs", level="error"}               # All errors
{job="worker-logs", label="prices", level="error"}  # Prices errors
```

**Available in Grafana**: 
- Dashboard template variable `$task_label` (multi-select)
- 115+ unique task labels discovered automatically

### 2. Distributed Tracing

**Auto-instrumented**:
- ✅ HTTP requests (undici, http, https)
- ✅ Database queries (PostgreSQL via Prisma)
- ✅ Redis operations
- ✅ DNS lookups
- ✅ TCP connections

**Manual instrumentation example**:
```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('my-service');
const span = tracer.startSpan('expensive-operation');

try {
  // Your code here
  span.setStatus({ code: SpanStatusCode.OK });
} catch (error) {
  span.setStatus({ code: SpanStatusCode.ERROR });
  span.recordException(error);
} finally {
  span.end();
}
```

### 3. Log-Trace Correlation

**Automatic in main process**:
```json
{
  "level": "info",
  "message": "HTTP request received",
  "trace_id": "a1b2c3d4e5f6g7h8",
  "span_id": "1234567890abcdef"
}
```

**In Grafana**:
1. See log with trace_id
2. Click "Tempo" link next to trace_id
3. View full distributed trace

### 4. Performance Profiling

**Always running** (minimal overhead):
- CPU time (where time is spent)
- Heap allocations (memory leaks)
- Wall time (including I/O waits)

**View in Pyroscope**:
- Flamegraphs by service
- Compare time periods
- Filter by trace_id

### 5. Real-time Monitoring

**Dashboard panels**:
- **Task Logs**: Live log stream with filtering
- **Task Log Rate**: Which tasks log most frequently
- **Log Levels Distribution**: Info/Error/Warn breakdown
- **Active Tasks**: Currently running tasks count
- **Task Errors (5m)**: Error count with thresholds
- **Recent Traces**: Latest 30 distributed traces

**Stats panels** (5-minute window):
- Task Logs count
- Task Errors (color-coded: green < 10, yellow < 50, red ≥ 50)
- Active Tasks count
- Indexer System Logs
- Frontend Logs
- Total Spans

### 6. Conditional Activation

**No performance impact when disabled**:

```bash
# .env
OTEL_ENABLED=false  # Zero overhead, no telemetry code runs
OTEL_ENABLED=true   # Full observability active
```

**Implementation**:
```typescript
// server/instrumentation.ts
if (!isOtelEnabled()) {
  console.log('ℹ️  OpenTelemetry is DISABLED');
  // No SDK initialization, API returns no-ops
} else {
  // Full SDK with exporters
}
```

## 📊 Using Grafana Dashboard

### Pre-configured Dashboard

**URL**: http://localhost:3002/d/validatorinfo-otel

**Layout** (11 panels):

**Row 1 - Main Logs** (full width):
- Task Logs with template variable filters

**Row 2 - Service Logs** (split):
- Indexer System Logs (left)
- Frontend Logs (right)

**Row 3 - Analytics** (split):
- Task Log Rate by Label (timeseries)
- Log Levels Distribution (stacked bars)

**Row 4 - Traces** (full width):
- Recent Traces viewer

**Row 5 - Statistics** (6 stat panels):
- Task Logs (5m)
- Task Errors (5m) - color coded
- Active Tasks
- Indexer System Logs (5m)
- Frontend Logs (5m)
- Total Spans (5m)

### Template Variables

**Task Filter** (`$task_label`):
- Type: Multi-select dropdown
- Source: `label_values({job="worker-logs"}, label)`
- Default: All
- Use: Filter logs to specific task(s)

**Log Level Filter** (`$log_level`):
- Type: Multi-select dropdown  
- Source: `label_values({job="worker-logs"}, level)`
- Default: All
- Options: info, error, warn
- Use: Show only specific log levels

### Query Examples

#### Loki (Logs)

**All task logs**:
```logql
{job="worker-logs"}
```

**Specific task**:
```logql
{job="worker-logs", label="prices"}
```

**Multiple tasks**:
```logql
{job="worker-logs", label=~"prices|validators|coingecko-data"}
```

**Errors only**:
```logql
{job="worker-logs", level="error"}
```

**Task errors with message filter**:
```logql
{job="worker-logs", label="prices", level="error"} |= "failed"
```

**Frontend errors with trace**:
```logql
{service_name="validatorinfo-frontend"} 
  | json 
  | level="error"
  | trace_id != ""
```

**Log rate by task**:
```logql
sum by (label) (count_over_time({job="worker-logs"}[5m]))
```

#### Tempo (Traces)

**All traces**:
```traceql
{}
```

**Service filter**:
```traceql
{ resource.service.name = "validatorinfo-indexer" }
```

**Error traces**:
```traceql
{ status = error }
```

**Slow traces (>1s)**:
```traceql
{ duration > 1s }
```

**HTTP traces**:
```traceql
{ name =~ "GET|POST|PUT|DELETE" }
```

### Datasource Configuration

**Loki** (UID: `P8E80F9AEF21F6940`):
- URL: http://loki:3100
- Max lines: 5000
- Timeout: 30s

**Tempo** (UID: `P214B5B846CF3925F`):
- URL: http://tempo:3200
- TraceQL enabled
- Linked to Loki (trace_id correlation)

**Pyroscope** (UID: `P02E4190217B50628`):
- URL: http://pyroscope:4040
- Profile types: cpu, alloc, goroutine

## 🔧 Configuration Reference

### Environment Variables

**Core Settings** (`.env` or docker-compose):

```bash
# === OpenTelemetry Control ===
OTEL_ENABLED=true                                    # Master switch: true/false
OTEL_SERVICE_NAME=validatorinfo-frontend             # Service identifier
OTEL_EXPORTER_OTLP_ENDPOINT=http://alloy:4317       # Collector endpoint
OTEL_LOG_LEVEL=info                                  # SDK log level: info/debug

# === Profiling ===
PYROSCOPE_SERVER_URL=http://pyroscope:4040          # Profiling backend

# === Node.js Runtime ===
NODE_ENV=development                                 # Environment tag
LOG_LEVEL=info                                       # Winston log level
```

### Docker Compose Override

**Enable observability** (`docker-compose.dev.yml`):

```yaml
frontend:
  environment:
    OTEL_ENABLED: "true"
    OTEL_SERVICE_NAME: "validatorinfo-frontend"
    OTEL_EXPORTER_OTLP_ENDPOINT: "http://alloy:4317"
    PYROSCOPE_SERVER_URL: "http://pyroscope:4040"
  networks:
    - default
    - observability  # Required!

indexer:
  environment:
    OTEL_ENABLED: "true"
    OTEL_SERVICE_NAME: "validatorinfo-indexer"
    OTEL_EXPORTER_OTLP_ENDPOINT: "http://alloy:4317"
    PYROSCOPE_SERVER_URL: "http://pyroscope:4040"
  volumes:
    - ./logs:/app/logs  # Required for worker logs!
  networks:
    - default
    - observability  # Required!
```

**Disable observability**:

```yaml
# Option 1: Set OTEL_ENABLED=false
frontend:
  environment:
    OTEL_ENABLED: "false"  # SDK becomes no-op

# Option 2: Remove observability network (will cause connection errors)
# Not recommended - use OTEL_ENABLED instead
```

### Port Mapping

| Port | Service | Protocol | Purpose |
|------|---------|----------|---------|
| 3000 | Frontend | HTTP | Application UI |
| 3001 | Indexer | HTTP | Health checks |
| 3002 | Grafana | HTTP | Dashboard UI |
| 3100 | Loki | HTTP | Log query API |
| 3200 | Tempo | HTTP | Trace query API |
| 4040 | Pyroscope | HTTP | Profiling UI |
| 4317 | Alloy | gRPC | OTLP receiver |
| 4318 | Alloy | HTTP | OTLP receiver (alt) |
| 5432 | PostgreSQL | TCP | Main database |
| 5433 | PostgreSQL | TCP | Events database |
| 6371 | Redis | TCP | Cache |
| 12345 | Alloy | HTTP | Management UI |

### Volume Mounts

**Critical mounts**:

```yaml
# Alloy needs access to:
- ./alloy-config.river:/etc/alloy/config.river     # Config
- ./logs:/app/logs:ro                               # Worker logs (read-only)
- /var/run/docker.sock:/var/run/docker.sock:ro    # Docker logs (read-only)

# Indexer must share logs:
- ./logs:/app/logs                                  # Worker logs (read-write)
```

### Network Configuration

**Two networks required**:

```yaml
networks:
  default:
    name: validatorinfo_default
    
  observability:
    external: true
    name: validatorinfo_observability  # Created by observability stack
```

**Why two networks?**
- `default`: Application services (db, redis, frontend, indexer)
- `observability`: Telemetry services (alloy, loki, tempo, pyroscope, grafana)
- Application services join both to send data to Alloy

## 🎯 Best Practices

### Logging

**DO**:
```typescript
// Use task-specific loggers
const { logInfo, logError } = logger('task-name');
logInfo('Processing started', { count: 123 });
logError('Failed to process', error);
```

**DON'T**:
```typescript
// Don't use console.log (not collected)
console.log('Something happened');

// Don't use generic logger
const logger = logger();  // Missing task label!
```

### Error Handling

**DO**:
```typescript
try {
  await riskyOperation();
} catch (error) {
  logError('Operation failed', error);
  // Error automatically tagged in span
  throw error;
}
```

**DON'T**:
```typescript
try {
  await riskyOperation();
} catch (error) {
  // Silent failure - no visibility!
  return null;
}
```

### Resource Management

**Production deployment**:

1. **Adjust retention periods**:
```yaml
# loki-config.yml
limits_config:
  retention_period: 7d  # Reduce from 14d

# tempo-config.yml
storage:
  trace:
    block_retention: 7d  # Reduce from 14d
```

2. **Configure sampling**:
```typescript
// server/instrumentation.ts
sampler: new TraceIdRatioBasedSampler(0.1)  // 10% sampling
```

3. **Set resource limits**:
```yaml
# docker-compose-observability.yml
loki:
  deploy:
    resources:
      limits:
        memory: 512M
        cpus: '0.5'
```

### Performance Tuning

**High-load scenarios**:

```river
// alloy-config.river
otelcol.processor.batch "default" {
  timeout = "10s"           // Increase batch timeout
  send_batch_size = 5000    // Increase batch size
}
```

**Reduce log volume**:
```typescript
// src/logger.ts
level: process.env.LOG_LEVEL || 'warn'  // Only warn & error
```

### Security

**Production checklist**:

- [ ] Change Grafana default password
- [ ] Enable authentication on Grafana
- [ ] Restrict network access to observability services
- [ ] Use TLS for OTLP endpoints
- [ ] Rotate credentials
- [ ] Review log content for PII/secrets

## 🐛 Troubleshooting Guide

### No Data in Grafana

**Step 1: Verify OTEL_ENABLED**

```bash
docker-compose -f docker-compose.dev.yml exec frontend env | grep OTEL_ENABLED
# Should show: OTEL_ENABLED=true
```

**Step 2: Check OpenTelemetry initialization**

```bash
docker-compose -f docker-compose.dev.yml logs frontend | grep OpenTelemetry
# Should see: ✅ OpenTelemetry instrumentation started successfully
```

If you see "OpenTelemetry is DISABLED", set `OTEL_ENABLED=true` in `.env`

**Step 3: Verify Alloy is receiving data**

```bash
# Check Alloy UI
open http://localhost:12345

# Or check logs
docker-compose -f docker-compose-observability.yml logs alloy | grep -i error
```

**Step 4: Test connectivity**

```bash
# From frontend container to Alloy
docker-compose -f docker-compose.dev.yml exec frontend nc -zv alloy 4317
# Should show: Connection to alloy 4317 port [tcp/*] succeeded!
```

**Step 5: Check network configuration**

```bash
docker network inspect validatorinfo_observability
# Should list: alloy, loki, tempo, pyroscope, grafana, frontend, indexer
```

### No Task Logs in Dashboard

**Check log files are created**:

```bash
ls -lh logs/*.log
# Should see: 2025-12-08-app.log with growing size
```

**Check Alloy can read logs**:

```bash
docker-compose -f docker-compose-observability.yml exec alloy ls -la /app/logs/
# Should see log files
```

**Check Loki received task labels**:

```bash
curl -s 'http://localhost:3100/loki/api/v1/label/label/values' | jq -r '.data | length'
# Should show: 100+ (number of unique task labels)
```

**If still empty**:
- Check indexer is running: `docker ps | grep indexer`
- Restart Alloy: `docker-compose -f docker-compose-observability.yml restart alloy`
- Check volume mount: `docker-compose -f docker-compose-observability.yml config | grep -A5 alloy | grep logs`

### Dashboard Shows "No data"

**Verify datasources are healthy**:

```bash
curl -s -u admin:admin http://localhost:3002/api/datasources | jq '.[] | {name, type, url}'
```

**Test Loki manually**:

```bash
curl -s 'http://localhost:3100/loki/api/v1/query?query={job="worker-logs"}' | jq -r '.status'
# Should show: success
```

**Test Tempo manually**:

```bash
curl -s 'http://localhost:3200/api/search' | jq -r '.traces | length'
# Should show: number > 0
```

**Grafana time range**:
- Check dashboard time picker (top right)
- Default is "Last 15 minutes"
- Extend to "Last 1 hour" if needed

### High Memory Usage

**Check container stats**:

```bash
docker stats --no-stream | grep -E "NAME|loki|tempo|pyroscope"
```

**Loki consuming too much**:
```yaml
# loki-config.yml
limits_config:
  max_query_series: 500           # Reduce from 5000
  max_streams_per_user: 0         # No limit (or set reasonable value)
  retention_period: 7d            # Reduce from 14d
  
# Restart
docker-compose -f docker-compose-observability.yml restart loki
```

**Tempo consuming too much**:
```yaml
# tempo-config.yml
storage:
  trace:
    block_retention: 7d           # Reduce from 14d
    
# Restart
docker-compose -f docker-compose-observability.yml restart tempo
```

**Force cleanup**:
```bash
# Remove old data
docker-compose -f docker-compose-observability.yml down -v
docker-compose -f docker-compose-observability.yml up -d
```

### Application Performance Issues

**Check if OTEL overhead is high**:

```bash
# Compare with OTEL disabled
docker-compose -f docker-compose.dev.yml exec frontend top -b -n 1 | head -20
```

**Reduce overhead**:

1. **Disable debug logging**:
```bash
OTEL_LOG_LEVEL=error  # Instead of info/debug
```

2. **Increase batch sizes**:
```river
# alloy-config.river
otelcol.processor.batch "default" {
  timeout = "30s"              # From 5s
  send_batch_size = 10000      # From 1024
}
```

3. **Sample traces**:
```typescript
// server/instrumentation.ts
sampler: new TraceIdRatioBasedSampler(0.1)  // 10% sampling
```

### Connection Errors

**Error: "Failed to connect to alloy:4317"**

```bash
# Check observability network exists
docker network ls | grep observability

# If not, start observability stack first
docker-compose -f docker-compose-observability.yml up -d

# Then start app
docker-compose -f docker-compose.dev.yml up -d
```

**Error: "Worker logs not appearing"**

```bash
# Check volume mount in docker-compose.dev.yml
docker-compose -f docker-compose.dev.yml config | grep -A10 indexer | grep logs

# Should show:
# - ./logs:/app/logs

# If missing, add it and recreate
docker-compose -f docker-compose.dev.yml up -d --force-recreate indexer
```

### Grafana Issues

**Dashboard not loading**:

```bash
# Check Grafana logs
docker-compose -f docker-compose-observability.yml logs grafana | tail -50

# Common issues:
# - Datasource UID mismatch
# - Provisioning errors
# - Database locked

# Solution: Restart Grafana
docker-compose -f docker-compose-observability.yml restart grafana
```

**Template variables empty**:

- Wait 30-60 seconds for Loki to index labels
- Refresh dashboard
- Check data exists: `curl 'http://localhost:3100/loki/api/v1/labels'`

### Performance Benchmarks

**Expected resource usage** (idle state):

| Service | CPU | Memory | Disk I/O |
|---------|-----|--------|----------|
| Frontend | ~5% | ~200MB | Low |
| Indexer | ~15% | ~300MB | Medium |
| Alloy | ~2% | ~100MB | Low |
| Loki | ~3% | ~150MB | Medium |
| Tempo | ~2% | ~100MB | Low |
| Pyroscope | ~2% | ~80MB | Low |
| Grafana | ~1% | ~100MB | Low |

**Under load** (50 req/s, 10 tasks):

| Service | CPU | Memory |
|---------|-----|--------|
| Frontend | ~30% | ~400MB |
| Indexer | ~50% | ~600MB |
| Alloy | ~10% | ~200MB |
| Loki | ~15% | ~400MB |

## 📚 Additional Resources

### Official Documentation

**OpenTelemetry**:
- [OpenTelemetry JavaScript SDK](https://opentelemetry.io/docs/languages/js/) - Core instrumentation library
- [Auto-Instrumentation Guide](https://opentelemetry.io/docs/languages/js/automatic/) - Zero-code instrumentation setup
- [OTLP Exporters](https://opentelemetry.io/docs/specs/otlp/) - Protocol specification
- [Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/) - Standard attributes

**Grafana Stack**:
- [Grafana Loki Documentation](https://grafana.com/docs/loki/latest/) - Log aggregation system
  - [LogQL Query Language](https://grafana.com/docs/loki/latest/query/) - Loki's query syntax
  - [Label Best Practices](https://grafana.com/docs/loki/latest/best-practices/) - High-cardinality guidance
- [Grafana Tempo Documentation](https://grafana.com/docs/tempo/latest/) - Distributed tracing backend
  - [TraceQL](https://grafana.com/docs/tempo/latest/traceql/) - Tempo's query language
  - [Metrics Generator](https://grafana.com/docs/tempo/latest/metrics-generator/) - RED metrics from traces
- [Grafana Pyroscope Documentation](https://grafana.com/docs/pyroscope/latest/) - Continuous profiling
  - [Node.js Integration](https://grafana.com/docs/pyroscope/latest/configure-client/language-sdks/nodejs/) - Profiling setup
- [Grafana Alloy Documentation](https://grafana.com/docs/alloy/latest/) - Unified telemetry collector
  - [Components Reference](https://grafana.com/docs/alloy/latest/reference/components/) - All available components
  - [River Configuration Language](https://grafana.com/docs/alloy/latest/concepts/configuration-language/) - Syntax guide
- [LGTM Stack Introduction](https://grafana.com/blog/2024/03/13/an-opentelemetry-backend-in-a-box-introducing-grafana-lgtm-stack/) - Stack overview

**Winston Logger**:
- [Winston Documentation](https://github.com/winstonjs/winston) - Main logging library
- [Winston Daily Rotate File](https://github.com/winstonjs/winston-daily-rotate-file) - Log rotation transport
- [OpenTelemetry Winston Transport](https://www.npmjs.com/package/@opentelemetry/winston-transport) - OTEL integration

### Project-Specific Documentation

**Implementation Files** (read these for deep understanding):
- `server/instrumentation.ts` - OTEL SDK initialization with conditional activation
- `src/logger.ts` - Custom Winston logger with 115+ task labels
- `src/logger-winston.ts` - Frontend server logger (separate from indexer)
- `server/profiling.ts` - Pyroscope integration for continuous profiling
- `alloy-config.river` - Unified telemetry collection pipeline
- `docker-compose-observability.yml` - Full observability stack definition
- `grafana/provisioning/dashboards/validatorinfo-overview.json` - Dashboard JSON definition

**Configuration Files**:
- `loki-config.yml` - Loki server configuration (retention, limits, storage)
- `tempo-config.yml` - Tempo server configuration (trace storage, compaction)
- `mimir-config.yml` - Mimir server configuration (metrics storage)
- `collector-config.yml` - Legacy OTEL Collector config (replaced by Alloy)

### Community & Support

**Discussion Forums**:
- [OpenTelemetry Slack](https://cloud-native.slack.com/) - #opentelemetry, #otel-js channels
- [Grafana Community](https://community.grafana.com/) - Loki, Tempo, Pyroscope discussions
- [Stack Overflow](https://stackoverflow.com/questions/tagged/opentelemetry) - Tagged questions

**GitHub Repositories**:
- [opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js) - Core SDK and instrumentation
- [grafana/loki](https://github.com/grafana/loki) - Loki source code
- [grafana/tempo](https://github.com/grafana/tempo) - Tempo source code
- [grafana/pyroscope](https://github.com/grafana/pyroscope) - Pyroscope source code
- [grafana/alloy](https://github.com/grafana/alloy) - Alloy source code

### Learning Resources

**Video Tutorials**:
- [OpenTelemetry in Action](https://www.youtube.com/watch?v=r8UvWSX3KA8) - End-to-end demo
- [Grafana LGTM Stack](https://www.youtube.com/watch?v=OAm9fxqxz3k) - Stack overview
- [Distributed Tracing 101](https://www.youtube.com/watch?v=idDu_jXqf4E) - Tracing fundamentals

**Blog Posts & Articles**:
- [OpenTelemetry Best Practices](https://opentelemetry.io/docs/concepts/observability-primer/) - Observability primer
- [Loki vs Elasticsearch](https://grafana.com/blog/2020/10/28/loki-2.0-released/) - Why Loki for logs
- [Trace Context Propagation](https://www.w3.org/TR/trace-context/) - W3C standard

**Books**:
- *Distributed Tracing in Practice* by Austin Parker et al. (O'Reilly)
- *Observability Engineering* by Charity Majors et al. (O'Reilly)
- *Cloud Native Observability* by Jonah Kowall (O'Reilly)

### Example Queries

**Useful Loki Queries** (copy-paste into Grafana Explore):

```logql
# All task logs with error level
{job="worker-logs", level="error"}

# Logs for specific task in last 5 minutes
{job="worker-logs", label="update-chain-tvs"} |= `` | __range__ > 5m

# Rate of errors per minute by task
sum by (label) (rate({job="worker-logs", level="error"}[1m]))

# Top 10 most active tasks
topk(10, sum by (label) (count_over_time({job="worker-logs"}[5m])))

# Search for specific error message
{job="worker-logs"} |= "ECONNREFUSED"

# JSON parsing example
{job="worker-logs"} | json | message =~ ".*timeout.*"
```

**Useful Tempo Queries** (TraceQL):

```traceql
# All traces with errors
{ status = error }

# Traces for specific service
{ service.name = "validatorinfo-indexer" }

# Slow traces (>1 second)
{ duration > 1s }

# Traces with specific span name
{ name = "prisma:query" }

# Traces from last 30 minutes with status code
{ http.status_code >= 500 } | select(span.http.status_code, span.name)
```

**Useful Pyroscope Queries**:

```bash
# CPU profile for indexer
process_cpu:cpu:nanoseconds:cpu:nanoseconds{service_name="validatorinfo-indexer"}

# Memory profile
process_cpu:alloc_objects:count:space:bytes{service_name="validatorinfo-indexer"}

# Compare two time ranges (before/after optimization)
# Use comparison view in Grafana
```

### Migration & Upgrade Guides

**Upgrading OpenTelemetry SDK**:
```bash
npm update @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
# Check breaking changes: https://github.com/open-telemetry/opentelemetry-js/releases
```

**Upgrading Grafana Stack**:
```yaml
# docker-compose-observability.yml
# Update image versions one by one, test after each
loki: grafana/loki:3.0.0 → 3.1.0
tempo: grafana/tempo:2.4.0 → 2.5.0
```

**Migrating from OTEL Collector to Alloy**:
- Our project already uses Alloy (collector-config.yml is legacy)
- To migrate another project: https://grafana.com/docs/alloy/latest/tasks/migrate/from-otelcol/

### Monitoring the Monitoring Stack

**Alloy Metrics** (check http://localhost:12345):
- `alloy_component_controller_running_components` - Active components
- `loki_write_sent_bytes_total` - Data sent to Loki
- `otelcol_receiver_accepted_spans` - Traces received

**Loki Self-Monitoring**:
```bash
# Ingestion rate
curl -s 'http://localhost:3100/metrics' | grep loki_ingester_chunks_created_total

# Query performance
curl -s 'http://localhost:3100/metrics' | grep loki_logql_querystats_latency_seconds
```

**Tempo Self-Monitoring**:
```bash
# Trace ingestion rate
curl -s 'http://localhost:3201/metrics' | grep tempo_ingester_traces_created_total

# Query latency
curl -s 'http://localhost:3201/metrics' | grep tempo_query_frontend_queries_total
```

### Production Readiness Checklist

Before deploying to production:

- [ ] Set `OTEL_ENABLED=true` in production `.env`
- [ ] Configure retention policies in `loki-config.yml` and `tempo-config.yml`
- [ ] Set up volume backups for `./loki-data`, `./tempo-data`
- [ ] Enable authentication on Grafana (change default admin password)
- [ ] Set resource limits in docker-compose (memory, CPU)
- [ ] Configure log rotation in logger.ts (maxSize, maxFiles)
- [ ] Set up alerting rules in Grafana for critical errors
- [ ] Test failover scenarios (Loki down, Tempo down, network issues)
- [ ] Document on-call runbooks for common issues
- [ ] Set up remote storage for long-term retention (S3, GCS)
- [ ] Configure TLS for all OTLP endpoints
- [ ] Enable sampling for high-traffic environments
- [ ] Set up health checks and monitoring alerts
- [ ] Test OTEL_ENABLED=false fallback scenario
- [ ] Review and tune cardinality of custom labels

### Related Projects

**Similar Implementations**:
- [OpenTelemetry Demo](https://github.com/open-telemetry/opentelemetry-demo) - Multi-language microservices demo
- [Grafana LGTM Example](https://github.com/grafana/intro-to-mltp) - Complete stack setup
- [Node.js OTEL Starter](https://github.com/vercel/next.js/tree/canary/examples/with-opentelemetry) - Next.js integration

**Alternative Approaches**:
- **SaaS Options**: Grafana Cloud, Honeycomb, New Relic, Datadog (paid)
- **Self-Hosted**: Jaeger + Elasticsearch + Fluentd (CNCF stack)
- **Lightweight**: Pino logger + Elastic APM + Kibana

### Getting Help

If you encounter issues:

1. **Check this document** - Especially Troubleshooting section above
2. **Review logs** - `docker-compose logs <service>`
3. **Test connectivity** - Use `nc -zv` and `curl` commands from Troubleshooting
4. **Search GitHub issues** - Many problems already solved
5. **Ask in community forums** - OpenTelemetry Slack, Grafana Community
6. **Open an issue** - In this repository with reproduction steps

**When reporting issues, include**:
- OpenTelemetry SDK version: `npm list @opentelemetry/sdk-node`
- Docker Compose version: `docker-compose --version`
- Container status: `docker ps -a`
- Relevant logs: `docker-compose logs <service> > logs.txt`
- Environment: `docker-compose config | grep OTEL`

## 🤝 Support

For issues or questions about the observability setup:

1. **Start with Alloy UI**: http://localhost:12345
   - Check component status
   - View logs in real-time
   - Verify data flow

2. **Check container health**:
   ```bash
   docker-compose -f docker-compose-observability.yml ps
   docker-compose -f docker-compose.dev.yml ps
   ```

3. **Use Grafana Explore**:
   - Loki: http://localhost:3002/explore?datasource=loki
   - Tempo: http://localhost:3002/explore?datasource=tempo
   - Pyroscope: http://localhost:3002/explore?datasource=pyroscope

4. **Review this documentation**:
   - Architecture section for data flow
   - Troubleshooting section for common issues
   - Configuration Reference for all settings

5. **Enable debug logging** (if needed):
   ```bash
   # In .env
   OTEL_LOG_LEVEL=debug
   
   # Restart services
   docker-compose -f docker-compose.dev.yml restart
   ```

---

**Last Updated**: December 2024  
**Maintainer**: ValidatorInfo Team  
**Stack Version**: OpenTelemetry SDK 0.203.0, Grafana LGTM Stack (Loki 3.0, Tempo 2.4, Pyroscope 1.5, Grafana 10.4, Alloy latest)
