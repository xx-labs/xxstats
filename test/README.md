# Cypress e2e tests

## Run all tests

Run production, development and local tests:

```
yarn workspace test start
```

## Run development test:

```
yarn workspace test start -s cypress/e2e/dev.spec.cy.js
```

## Run production test:

```
yarn workspace test start -s cypress/e2e/prod.spec.cy.js
```

## Run local test:

First run frontend dev environment:

```
yarn workspace frontend dev
```

Then use another terminal to run:

```
yarn workspace test start -s cypress/e2e/local.spec.cy.js
```

## Open Cypress console:

```
yarn workspace test open
```