/// <reference types="cypress" />

import { random } from './utils';

it('contains the sample blogpost and a comment', () => {
  cy.visit('/');
  cy.get('.wp-block-query');
  cy.get('.wp-block-post-title a').click();
  cy.fixture('helloworld').then((hw) => {
    cy.contains('.wp-block-post-title', hw.title);
    cy.contains('.wp-block-post-content', hw.content);
  });

  cy.get('.wp-block-post-title').click();
  cy.get('.commentlist').should('have.length', 1);
  cy.fixture('helloworld').then((hw) => {
    cy.get('.comment-author').should('contain.text', hw.commenter);

    cy.fixture('helloworld').then((hw) => {
      cy.get('#comment').type(hw.comment).should('have.value', hw.comment);
    });

    cy.fixture('user').then((user) => {
      cy.get('#author').type(user.username).should('have.value', user.username);
      cy.get('#email').type(user.email).should('have.value', user.email);
    });

    cy.get('#submit').click();
  });
});

it('disallows login to an invalid user', () => {
  cy.clearCookies();
  cy.visit('/wp-login.php');
  cy.fixture('user').then((user) => {
    cy.get('#user_login')
      .type(user.username)
      .should('have.value', user.username); // Since login can be flaky, leaving additional asserts
    cy.get('#user_pass')
      .type(user.password)
      .should('have.value', user.password);
  });
  cy.get('#wp-submit').click();
  cy.fixture('user').then((user) => {
    cy.get('#login_error').should(
      'contain.text',
      `The username ${user.username} is not registered on this site.`
    );
  });
});

it('disallows login to a valid user with wrong password', () => {
  cy.clearCookies();
  cy.visit('/wp-login.php');
  cy.get('#user_login')
    .type(Cypress.env('username'))
    .should('have.value', Cypress.env('username'));
  cy.fixture('user').then((user) => {
    cy.get('#user_pass')
      .type(user.password)
      .should('have.value', user.password);
  });
  cy.get('#wp-submit').click();
  cy.get('#login_error').should(
    'contain.text',
    `Error: The password you entered for the username ${Cypress.env(
      'username'
    )} is incorrect. Lost your password?`
  );
});

it('checks the blog name and user email configuration', () => {
  cy.login();
  cy.visit('/wp-admin/options-general.php');
  cy.get('#new_admin_email').should(
    'have.value',
    Cypress.env('wordpressEmail')
  );
  cy.get('#blogname').should('have.value', Cypress.env('wordpressBlogname'));
});

it('checks if admin can edit a site', () => {
  cy.login();
  cy.visit('/wp-admin/index.php');
  cy.contains('Open site editor').click();
  cy.url().should('include', '/wp-admin/site-editor.php');
});

it('checks if admin can create a post', () => {
  cy.login();
  cy.visit('/wp-admin/post-new.php');
  cy.get('.components-modal__header > .components-button').click();
  cy.contains('button[type="button"]', 'Publish').click();
  cy.get('h1[aria-label="Add title"]')
    .clear()
    .type(`Test Hello World!${random}`);
  cy.get('.editor-post-save-draft').click();
  cy.get('.editor-post-saved-state').and('have.text', 'Saved');
});

it('checks the SMTP configuration', () => {
  cy.login();
  cy.visit('/wp-admin/admin.php?page=wp-mail-smtp');
  cy.contains('div', 'WP Mail SMTP');
  cy.get('#wp-mail-smtp-setting-smtp-host').should(
    'have.value',
    Cypress.env('smtpMailServer')
  );
  cy.get('#wp-mail-smtp-setting-smtp-port').should(
    'have.value',
    Cypress.env('smtpPort')
  );
  cy.get('#wp-mail-smtp-setting-smtp-user').should(
    'have.value',
    Cypress.env('smtpUser')
  );
  cy.get('#wp-mail-smtp-setting-from_name').should(
    'have.value',
    `${Cypress.env('wordpressFirstName')} ${Cypress.env('wordpressLastName')}`
  );
});

it('allows the upload of a file', () => {
  cy.login();
  cy.visit('wp-admin/upload.php');
  cy.contains("[role='button']", 'Add New').click();
  cy.contains('[aria-labelledby]', 'Select Files');
  cy.get('input[type=file]').selectFile(
    'cypress/fixtures/images/test_image.jpeg',
    { force: true }
  );
  cy.get('.attachment');
});

it('allows to log out', () => {
  cy.login();
  cy.visit('wp-login.php?loggedout=true&wp_lang=en_US');
  cy.contains('.message', 'logged out');
});
