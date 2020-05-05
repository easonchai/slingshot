import mongoose from 'mongoose';
import { MongoError } from 'mongodb';
import logger from '@shared/Logger';


export class MongoDB {

  private useMongoDB: boolean;
  private connectionString: string;

  public constructor() {
    const active = process.env.MONGODB_ACTIVE || 'false';
    this.useMongoDB = active.toLowerCase() == 'true';
    this.connectionString = process.env.MONGODB_URI || '';

    if (!this.useMongoDB) {
      logger.info('set MONGODB_ACTIVE=true in /backend/env/*.env file to connect to MongoDB');
    } else if (this.connectionString === '') {
      logger.info('Please update your MONGODB_URI to connect to MongoDB database in /backend/env/*.env file');
      logger.info('Alternatively set MONGODB_ACTIVE=false to disable database connection');
    }
  }

  public connect(): Promise<mongoose.Connection> {
    return new Promise((resolve, reject) => {
      if (!this.useMongoDB) {
        reject({
          err: 'MONGODB_ACTIVE=' + process.env.MONGODB_ACTIVE,
          useMongoDB: this.useMongoDB
        });
      } else {
        const options = {
          useNewUrlParser: true,
          useCreateIndex: true,
          useUnifiedTopology: true
        }

        mongoose.connect(this.connectionString, options, (error: MongoError) => {
          if (error) {
            reject({
              err: error.message,
              useMongoDB: this.useMongoDB
            });
          } else {
            logger.info('Successfully connected to MongoDB');
            resolve(mongoose.connection);
          }
        });
      }
    });
  }
}
