import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import commandLineArgs from 'command-line-args';

// Setup command line options
const options = commandLineArgs([
    {
        name: 'env',
        alias: 'e',
        defaultValue: 'production',
        type: String,
    },
]);

// Set the env file
const myEnv = dotenv.config({
    path: `./env/${options.env}.env`,
});

if (myEnv.error) {
    throw myEnv.error;
}

// Parses recursive variables
dotenvExpand(myEnv);