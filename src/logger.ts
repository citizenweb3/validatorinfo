import { Format } from 'logform';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { trace, context } from '@opentelemetry/api';
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, label, json } = format;

export type Logger = {
  logInfo: (message: string) => void;
  logError: (message: string, e?: any) => void;
  logWarn: (message: string) => void;
  logDebug: (message: string) => void;
};

const loggers: Record<string, Logger> = {};

// Custom format to add OpenTelemetry trace context
const addTraceContext = format((info) => {
  const span = trace.getSpan(context.active());
  if (span) {
    const spanContext = span.spanContext();
    info.trace_id = spanContext.traceId;
    info.span_id = spanContext.spanId;
    info.trace_flags = spanContext.traceFlags;
  }
  return info;
});

const getLogFormat = (customLabel: string): Format => {
  return combine(
    addTraceContext(),
    label({ label: customLabel.toUpperCase() }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(({ level, message, label, timestamp, trace_id, span_id }) => {
      let color = '\x1b[0m';
      switch (level) {
        case 'info':
          color = '\x1b[32m';
          break;
        case 'error':
          color = '\x1b[31m';
          break;
        case 'warn':
          color = '\x1b[33m';
          break;
        case 'debug':
          color = '\x1b[34m';
          break;
        default:
          break;
      }
      const traceInfo = trace_id ? ` [trace_id=${trace_id} span_id=${span_id}]` : '';
      return `${color}${timestamp} ${level.toUpperCase()}\t[${label}]${traceInfo}\t${message}\x1b[0m`;
    }),
  );
};

const getFileLogFormat = (customLabel: string): Format => {
  return combine(
    addTraceContext(),
    label({ label: customLabel }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  );
};

const logger = (customLabel: string = 'default'): Logger => {
  if (loggers[customLabel]) {
    return loggers[customLabel];
  }

  const globalLogger = createLogger({
    level: 'info',
    format: getLogFormat(customLabel),
    transports: [
      new transports.Console({
        format: getLogFormat(customLabel),
      }),
      new DailyRotateFile({
        filename: 'logs/%DATE%-app.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: getFileLogFormat(customLabel),
      }),
      // OpenTelemetry transport - sends logs to OTLP collector
      new OpenTelemetryTransportV3(),
    ],
  });

  const logInfo = (message: string): void => {
    globalLogger.info(message);
  };

  const logError = (message: string, e?: any): void => {
    globalLogger.error(message, e);
  };

  const logWarn = (message: string): void => {
    globalLogger.warn(message);
  };

  const logDebug = (message: string): void => {
    globalLogger.debug(message);
  };

  loggers[customLabel] = {
    logInfo,
    logError,
    logWarn,
    logDebug,
  };

  return loggers[customLabel];
};

export default logger;
