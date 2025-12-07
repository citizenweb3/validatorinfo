import winston from 'winston';
import { context, trace } from '@opentelemetry/api';
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';

// Custom format to inject trace context
const traceFormat = winston.format((info) => {
  const span = trace.getSpan(context.active());
  if (span) {
    const spanContext = span.spanContext();
    info.trace_id = spanContext.traceId;
    info.span_id = spanContext.spanId;
    info.trace_flags = spanContext.traceFlags;
  }
  return info;
});

// Create Winston logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    traceFormat(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: process.env.OTEL_SERVICE_NAME || 'validatorinfo',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport for local development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, trace_id, ...meta }) => {
          const traceInfo = trace_id ? ` [trace_id=${trace_id}]` : '';
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} ${level}:${traceInfo} ${message}${metaStr}`;
        })
      ),
    }),
    // OpenTelemetry transport - sends logs to OTLP collector
    new OpenTelemetryTransportV3(),
  ],
});

// Create a stream for Morgan HTTP logger
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger;
