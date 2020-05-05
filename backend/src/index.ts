import './LoadEnv'; // Must be the first import
import { MongoDB } from './db/mongodb';
import app from '@server';
import logger from '@shared/Logger';


const port = Number(process.env.PORT || 3030);

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

    app.listen(port, () => {
      logger.info('Express server started on port: ' + port);
    });
  })
  .catch((err) => {
    logger.info('Failed to connect to MongoDB: ' + err);
  });
