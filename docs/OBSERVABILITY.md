# 📊 Observability Stack Documentation

## Overview

This project uses a complete observability stack based on **Grafana Alloy** and the **Grafana LGTM Stack**:

- **L**ogs - **Loki**
- **M**etrics - **Mimir** (Prometheus-compatible)
- **T**races - **Tempo**
- **P**rofiles - **Pyroscope** (Continuous Profiling)
- **G**rafana - Frontend for visualization

All telemetry data is collected through **Grafana Alloy**, a unified collector that replaces the OpenTelemetry Collector with better integration for the Grafana ecosystem.

## 🏗️ Architecture

```
Application (Node.js)
    ├─> OpenTelemetry SDK (Traces, Metrics, Logs)
    ├─> Pyroscope SDK (Profiles)
    └─> Winston Logger (enriched with trace context)
           ↓
    Grafana Alloy (OTLP receiver)
           ↓
    ┌──────┴──────┬─────────┬──────────┐
    ↓             ↓         ↓          ↓
  Loki        Mimir      Tempo    Pyroscope
 (Logs)     (Metrics)  (Traces)  (Profiles)
           ↓
       Grafana
    (Visualization + Correlation)
```

## 🚀 Quick Start

### Development Environment (Minimal)

For development with basic observability:

```bash
docker-compose -f docker-compose.dev.yml up
```

This starts:
- Application services
- Grafana Alloy (collector only, debug mode)

### Full Observability Stack

For complete observability with all backends:

```bash
# Start the full stack
docker-compose -f docker-compose-observability.yml up -d

# Start application services
docker-compose -f docker-compose.dev.yml up
```

Access points:
- **Grafana**: http://localhost:3000 (default login: admin/admin)
- **Alloy UI**: http://localhost:12345
- **Loki**: http://localhost:3100
- **Tempo**: http://localhost:3200
- **Mimir**: http://localhost:9009
- **Pyroscope**: http://localhost:4040

## 📦 What's Included

### Code Changes

1. **`server/instrumentation.ts`** - OpenTelemetry setup with:
   - Service resources (name, version, environment)
   - OTLP exporters for traces, metrics, logs
   - W3C Trace Context propagation
   - Graceful shutdown handlers

2. **`server/profiling.ts`** - Pyroscope integration with:
   - Continuous profiling configuration
   - Trace correlation (trace_id, span_id in profiles)
   - Helper functions for profiling specific code blocks

3. **`src/logger.ts`** - Enhanced Winston logger:
   - Automatic trace context injection (trace_id, span_id)
   - Correlation between logs and traces
   - JSON format for structured logging

### Configuration Files

1. **`alloy-config.river`** - Grafana Alloy configuration
   - OTLP receivers (gRPC/HTTP)
   - Batch processing
   - Exporters for all backends

2. **`docker-compose-observability.yml`** - Full stack
   - All observability services
   - Volume management
   - Health checks

3. **Backend configs**:
   - `loki-config.yml` - Log aggregation with 31-day retention
   - `tempo-config.yml` - Tracing with metrics generation
   - `mimir-config.yml` - Metrics storage with 30-day retention

4. **`grafana/provisioning/`** - Auto-configured datasources with correlations

## 🔍 Features

### 1. Distributed Tracing
- Automatic instrumentation of HTTP, database, Redis, etc.
- W3C Trace Context for cross-service correlation
- Service maps and dependency graphs

### 2. Metrics Collection
- Auto-generated RED metrics (Rate, Errors, Duration)
- Span metrics from traces
- Custom metrics support

### 3. Log Aggregation
- Structured JSON logs
- Automatic trace context (trace_id, span_id)
- Query by service, level, or trace

### 4. Continuous Profiling
- CPU profiling
- Memory profiling
- Goroutine profiling
- Correlation with traces

### 5. Correlation
All signals are correlated:
- **Logs → Traces**: Click trace_id in logs to see spans
- **Traces → Logs**: Click span to see related logs
- **Traces → Metrics**: Jump from span to metrics
- **Metrics → Traces**: Exemplars link to traces
- **Traces → Profiles**: See profiles for specific spans

## 📊 Using Grafana

### Pre-configured Datasources

1. **Loki** - Log queries with LogQL
2. **Tempo** - Trace search and analysis
3. **Mimir** - Prometheus-compatible metrics
4. **Pyroscope** - Flamegraphs and profile analysis

### Example Queries

#### Loki (Logs)
```logql
{service_name="validatorinfo-frontend"} 
  | json 
  | level="error"
```

#### Tempo (Traces)
```traceql
{ service.name = "validatorinfo-frontend" && status = error }
```

#### Mimir (Metrics)
```promql
rate(http_requests_total{service="validatorinfo-frontend"}[5m])
```

## 🔧 Environment Variables

Configure in `docker-compose.dev.yml` or `.env`:

```bash
# OpenTelemetry
OTEL_SERVICE_NAME=validatorinfo-frontend
OTEL_EXPORTER_OTLP_ENDPOINT=http://alloy:4317
OTEL_LOG_LEVEL=info  # or debug

# Pyroscope
PYROSCOPE_SERVER_URL=http://pyroscope:4040

# Node.js
NODE_ENV=development
NODE_OPTIONS=--require /app/server/instrumentation.ts
```

## 🎯 Best Practices

1. **Service Naming**: Use descriptive service names (validatorinfo-frontend, validatorinfo-indexer)
2. **Structured Logging**: Always log as JSON with context
3. **Error Handling**: Span statuses reflect actual errors
4. **Resource Attributes**: Include version, environment, instance ID
5. **Sampling**: Adjust sampling rates for production

## 🐛 Troubleshooting

### No data in Grafana?

1. Check Alloy is receiving data:
   - Open http://localhost:12345
   - Check metrics and status

2. Check container logs:
```bash
docker-compose -f docker-compose-observability.yml logs -f alloy
```

3. Verify OTLP endpoint in app:
```bash
docker-compose logs frontend | grep OpenTelemetry
```

### High memory usage?

Adjust retention in configs:
- Loki: `loki-config.yml` → `limits_config.retention_period`
- Tempo: `tempo-config.yml` → `compaction.block_retention`
- Mimir: `mimir-config.yml` → `limits.compactor_blocks_retention_period`

## 📚 Additional Resources

- [Grafana Alloy Documentation](https://grafana.com/docs/alloy/latest/)
- [OpenTelemetry Node.js](https://opentelemetry.io/docs/instrumentation/js/)
- [Pyroscope Documentation](https://grafana.com/docs/pyroscope/latest/)
- [LGTM Stack](https://grafana.com/blog/2024/03/13/an-opentelemetry-backend-in-a-box-introducing-grafana-lgtm-stack/)

## 🤝 Support

For issues or questions about the observability setup, check:
1. Container logs
2. Alloy UI (http://localhost:12345)
3. Grafana explore view for each datasource
