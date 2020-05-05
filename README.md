# hackmoney-project
An idea to incentivize event meetups using smart contracts that disburse stakes to each attendee

### Dependencies
	node, npm & npx from [https://nodejs.org/]: https://nodejs.org/

### Prepare static frontend files (for production)
	npm --prefix=frontend install && npm --prefix=frontend run build

### Install backend dependencies
	npm --prefix=backend install

### Run using shared dev MongoDB (/backend/env/development.env)
	npm --prefix=backend run serve-dev

### Run using your own local MongoDB (/backend/env/local.env)
	npm --prefix=backend run serve-local
