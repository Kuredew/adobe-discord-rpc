import winston from "winston"
import path from 'path'
import DailyRotateFile from "winston-daily-rotate-file"

const Logger = ({ outputPath }) => {
  const fileRotateTransport = new DailyRotateFile({
    filename: path.join(outputPath, 'log-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.timestamp(),
      winston.format.json()
    )
  })

  const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.timestamp({
        format: 'YYYY-MM-DD hh:mm:ss.SS A'
      }),
      winston.format.printf(({ timestamp, level, message, scope, stack }) => (
        `${timestamp} ${level}${scope ? ` [${scope}]` : ''}: ${message} ${stack || ''}`
      ))
    ),
    transports: [
      new winston.transports.Console(),
      fileRotateTransport
    ]
  })

  return logger
}

export default Logger

//   openFolder() {
//     const command = process.platform === 'win32' ? `explorer "${this.outputDirName}"` : `open "${this.outputDirName}"`;
//     exec(command);
//   }
