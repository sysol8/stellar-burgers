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

  cy.visit('/', {
    onBeforeLoad(win: Cypress.AUTWindow) {
      win.localStorage.setItem('refreshToken', 'rt-123456');
      win.document.cookie = 'accessToken=Bearer at-abcdef';
    }
  });

  cy.get('[data-cy=ingredients-list]').should('have.length.greaterThan', 0);

  cy.get('[data-cy=ingredient-card]').as('ingredient');
  cy.get('@ingredient').not('[data-cy-type=ingredient-type-bun]').as('notBun');
  cy.get('[data-cy-type=ingredient-type-bun]').as('bun');
});

afterEach(() => {
  cy.clearLocalStorage('refreshToken');
  cy.clearCookie('accessToken');
});

describe('Страница конструктора бургера', () => {
  it('Добавляет один или несколько ингредиентов в конструктор', () => {
    cy.get('[data-cy=burger-constructor]').as('burgerConstructor');

    cy.get('@bun').first().as('firstBun');
    cy.get('@firstBun')
      .getIngredientName()
      .then((name) => {
        cy.get('@firstBun').find('button').click();
        cy.get('@burgerConstructor').should('contain.text', name);
      });

    cy.get('@notBun').each((card: any, i: number) => {
      if (i >= 5) return false;

      cy.wrap(card)
        .getIngredientName()
        .then((name) => {
          cy.wrap(card).find('button').click();
          cy.get('@burgerConstructor').should('contain.text', name);
        });
    });
  });

  it('Открывает и закрывает модальные окна по клику на кнопку закрытия или вне модального окна', () => {
    cy.get('#modals').should('exist');

    cy.get('@ingredient').first().as('firstIngredient');

    cy.get('@firstIngredient')
      .getIngredientName()
      .then((name) => {
        cy.get('@firstIngredient').click();
        cy.get('[data-cy=modal]').as('ingredientModal');
        cy.get('@ingredientModal')
          .should('be.visible')
          .should('contain.text', name);
      });
    cy.get('@ingredientModal').find('button').click();

    cy.get('@firstIngredient').click();
    cy.get('@ingredientModal').should('be.visible');
    cy.get('[data-cy=modal-overlay]').click(50, 50, { force: true });
  });

  it('Создает заказ и очищает конструктор', () => {
    cy.intercept({ method: 'POST', url: `**/api/orders*` }, (req) => {
      expect(req.headers.authorization).to.equal('Bearer at-abcdef');
      req.reply({ fixture: 'order.json' });
    }).as('createOrder');

    cy.get('[data-cy=constructor-no-buns]')
      .as('constructorWithNoBuns')
      .should('exist');
    cy.get('[data-cy=constructor-no-ingredients]')
      .as('constructorWithNoIngredients')
      .should('exist');

    cy.fillBurgerConstructor('@bun', '@notBun');

    cy.get('@constructorWithNoBuns').should('not.exist');
    cy.get('@constructorWithNoIngredients').should('not.exist');

    cy.get('[data-cy=create-order]').scrollIntoView().click();

    cy.get('[data-cy=modal]').as('orderModal');

    cy.wait('@createOrder').then(({ response }: any) => {
      const orderNumber = response.body.order.number;

      cy.get('@orderModal').should('be.visible');
      cy.get('[data-cy=order-number]').should('have.text', orderNumber);

      cy.get('@orderModal').find('button').click();
      cy.get('@orderModal').should('not.exist');

      cy.get('@constructorWithNoBuns').should('exist');
      cy.get('@constructorWithNoIngredients').should('exist');
    });
  });
});
