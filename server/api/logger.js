import bunyan from 'bunyan';
import bunyanFormat from 'bunyan-format';
import { Bunyan2Loggly } from 'bunyan-loggly';
import BunyanMongo from './logger-mongo';
import Launchdock from './core';
import { Settings } from '/lib/collections';

/**
 * Global logging config
 */

const logLevel = process.env.LAUNCHDOCK_LOG_LEVEL || 'INFO';

// console output formatting
const formatOut = bunyanFormat({
  outputMode: 'short'
});

// default console config
const streams = [{
  level: 'info',
  stream: formatOut
}];


// Loggly config (only used in production)
if (Launchdock.isProduction()) {
  const logglyToken = process.env.LOGGLY_TOKEN;
  const logglySubdomain = process.env.LOGGLY_SUBDOMAIN;

  if (logglyToken && logglySubdomain) {
    const logglyStream = {
      type: 'raw',
      stream: new Bunyan2Loggly({
        token: logglyToken,
        subdomain: logglySubdomain
      })
    };
    streams.push(logglyStream);
  }
}


// Mongo logger config
// const mongoStream = {
//   type: 'raw',
//   stream: new BunyanMongo()
// };
// streams.push(mongoStream);


const name = Settings.get('app.title', 'Launchdock');

// create default logger instance
const Logger = bunyan.createLogger({
  name,
  streams
});

// set default level
Logger.level(logLevel);

export default Logger;
