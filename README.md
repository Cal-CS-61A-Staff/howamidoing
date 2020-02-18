# EECS Grade Display Tool

This is a tool meant to display and forecast grades for lower-div EECS classes at UC Berkeley. To deploy, run `yarn build && yarn deploy`.

To develop, install the python dependencies in `server/requirements.txt`, run `yarn`, then run `yarn start`.

To setup the database, run `mysql` and run the command `CREATE DATABASE statuscheck;`.

# Environment Variables
OAUTH_SECRET = secret key for oauth
DATABASE_URL = url for mysql db
