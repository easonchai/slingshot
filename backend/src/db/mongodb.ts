import * as mongoose from 'mongoose';
import { MongoError } from 'mongodb';

export class MongoDB {

  private connectionString;

  public constructor() {
    this.useMongoDB = process.env.MONGODB_ACTIVE || false;
    this.connectionString = process.env.MONGODB_URI || '';

    if (!this.useMongoDB) {
      console.log('set MONGODB_ACTIVE=true in /backend/env/*.env file to connect to MongoDB.');
    } else if (this.connectionString === '') {
      console.log('Please update your MONGODB_URI to connect to MongoDB database in /backend/env/*.env file.');
      console.log('Alternatively set MONGODB_ACTIVE=false to disable database connection.');
    }

    (<any>mongoose).Promise = global.Promise;
    mongoose.connection.on('connected', () => {
      console.log('Connected to mongodb');
    });
    mongoose.connection.on('disconnected', () => {
      console.log('Disconnected from mongodb');
    });
  }

  public connect(): Promise<mongoose.Connection> {
    return new Promise((resolve, reject) => {
      mongoose.connect(this.connectionString, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }, (error: MongoError) => {
        if (error) {
          console.log('Error while connecting to mongodb');
          console.log(' -> ' + error.message);
          reject();
        } else {
          resolve(mongoose.connection);
        }
      });
    });
  }
}
