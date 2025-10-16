import { ConstructorPage } from '@pages';
import { getStore, useDispatch } from '../../services/store';
import { getIngredients, getUser } from '@slices';
import { IngredientDetails, Modal } from '@components';
import {
  Location,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom';

function ConstructorPageWrapper() {
  const location = useLocation();
  const state = location.state as { background?: Location };
  const navigate = useNavigate();

  const closeModal = () => {
    if (state?.background) navigate(-1);
    else navigate('/', { replace: true });
  };

  return (
    <>
      <Routes location={state?.background || location}>
        <Route path='/' element={<ConstructorPage />} />
      </Routes>
      {state?.background && (
        <Routes>
          <Route
            path='/ingredients/:id'
            element={
              <Modal title={'Детали ингредиента'} onClose={closeModal}>
                <IngredientDetails />
              </Modal>
            }
          />
        </Routes>
      )}
    </>
  );
}

let store: ReturnType<typeof getStore>;

beforeEach(() => {
  cy.viewport(1920, 1080);

  cy.intercept(
    { method: 'GET', url: '/api/ingredients' },
    { fixture: 'ingredients.json' }
  ).as('getIngredients');

  store = getStore();
  store.dispatch(getIngredients());

  cy.mount(<ConstructorPageWrapper />, { reduxStore: store });

  cy.get('[data-cy=ingredients-list]').should('have.length.greaterThan', 0);
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
    cy.window().then((win: Window) =>
      win.localStorage.setItem('refreshToken', 'rt-123456')
    );
    cy.setCookie('accessToken', 'Bearer at-abcdef');

    cy.intercept(
      { method: 'POST', url: '/api/orders' },
      { fixture: 'order.json' },
      (req: any) => {
        expect(req.headers.authorization).toBe('Bearer at-abcdef');
      }
    ).as('createOrder');

    cy.intercept(
      { method: 'GET', url: '/api/auth/user' },
      { fixture: 'user.json' }
    ).as('getUser');

    store.dispatch(getUser());

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

    cy.wait('@getUser');
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
