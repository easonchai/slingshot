import './LoadEnv'; // Must be the first import
import { MongoDB } from './db/mongodb';
import app from '@server';
import logger from '@shared/Logger';


function startServer() {
  const port = Number(process.env.PORT || 3030);

  app.listen(port, () => {
    logger.info('Express server started on port: ' + port);
  });
}

new MongoDB().connect()
  .then(db => {
    // Set handlers for future MongoDB disconnects / reconnects.
    db.on('connected', () => {
      console.log('Connected to MongoDB');
    });

    db.on('disconnected', () => {
      console.log('Disconnected from MongoDB');
      // TODO: verify whether we need to re-establish the connection here or if it's automatically done.
    });

    startServer();
  })
  .catch((res) => {
    logger.info('Failed to connect to MongoDB: ' + res.err);

    if (!res.useMongoDB) {
      // In case the config file didn't require us to use MongoDB, we can proceed with the express server.
      startServer();
    } else {
      logger.info('Exiting.');
    }
  });
