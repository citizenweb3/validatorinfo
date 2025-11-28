import Pyroscope, { PyroscopeConfig } from '@pyroscope/nodejs';
import { trace, context } from '@opentelemetry/api';

// Initialize Pyroscope continuous profiling
const pyroscopeConfig: Partial<PyroscopeConfig> = {
  serverAddress: process.env.PYROSCOPE_SERVER_URL || 'http://pyroscope:4040',
  appName: process.env.OTEL_SERVICE_NAME || 'validatorinfo',
  
  // Add environment tags
  tags: {
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  },
};

// Custom wrapper to correlate profiles with OpenTelemetry spans
const wrapWithTraceContext = () => {
  const originalWrapWithLabels = Pyroscope.wrapWithLabels;
  
  Pyroscope.wrapWithLabels = (labels, fn) => {
    const span = trace.getSpan(context.active());
    const enhancedLabels = { ...labels };
    
    if (span) {
      const spanContext = span.spanContext();
      enhancedLabels['trace_id'] = spanContext.traceId;
      enhancedLabels['span_id'] = spanContext.spanId;
    }
    
    return originalWrapWithLabels.call(Pyroscope, enhancedLabels, fn);
  };
};

// Initialize profiling
export const initProfiling = () => {
  try {
    Pyroscope.init(pyroscopeConfig);
    Pyroscope.start();
    wrapWithTraceContext();
    
    console.log('✅ Pyroscope profiling started successfully');
    console.log(`   Server: ${pyroscopeConfig.serverAddress}`);
    console.log(`   App: ${pyroscopeConfig.appName}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Pyroscope:', error);
    console.warn('⚠️  Continuing without profiling...');
    return false;
  }
};

// Stop profiling on shutdown
export const stopProfiling = async () => {
  try {
    await Pyroscope.stop();
    console.log('Pyroscope profiling stopped successfully');
  } catch (error) {
    console.error('Error stopping Pyroscope:', error);
  }
};

// Helper function to profile a specific function with OpenTelemetry correlation
export const profileFunction = <T>(name: string, fn: () => T): T => {
  return Pyroscope.wrapWithLabels({ function: name }, fn) as T;
};

export default {
  init: initProfiling,
  stop: stopProfiling,
  profileFunction,
};
