const {createLogger, format, transports} = require("winston");
const {colorize, label, printf, timestamp} = format;

//Bot logger
var transportList = [
    new transports.File({
        level: "warn",
        filename: "logs/bot.log",
        format: format.json()
    })
];

const consoleFormat = format.combine(
    colorize({
        all: true
    }),
    label({
        label: '[BOT]'
    }),
    timestamp({
        format: "DD-MM-YYYY HH:MM:SS"
    }),
    printf(info => {
        if(info.stack) {
            return `${info.label}  ${info.timestamp}  ${info.level} : ${info.message} \n ${info.stack}`;
        }
        return `${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
    })
);

if (process.env.NODE_ENV === "development") {
    transportList.push(new transports.Console({
        level: "debug",
        format: consoleFormat
    }));
} else {
    transportList.push(new transports.Console({
        level: "info",
        format: consoleFormat
    }));
}

const botLogger = createLogger({
    level: "debug",
    transports: transportList,
    exitOnError: false
});

module.exports.logger = botLogger;

//Express server logger
var transportListServer = [
    new transports.File({
        level: "warn",
        filename: "logs/server.log",
        format: format.json()
    })
];

const consoleFormatServer = format.combine(
    colorize({
        all: true
    }),
    label({
        label: '[EXPRESS SERVER]'
    }),
    timestamp({
        format: "DD-MM-YYYY HH:MM:SS"
    }),
    printf(info => {
        if(info.stack) {
            return `${info.label}  ${info.timestamp}  ${info.level} : ${info.message} \n ${info.stack}`;
        }
        return `${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
    })
);

if (process.env.NODE_ENV === "development") {
    transportListServer.push(new transports.Console({
        level: "debug",
        format: consoleFormatServer
    }));
} else {
    transportListServer.push(new transports.Console({
        level: "info",
        format: consoleFormatServer
    }));
}

const serverLogger = createLogger({
    level: "debug",
    transports: transportListServer,
    exitOnError: false
});

module.exports.server = serverLogger;