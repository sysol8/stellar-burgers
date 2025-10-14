import { expect, describe, it } from '@jest/globals';
import {
  ingredientsReducer,
  getIngredients,
  selectAllIngredients
} from './ingredientsSlice';
import { getIngredientsApi } from '@api';
import { TIngredient } from '@utils-types';
import { configureStore } from '@reduxjs/toolkit';
import { Simulate } from 'react-dom/test-utils';
import select = Simulate.select;
import { rootReducer } from '../../store';
import { getFeed } from '../feedSlice/feedSlice';

jest.mock('@api', () => ({
  getIngredientsApi: jest.fn()
}));

const payload: TIngredient[] = [
  {
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
  },
  {
    _id: '643d69a5c3f7b9001cfa0941',
    name: 'Биокотлета из марсианской Магнолии',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'https://code.s3.yandex.net/react/code/meat-01.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png'
  },
  {
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
  }
];

const getStore = () =>
  configureStore({
    reducer: rootReducer
  });

beforeEach(() => {
  jest.resetAllMocks();
});

describe('тесты слайса ингредиентов', () => {
  it('устанавливает флаг loading при статусе pending асинхронного экшена', async () => {
    (getIngredientsApi as jest.Mock).mockResolvedValueOnce(payload);

    const store = getStore();

    const result = store.dispatch(getIngredients());
    expect(store.getState().ingredients.loading).toBe(true);
    expect(store.getState().ingredients.error).toBeNull();

    await result;
  });

  it('загружает ингредиенты, записывает корректное состояние загрузки и сортирует ингредиенты по name', async () => {
    (getIngredientsApi as jest.Mock).mockResolvedValueOnce(payload);

    const store = getStore();

    await store.dispatch(getIngredients());

    const state = store.getState().ingredients;

    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();

    const allIngredients = selectAllIngredients(store.getState());
    expect(allIngredients.map((ingredient) => ingredient.name)).toEqual([
      'Биокотлета из марсианской Магнолии',
      'Говяжий метеорит (отбивная)',
      'Кристаллы марсианских альфа-сахаридов'
    ]);
  });

  it('записывает ошибку в стейт при реджекте промиса', async () => {
    (getIngredientsApi as jest.Mock).mockRejectedValueOnce(
      new Error('Неизвестная ошибка')
    );

    const store = getStore();

    const result = store.dispatch(getIngredients());
    expect(store.getState().ingredients.loading).toBe(true);

    await result;

    const state = store.getState().ingredients;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Неизвестная ошибка');
    expect(state.ids).toEqual([]);
  });
});
