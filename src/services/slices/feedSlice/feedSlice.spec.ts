import { expect, describe, it } from '@jest/globals';
import { getFeedsApi } from '@api';
import { getFeed, type TFeedState } from './feedSlice';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '../../store';

jest.mock('@api', () => ({
  getFeedsApi: jest.fn()
}));

const payload: TFeedState = {
  orders: [
    {
      _id: '68ee1e35b9d496001c839990',
      ingredients: [
        '643d69a5c3f7b9001cfa093d',
        '643d69a5c3f7b9001cfa0941',
        '643d69a5c3f7b9001cfa093d'
      ],
      status: 'done',
      name: 'Флюоресцентный био-марсианский бургер',
      createdAt: '2025-10-14T09:56:05.048Z',
      updatedAt: '2025-10-14T09:56:06.194Z',
      number: 91286
    },
    {
      _id: '68ee08a7b9d496001c839976',
      ingredients: ['643d69a5c3f7b9001cfa093d', '643d69a5c3f7b9001cfa093d'],
      status: 'done',
      name: 'Флюоресцентный бургер',
      createdAt: '2025-10-14T08:24:07.382Z',
      updatedAt: '2025-10-14T08:24:08.415Z',
      number: 91285
    },
    {
      _id: '68ee07c6b9d496001c839974',
      ingredients: [
        '643d69a5c3f7b9001cfa093c',
        '643d69a5c3f7b9001cfa093e',
        '643d69a5c3f7b9001cfa0941',
        '643d69a5c3f7b9001cfa093e',
        '643d69a5c3f7b9001cfa093e'
      ],
      status: 'done',
      name: 'Краторный био-марсианский люминесцентный бургер',
      createdAt: '2025-10-14T08:20:22.166Z',
      updatedAt: '2025-10-14T08:20:23.314Z',
      number: 91284
    }
  ],
  total: 90911,
  totalToday: 80
};

const getStore = () =>
  configureStore({
    reducer: rootReducer
  });

beforeEach(() => {
  jest.resetAllMocks();
});

describe('тесты слайса ленты заказов', () => {
  it('устанавливает состояние загрузки в true и очищает поле error при статусе pending', async () => {
    (getFeedsApi as jest.Mock).mockResolvedValueOnce(payload);

    const store = getStore();

    const result = store.dispatch(getFeed());
    const state = store.getState().feed;
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.orders).toEqual([]);
    expect(state.total).toBe(0);
    expect(state.totalToday).toBe(0);

    await result;
  });

  it(
    'устанавливает состояние загрузки в false, ' +
      'записывает результат промиса в стейт, ' +
      'при этом сортируя заказы по number',
    async () => {
      (getFeedsApi as jest.Mock).mockResolvedValueOnce(payload);

      const store = getStore();

      await store.dispatch(getFeed());

      const state = store.getState().feed;

      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.orders).toEqual(payload.orders);
      expect(state.total).toBe(payload.total);
      expect(state.totalToday).toBe(payload.totalToday);
    }
  );

  it('записывает ошибку в поле error при реджекте промиса', async () => {
    (getFeedsApi as jest.Mock).mockRejectedValueOnce(
      new Error('Неизвестная ошибка')
    );

    const store = getStore();

    await store.dispatch(getFeed());

    const state = store.getState().feed;

    expect(state.error).toBe('Неизвестная ошибка');
    expect(state.loading).toBe(false);
    expect(state.orders).toEqual([]);
    expect(state.total).toBe(0);
    expect(state.totalToday).toBe(0);
  });
});
