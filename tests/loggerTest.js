import Logger from "../src/logger/logger.js";

const logger = Logger({ outputPath: "logs/application-%DATE%.log" })

// test log
logger.info('Testing')

// test child log with scope
logger.child({ scope: 'main' }).info('Testing')
