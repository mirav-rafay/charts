const COMMAND_DELAY = 1000;

for (const command of ['click']) {
  Cypress.Commands.overwrite(command, (originalFn, ...args) => {
    const origVal = originalFn(...args);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(origVal);
      }, COMMAND_DELAY);
    });
  });
}

Cypress.Commands.add(
  'login',
  (username = Cypress.env('username'), password = Cypress.env('password')) => {
    cy.visit('/');
    cy.contains('#login_form', 'Log in');
    cy.get('#input_username').type(username);
    cy.get('#input_password').type(password);
    cy.get('#input_go').click();
  }
);
