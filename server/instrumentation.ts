import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION, ATTR_DEPLOYMENT_ENVIRONMENT } from '@opentelemetry/semantic-conventions';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { CompositePropagator, W3CBaggagePropagator } from '@opentelemetry/core';
import profiling from './profiling';

// Configure diagnostic logging (set to INFO in production, DEBUG for troubleshooting)
const logLevel = process.env.OTEL_LOG_LEVEL === 'debug' ? DiagLogLevel.DEBUG : DiagLogLevel.INFO;
diag.setLogger(new DiagConsoleLogger(), logLevel);

// Define service resource with semantic conventions
const resource = new Resource({
  [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'validatorinfo',
  [ATTR_SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
  [ATTR_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
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
  traceExporter: new OTLPTraceExporter({
    url: collectorUrl,
    timeoutMillis: 10000,
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: collectorUrl,
      timeoutMillis: 10000,
    }),
    exportIntervalMillis: 60000, // Export metrics every 60 seconds
  }),
  logRecordProcessor: new BatchLogRecordProcessor(
    new OTLPLogExporter({
      url: collectorUrl,
      timeoutMillis: 10000,
    })
  ),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable instrumentations that may cause issues or aren't needed
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // Can be very noisy
      },
    }),
  ],
});

// Start the SDK and profiling
sdk
  .start()
  .then(() => {
    console.log('✅ OpenTelemetry instrumentation started successfully');
    console.log(`   Service: ${resource.attributes[ATTR_SERVICE_NAME]}`);
    console.log(`   Environment: ${resource.attributes[ATTR_DEPLOYMENT_ENVIRONMENT]}`);
    console.log(`   Collector: ${collectorUrl}`);
    
    // Initialize Pyroscope profiling (non-blocking)
    profiling.init();
  })
  .catch((error) => {
    console.error('❌ Failed to initialize OpenTelemetry SDK:', error);
    process.exit(1);
  });

// Graceful shutdown
const shutdown = async () => {
  try {
    console.log('Shutting down observability stack...');
    
    // Stop profiling first
    await profiling.stop();
    
    // Then shutdown OpenTelemetry
    await sdk.shutdown();
    console.log('Observability stack shut down successfully');
  } catch (error) {
    console.error('Error shutting down observability stack:', error);
  } finally {
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('beforeExit', shutdown);