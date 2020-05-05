import './LoadEnv'; // Must be the first import
import { MongoDB } from './db/mongodb';
import app from '@server';
import logger from '@shared/Logger';

// Start the server
const port = Number(process.env.PORT || 3030);

new MongoDB().connect().then(db => {
  app.listen(port, () => {
    logger.info('Express server started on port: ' + port);
  });
});
