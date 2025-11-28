import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION, SEMRESATTRS_DEPLOYMENT_ENVIRONMENT } from '@opentelemetry/semantic-conventions';
import { W3CTraceContextPropagator, W3CBaggagePropagator, CompositePropagator } from '@opentelemetry/core';
import { resourceFromAttributes } from '@opentelemetry/resources';
import profiling from './profiling';

// Configure diagnostic logging (set to INFO in production, DEBUG for troubleshooting)
const logLevel = process.env.OTEL_LOG_LEVEL === 'debug' ? DiagLogLevel.DEBUG : DiagLogLevel.INFO;
diag.setLogger(new DiagConsoleLogger(), logLevel);

// Define service resource with semantic conventions
const resource = resourceFromAttributes({
  [SEMRESATTRS_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'validatorinfo',
  [SEMRESATTRS_SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
  [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
});

// OTLP Collector endpoint (gRPC doesn't need path suffix)
const collectorUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4317';

const sdk = new NodeSDK({
  resource,
  
  // Configure trace propagation (W3C Trace Context + Baggage)
  textMapPropagator: new CompositePropagator({
    propagators: [
      new W3CTraceContextPropagator(),
      new W3CBaggagePropagator(),
    ],
  }),
  
  // Trace configuration with BatchSpanProcessor for production
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: collectorUrl,
      timeoutMillis: 10000,
    })
  ),
  
  // Metrics configuration
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: collectorUrl,
      timeoutMillis: 10000,
    }),
    exportIntervalMillis: 60000, // Export metrics every 60 seconds
  }),
  
  // Logs configuration
  logRecordProcessor: new BatchLogRecordProcessor(
    new OTLPLogExporter({
      url: collectorUrl,
      timeoutMillis: 10000,
    })
  ),
  
  // Auto-instrumentations for common libraries
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable noisy instrumentations
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

// ============================================================================
// SDK Initialization (Synchronous in modern versions)
// ============================================================================
try {
  // Modern NodeSDK.start() is SYNCHRONOUS and returns void
  sdk.start();
  
  console.log('✅ OpenTelemetry instrumentation started successfully');
  console.log(`   Service: ${resource.attributes[SEMRESATTRS_SERVICE_NAME]}`);
  console.log(`   Environment: ${resource.attributes[SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]}`);
  console.log(`   Collector: ${collectorUrl}`);
  
  // Initialize Pyroscope profiling (non-blocking)
  profiling.init();
} catch (error) {
  console.error('❌ Failed to initialize OpenTelemetry SDK:', error);
  process.exit(1);
}

// ============================================================================
// Global Error Handlers
// ============================================================================
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown();
});

// ============================================================================
// Graceful Shutdown
// ============================================================================
const shutdown = async () => {
  try {
    console.log('🔄 Shutting down observability stack...');
    
    // Stop profiling first
    await profiling.stop();
    
    // Then shutdown OpenTelemetry (this is async and returns Promise)
    await sdk.shutdown();
    
    console.log('✅ Observability stack shut down successfully');
  } catch (error) {
    console.error('❌ Error shutting down observability stack:', error);
  } finally {
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('beforeExit', shutdown);