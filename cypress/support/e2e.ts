// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

type BunSelector = string;
type IngredientSelector = string;
type BunOrIngredient = BunSelector | IngredientSelector;

declare global {
  namespace Cypress {
    interface Chainable {
      fillBurgerConstructor(
        buns: string,
        ingredients: string
      ): Chainable<JQuery<HTMLElement>>;
      getIngredientName(nameSelector?: string): Chainable<string>;
    }
  }
}

Cypress.Commands.add(
  'fillBurgerConstructor',
  (buns: BunSelector, ingredients: IngredientSelector) => {
    cy.get(buns).first().find('button').click();

    cy.get(ingredients).each((card: any, i: number) => {
      if (i >= 5) return false;
      cy.wrap(card).scrollIntoView().find('button').click();
    });
  }
);

Cypress.Commands.add(
  'getIngredientName',
  { prevSubject: ['element'] },
  (subject, nameSelector: string = '[data-cy=ingredient-name]') => {
    return cy
      .wrap(subject)
      .find(nameSelector)
      .invoke('text')
      .then((text: string) => text.trim());
  }
);
