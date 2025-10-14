import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '../../store';
import { describe, it, expect } from '@jest/globals';
import { orderBurgerApi, getOrderByNumberApi, getOrdersApi } from '@api';
import { TOrder } from '@utils-types';
import {
  clearOrderModalData,
  createOrder,
  getOrderByNumber,
  getProfileOrders
} from './orderSlice';

const getStore = () =>
  configureStore({
    reducer: rootReducer
  });

jest.mock('@api', () => ({
  orderBurgerApi: jest.fn(),
  getOrderByNumberApi: jest.fn(),
  getOrdersApi: jest.fn()
}));

beforeEach(() => {
  jest.resetAllMocks();
});

const createMockOrder = (n: number): TOrder => ({
  _id: `${n}mock${n}`,
  status: 'done',
  name: `Order ${n}`,
  createdAt: '2025-10-14T00:00:00.000Z',
  updatedAt: '2025-10-14T00:00:00.000Z',
  number: n,
  ingredients: []
});

const order1 = createMockOrder(1000);
const order2 = createMockOrder(2000);

describe('orderSlice — createOrder', () => {
  it('pending: orderRequest=true, error=null', async () => {
    (orderBurgerApi as jest.Mock).mockResolvedValueOnce({
      order: order1
    });

    const store = getStore();
    const result = store.dispatch(createOrder(['a', 'b', 'a']));

    const state = store.getState().order;
    expect(state.orderRequest).toBe(true);
    expect(state.error).toBeNull();

    await result;
  });

  it('fulfilled: orderModalData записан, orderRequest=false, error=null', async () => {
    (orderBurgerApi as jest.Mock).mockResolvedValueOnce({
      order: order1
    });

    const store = getStore();
    await store.dispatch(createOrder(['x', 'y', 'x']));

    const state = store.getState().order;
    expect(state.orderRequest).toBe(false);
    expect(state.error).toBeNull();
    expect(state.orderModalData).toEqual(order1);
  });

  it('rejected: orderRequest=false, error установлен, modalData не задан', async () => {
    (orderBurgerApi as jest.Mock).mockRejectedValueOnce(
      new Error('Неизвестная ошибка')
    );

    const store = getStore();
    await store.dispatch(createOrder([]));

    const state = store.getState().order;
    expect(state.orderRequest).toBe(false);
    expect(state.error).toBe('Неизвестная ошибка');
    expect(state.orderModalData).toBeNull();
  });

  it('clearOrderModalData: чистит модалку и сбрасывает флаг orderRequest', () => {
    const store = getStore();
    store.dispatch({
      type: createOrder.fulfilled.type,
      payload: { order: order1 }
    });
    expect(store.getState().order.orderModalData).toEqual(order1);

    store.dispatch(clearOrderModalData());

    const state = store.getState().order;
    expect(state.orderModalData).toBeNull();
    expect(state.orderRequest).toBe(false);
  });
});

describe('orderSlice — getOrderByNumber', () => {
  it('pending: loading=true, error=null, currentOrder=null', async () => {
    (getOrderByNumberApi as jest.Mock).mockResolvedValueOnce({
      orders: [order1]
    });

    const store = getStore();
    const result = store.dispatch(getOrderByNumber(order1.number));

    const state = store.getState().order;
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.currentOrder).toBeNull();

    await result;
  });

  it('fulfilled: loading=false, currentOrder=первый из массива, error=null', async () => {
    (getOrderByNumberApi as jest.Mock).mockResolvedValueOnce({
      orders: [order2]
    });

    const store = getStore();
    await store.dispatch(getOrderByNumber(order2.number));

    const state = store.getState().order;
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.currentOrder).toEqual(order2);
  });

  it('rejected: loading=false, error установлен, currentOrder=null', async () => {
    (getOrderByNumberApi as jest.Mock).mockRejectedValueOnce(
      new Error('Неизвестная ошибка')
    );

    const store = getStore();
    await store.dispatch(getOrderByNumber(999999));

    const state = store.getState().order;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Неизвестная ошибка');
    expect(state.currentOrder).toBeNull();
  });
});

describe('orderSlice — getProfileOrders', () => {
  it('pending: loading=true, error=null', async () => {
    (getOrdersApi as jest.Mock).mockResolvedValueOnce([order1, order2]);

    const store = getStore();
    const result = store.dispatch(getProfileOrders());

    const state = store.getState().order;
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();

    await result;
  });

  it('fulfilled: loading=false, error=null, orders из payload', async () => {
    (getOrdersApi as jest.Mock).mockResolvedValueOnce([order1, order2]);

    const store = getStore();
    await store.dispatch(getProfileOrders());

    const state = store.getState().order;
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.orders).toEqual([order1, order2]);
  });

  it('rejected: loading=false, error установлен', async () => {
    (getOrdersApi as jest.Mock).mockRejectedValueOnce(
      new Error('Неизвестная ошибка')
    );

    const store = getStore();
    await store.dispatch(getProfileOrders());

    const state = store.getState().order;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Неизвестная ошибка');
  });
});
