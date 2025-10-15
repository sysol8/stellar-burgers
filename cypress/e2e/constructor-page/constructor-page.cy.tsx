beforeEach(() => {
  cy.viewport(1920, 1080);

  cy.intercept(
    { method: 'GET', url: `**/api/ingredients*` },
    { fixture: 'ingredients.json' }
  ).as('getIngredients');

  cy.intercept(
    { method: 'GET', url: `**/api/auth/user*` },
    { fixture: 'user.json' }
  ).as('getUser');

  cy.visit('http://localhost:4000', {
    onBeforeLoad(win: Cypress.AUTWindow) {
      win.localStorage.setItem('refreshToken', 'rt-123456');
      win.document.cookie = 'accessToken=Bearer at-abcdef';
    }
  });

  cy.get('[data-cy=ingredients-list]').should('have.length.greaterThan', 0);
});

afterEach(() => {
  cy.clearLocalStorage('refreshToken');
  cy.clearCookie('accessToken');
});

describe('Страница конструктора бургера', () => {
  it('Добавляет один или несколько ингредиентов в конструктор', () => {
    cy.get('[data-cy-type=ingredient-type-bun]').first().find('button').click();

    cy.get('[data-cy=ingredient-card]')
      .not('[data-cy-type=ingredient-type-bun]')
      .each((card: any, i: number) => {
        if (i >= 5) return false;
        cy.wrap(card).scrollIntoView().find('button').click();
      });
  });

  it('Открывает и закрывает модальные окна по клику на кнопку закрытия или вне модального окна', () => {
    cy.get('#modals').should('exist');

    cy.get('[data-cy=ingredient-card]').first().click();

    cy.get('[data-cy=modal]').as('modal').should('be.visible');

    cy.get('@modal').find('button').click();

    cy.get('[data-cy=ingredient-card]').first().click();

    cy.get('@modal').should('be.visible');

    cy.get('[data-cy=modal-overlay]').click(50, 50, { force: true });
  });

  it('Создает заказ и очищает конструктор', () => {
    cy.intercept({ method: 'POST', url: `**/api/orders*` }, (req) => {
      expect(req.headers.authorization).to.equal('Bearer at-abcdef');
      req.reply({ fixture: 'order.json' });
    }).as('createOrder');

    cy.get('[data-cy=constructor-no-buns]').should('exist');
    cy.get('[data-cy=constructor-no-ingredients]').should('exist');

    cy.get('[data-cy-type=ingredient-type-bun]').first().find('button').click();

    cy.get('[data-cy=ingredient-card]')
      .not('[data-cy-type=ingredient-type-bun]')
      .each((card: any, i: number) => {
        if (i >= 5) return false;
        cy.wrap(card).scrollIntoView().find('button').click();
      });

    cy.get('[data-cy=constructor-no-buns]').should('not.exist');
    cy.get('[data-cy=constructor-no-ingredients]').should('not.exist');

    cy.get('[data-cy=create-order]').scrollIntoView().click();

    cy.wait('@createOrder').then(({ response }: any) => {
      const orderNumber = response.body.order.number;

      cy.get('[data-cy=modal]').as('modal').should('be.visible');
      cy.get('[data-cy=order-number]').should('have.text', orderNumber);

      cy.get('@modal').find('button').click();
      cy.get('@modal').should('not.exist');

      cy.get('[data-cy=constructor-no-buns]').should('exist');
      cy.get('[data-cy=constructor-no-ingredients]').should('exist');
    });
  });
});
