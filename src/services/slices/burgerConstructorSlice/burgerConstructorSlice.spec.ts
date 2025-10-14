import { expect, describe, it } from '@jest/globals';
import {
  addIngredient,
  burgerConstructorReducer,
  type IBurgerConstructorState,
  moveIngredientDown,
  moveIngredientUp,
  removeIngredient
} from './burgerConstructorSlice';

describe('тесты слайса конструктора бургера', () => {
  const initialState: IBurgerConstructorState = {
    constructorItems: {
      bun: {
        _id: '643d69a5c3f7b9001cfa093c',
        name: 'Краторная булка N-200i',
        type: 'bun',
        proteins: 80,
        fat: 24,
        carbohydrates: 53,
        calories: 420,
        price: 1255,
        image: 'https://code.s3.yandex.net/react/code/bun-02.png',
        image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
        image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png'
      },
      ingredients: [
        {
          id: 'NP9b4TchkrN7mysC3VV4B',
          _id: '643d69a5c3f7b9001cfa0941',
          name: 'Биокотлета из марсианской Магнолии',
          type: 'main',
          proteins: 420,
          fat: 142,
          carbohydrates: 242,
          calories: 4242,
          price: 424,
          image: 'https://code.s3.yandex.net/react/code/meat-01.png',
          image_mobile:
            'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
          image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png'
        },
        {
          id: 'sanosGfAUQp2bN1FdAY_M',
          _id: '643d69a5c3f7b9001cfa0940',
          name: 'Говяжий метеорит (отбивная)',
          type: 'main',
          proteins: 800,
          fat: 800,
          carbohydrates: 300,
          calories: 2674,
          price: 3000,
          image: 'https://code.s3.yandex.net/react/code/meat-04.png',
          image_mobile:
            'https://code.s3.yandex.net/react/code/meat-04-mobile.png',
          image_large: 'https://code.s3.yandex.net/react/code/meat-04-large.png'
        },
        {
          id: 'O3VfKLLzmIR7FD_C8mV_O',
          _id: '643d69a5c3f7b9001cfa0948',
          name: 'Кристаллы марсианских альфа-сахаридов',
          type: 'main',
          proteins: 234,
          fat: 432,
          carbohydrates: 111,
          calories: 189,
          price: 762,
          image: 'https://code.s3.yandex.net/react/code/core.png',
          image_mobile: 'https://code.s3.yandex.net/react/code/core-mobile.png',
          image_large: 'https://code.s3.yandex.net/react/code/core-large.png'
        }
      ]
    }
  };

  const newIngredient = {
    calories: 6,
    carbohydrates: 3,
    fat: 2,
    id: 'mkSUj-_B8v1640_RYevFf',
    image: 'https://code.s3.yandex.net/react/code/salad.png',
    image_large: 'https://code.s3.yandex.net/react/code/salad-large.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/salad-mobile.png',
    name: 'Мини-салат Экзо-Плантаго',
    price: 4400,
    proteins: 1,
    type: 'main',
    _id: '643d69a5c3f7b9001cfa0949'
  };

  const ingredientToDelete = {
    id: 'sanosGfAUQp2bN1FdAY_M',
    _id: '643d69a5c3f7b9001cfa0940',
    name: 'Говяжий метеорит (отбивная)',
    type: 'main',
    proteins: 800,
    fat: 800,
    carbohydrates: 300,
    calories: 2674,
    price: 3000,
    image: 'https://code.s3.yandex.net/react/code/meat-04.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/meat-04-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/meat-04-large.png'
  };

  const getIds = (state: IBurgerConstructorState) =>
    state.constructorItems.ingredients.map((ingredient) => ingredient._id);

  it('добавить ингредиент в конструктор', () => {
    const newState = burgerConstructorReducer(
      initialState,
      addIngredient(newIngredient)
    );

    const prevState = initialState.constructorItems;

    expect(newState.constructorItems).toEqual({
      ...prevState,
      ingredients: [
        ...prevState.ingredients,
        expect.objectContaining({
          id: expect.any(String),
          calories: newIngredient.calories,
          carbohydrates: newIngredient.carbohydrates,
          fat: newIngredient.fat,
          image: newIngredient.image,
          image_large: newIngredient.image_large,
          image_mobile: newIngredient.image_mobile,
          name: newIngredient.name,
          price: newIngredient.price,
          type: newIngredient.type,
          _id: newIngredient._id
        })
      ]
    });
    expect(initialState.constructorItems.ingredients).toHaveLength(3);
  });

  it('удалить ингредиент из конструктора', () => {
    const newState = burgerConstructorReducer(
      initialState,
      removeIngredient(ingredientToDelete)
    );

    const prevState = initialState.constructorItems;

    expect(newState.constructorItems.ingredients).toHaveLength(
      prevState.ingredients.length - 1
    );

    expect(
      newState.constructorItems.ingredients.find(
        (ingredient) => ingredient._id === ingredientToDelete._id
      )
    ).toBeUndefined();
  });

  it('поднимает элемент списка вверх (по индексу)', () => {
    const prevState = initialState;
    expect(getIds(prevState)).toEqual([
      '643d69a5c3f7b9001cfa0941',
      '643d69a5c3f7b9001cfa0940',
      '643d69a5c3f7b9001cfa0948'
    ]);

    const newState = burgerConstructorReducer(prevState, moveIngredientUp(1));

    expect(getIds(newState)).toEqual([
      '643d69a5c3f7b9001cfa0940',
      '643d69a5c3f7b9001cfa0941',
      '643d69a5c3f7b9001cfa0948'
    ]);
  });

  it('не поднимает элемент в списке при нулевом индексе', () => {
    const prevState = initialState;
    expect(getIds(prevState)).toEqual([
      '643d69a5c3f7b9001cfa0941',
      '643d69a5c3f7b9001cfa0940',
      '643d69a5c3f7b9001cfa0948'
    ]);

    const newState = burgerConstructorReducer(prevState, moveIngredientUp(0));
    expect(getIds(newState)).toEqual(getIds(prevState));
  });

  it('опускает элемент списка вниз (по индексу)', () => {
    const prevState = initialState;
    expect(getIds(prevState)).toEqual([
      '643d69a5c3f7b9001cfa0941',
      '643d69a5c3f7b9001cfa0940',
      '643d69a5c3f7b9001cfa0948'
    ]);

    const newState = burgerConstructorReducer(prevState, moveIngredientDown(1));

    expect(getIds(newState)).toEqual([
      '643d69a5c3f7b9001cfa0941',
      '643d69a5c3f7b9001cfa0948',
      '643d69a5c3f7b9001cfa0940'
    ]);
  });

  it('не опускает ниже последний элемент списка', () => {
    const prevState = initialState;
    const lastItemIndex = prevState.constructorItems.ingredients.length - 1;

    const newState = burgerConstructorReducer(
      prevState,
      moveIngredientDown(lastItemIndex)
    );

    expect(getIds(newState)).toEqual(getIds(prevState));
  });

  it('не работает с некорректными индексами (не двигает вверх при отрицательном индексе, не двигает вниз при слишком большом индексе)', () => {
    const prevState = initialState;
    const newState1 = burgerConstructorReducer(prevState, moveIngredientUp(-1));
    const newState2 = burgerConstructorReducer(
      prevState,
      moveIngredientDown(999)
    );

    expect(getIds(newState1)).toEqual(getIds(prevState));
    expect(getIds(newState2)).toEqual(getIds(prevState));
  });
});
