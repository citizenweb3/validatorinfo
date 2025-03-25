import { Format } from 'logform';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, label, json } = format;

export type Logger = {
  logInfo: (message: string) => void;
  logError: (message: string, e?: any) => void;
  logWarn: (message: string) => void;
  logDebug: (message: string) => void;
};

const loggers: Record<string, Logger> = {};

const getLogFormat = (customLabel: string): Format => {
  return combine(
    label({ label: customLabel.toUpperCase() }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(({ level, message, label, timestamp }) => {
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
      return `${color}${timestamp} ${level.toUpperCase()}\t[${label}]\t${message}\x1b[0m`;
    }),
  );
};

const getFileLogFormat = (customLabel: string): Format => {
  return combine(label({ label: customLabel }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json());
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
