const CLICK_DELAY = 500;
const BASE_URL = 'http://bitnami-discourse.my';

for (const command of ['click']) {
  Cypress.Commands.overwrite(command, (originalFn, ...args) => {
    const origVal = originalFn(...args);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(origVal);
      }, CLICK_DELAY);
    });
  });
}

Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
  return originalFn(`${BASE_URL}${url}`, options);
});

Cypress.Commands.add(
  'login',
  (username = Cypress.env('username'), password = Cypress.env('password')) => {
    cy.visit('/');
    cy.contains('button', 'Log In').click();
    cy.get('#login-account-name').type(username);
    cy.get('#login-account-password').type(`${password}{enter}`);
    cy.get('body').then(($body) => {
      if ($body.text().includes('Skip these tips')) {
        cy.contains('Skip these tips').click();
      }
    });
    // In Discourse, logging is not considered as completed until the home page is visible.
    // Navigating to any other site before that will lead to a 404 error
    cy.contains('Admin Quick Start Guide');
  }
);
