# EECS Grade Display Tool

This is a tool meant to display and forecast grades for lower-div EECS classes at UC Berkeley. To deploy, run `yarn build && yarn deploy`.

To develop, install the python dependencies in `server/requirements.txt`, run `yarn`, then run `yarn start`.

To setup the database, run `mysql` and run the command `CREATE DATABASE statuscheck;`.

# Environment Variables
OAUTH_SECRET = secret key for oauth

DATABASE_URL = url for mysql db

# MYSQL Setup and Troubleshooting (Mac)

Download community version from [here](https://dev.mysql.com/downloads/mysql/5.1.html)

Add PATH variable to your .bash_profile/.zprofile. For mac, export PATH=${PATH}:/usr/local/mysql/bin

To start server: sudo /usr/local/mysql/support-files/mysql.server start

To stop server: sudo /usr/local/mysql/support-files/mysql.server stop

If you're getting an access denied error when running app.py, follow the steps below:
1. Run mysql using `sudo /usr/local/mysql/bin/mysqld_safe --skip-grant-tables`
2. `DROP USER ‘user’@‘host’;`
3. `FLUSH PRIVILEGES;`
4. `CREATE USER ‘user’@‘host’;`
5. `GRANT ALL PRIVILEGES ON *.* TO ‘user’@‘host’;`

If you're unable to load libssl.1.1.dylib or libcrypto.1.1.dylib when running app.py:
1. `brew install openssl`
2. copy both from `/usr/local/Cellar/openssl/1.0.1?/lib` replacing `1.0.1?` with your version to `usr/local/lib`
