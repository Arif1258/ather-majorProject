import pino from 'pino';

// Define the transport for pretty logging in development, standard JSON otherwise
const transport =
  process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      })
    : undefined;

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    base: {
      env: process.env.NODE_ENV,
    },
  },
  transport
);
