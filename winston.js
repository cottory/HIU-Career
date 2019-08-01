const appRoot = require('app-root-path');
const winston = require('winston');
const process = require('process');

const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;    // log 출력 포맷 정의
  });

const options = {
    //log File
    file: {
        level: 'info',
        filename: appRoot.path + '/logs/winston.log',
        handleExceptions: true,
        json: false,
        maxsize: 5242880,   //5MB
        maxFiles: 5,
        colorize: false,
        format: combine(
            label({ label: 'release-winston-test '}),
            timestamp(),
            myFormat    //log 출력 포맷
        )
    },
    
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorsize: true,
        format: combine(
            label({ label: 'dev-winston-test'}),
            timestamp(),
            myFormat
        )
    }
}

let logger = new winston.createLogger({
    transports: [
        new winston.transports.File(options.file)
    ],
    exitOnError: false,
});

if(process.env.NODE_ENV !== 'production'){
    logger.add(new winston.transports.Console(options.console))
}

module.exports = logger;