const COMMAND_DELAY = 800;

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
    cy.clearCookies();
    cy.visit('/login');
    cy.get('form[name="login"]').should('exist').and('be.visible'); //This should is needed to ensure stability of the test
    cy.get('input#username').type(username);
    cy.get('input#password').type(password);
    cy.get('input[type="submit"]').click();
  }
);
