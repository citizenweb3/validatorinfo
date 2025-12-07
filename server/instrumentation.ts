import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { BatchSpanProcessor, AlwaysOnSampler } from '@opentelemetry/sdk-trace-node';
import { diag, DiagConsoleLogger, DiagLogLevel, trace, metrics } from '@opentelemetry/api';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION, SEMRESATTRS_DEPLOYMENT_ENVIRONMENT } from '@opentelemetry/semantic-conventions';
import { W3CTraceContextPropagator, W3CBaggagePropagator, CompositePropagator } from '@opentelemetry/core';
import { resourceFromAttributes } from '@opentelemetry/resources';
import profiling from './profiling';

// ============================================================================
// Configuration Check
// ============================================================================
const isOtelEnabled = (): boolean => {
  const enabled = process.env.OTEL_ENABLED?.toLowerCase();
  return enabled === 'true' || enabled === '1';
};

// ============================================================================
// No-Op Initialization (when OTEL_ENABLED=false)
// ============================================================================
const initializeNoopTelemetry = (): void => {
  // OpenTelemetry API provides no-op implementations by default
  // No need to explicitly set providers - they're already no-op when not initialized
  console.log('ℹ️  OpenTelemetry is DISABLED (OTEL_ENABLED=false)');
  console.log('   To enable telemetry, set OTEL_ENABLED=true');
};

// ============================================================================
// Main Initialization
// ============================================================================
if (!isOtelEnabled()) {
  initializeNoopTelemetry();
} else {
  try {
    // Configure diagnostic logging
    const logLevel = process.env.OTEL_LOG_LEVEL === 'debug' ? DiagLogLevel.DEBUG : DiagLogLevel.INFO;
    diag.setLogger(new DiagConsoleLogger(), logLevel);

    // Define service resource
    const resource = resourceFromAttributes({
      [SEMRESATTRS_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'validatorinfo',
      [SEMRESATTRS_SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
      [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    });

    const collectorUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://alloy:4317';

    // Initialize SDK
    const sdk = new NodeSDK({
      resource,
      
      // Explicit sampler configuration
      sampler: new AlwaysOnSampler(),
      
      textMapPropagator: new CompositePropagator({
        propagators: [
          new W3CTraceContextPropagator(),
          new W3CBaggagePropagator(),
        ],
      }),
      
      // FIX: Use 'spanProcessors' (array) instead of deprecated 'spanProcessor'
      spanProcessors: [
        new BatchSpanProcessor(
          new OTLPTraceExporter({
            url: collectorUrl,
            timeoutMillis: 5000, // Reduced from 10000
          })
        ),
      ],
      
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: collectorUrl,
          timeoutMillis: 5000,
        }),
        exportIntervalMillis: 60000,
      }),
      
      // FIX: Use 'logRecordProcessors' (array) instead of deprecated 'logRecordProcessor'
      logRecordProcessors: [
        new BatchLogRecordProcessor(
          new OTLPLogExporter({
            url: collectorUrl,
            timeoutMillis: 5000,
          })
        ),
      ],
      
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': {
            enabled: false,
          },
        }),
        new WinstonInstrumentation({
          // Automatically inject trace context into Winston logs
          logHook: (_span, record) => {
            record['resource.service.name'] = resource.attributes[SEMRESATTRS_SERVICE_NAME];
          },
        }),
      ],
    });

    sdk.start();
    
    console.log('✅ OpenTelemetry instrumentation started successfully');
    console.log(`   Service: ${resource.attributes[SEMRESATTRS_SERVICE_NAME]}`);
    console.log(`   Environment: ${resource.attributes[SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]}`);
    console.log(`   Collector: ${collectorUrl}`);
    
    // Initialize Pyroscope profiling (non-blocking)
    profiling.init();
    
    // Graceful Shutdown
    const shutdown = async () => {
      try {
        console.log('🔄 Shutting down observability stack...');
        await profiling.stop();
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
    
  } catch (error) {
    console.error('⚠️ Failed to initialize OpenTelemetry SDK:', error);
    console.warn('⚠️ Application will continue WITHOUT telemetry');
    // DO NOT call process.exit(1) - let the application run
  }
}

// ============================================================================
// Global Error Handlers (always active)
// ============================================================================
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});