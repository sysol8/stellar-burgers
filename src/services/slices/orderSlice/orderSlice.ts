import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { TOrder } from '@utils-types';
import { getOrderByNumberApi, getOrdersApi, orderBurgerApi } from '@api';

interface IOrderState {
  orders: TOrder[];
  orderRequest: boolean;
  orderModalData: TOrder | null;
  currentOrder: TOrder | null;
  loading: boolean;
  error: string | null;
}

const initialState: IOrderState = {
  orders: [],
  orderRequest: false,
  orderModalData: null,
  currentOrder: null,
  loading: false,
  error: null
};

export const createOrder = createAsyncThunk(
  'orders/create',
  async (data: string[]) => await orderBurgerApi(data)
);

export const getOrderByNumber = createAsyncThunk(
  'orders/findOne',
  async (num: number) => await getOrderByNumberApi(num)
);

export const getProfileOrders = createAsyncThunk(
  'orders/getProfileOrders',
  async () => await getOrdersApi()
);

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  selectors: {
    getOrderState: (state) => state,
    getOrders: (state) => state.orders,
    getOrderModalData: (state) => state.orderModalData,
    getOrderRequest: (state) => state.orderRequest,
    getCurrentOrder: (state) => state.currentOrder
  },
  reducers: {
    clearOrderModalData: (state) => {
      state.orderModalData = null;
      state.orderRequest = false;
    }
  },
  extraReducers: (builder) =>
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderModalData = action.payload.order;
        state.orderRequest = false;
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.error.message ?? 'Ошибка при заказе';
      })
      .addCase(getOrderByNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentOrder = null;
      })
      .addCase(getOrderByNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentOrder = action.payload.orders[0];
      })
      .addCase(getOrderByNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Неизвестная ошибка';
        state.currentOrder = null;
      })
      .addCase(getProfileOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfileOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.orders = action.payload;
      })
      .addCase(getProfileOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Неизвестная ошибка';
      })
});

export const { clearOrderModalData } = orderSlice.actions;
export const {
  getOrderState,
  getOrders,
  getOrderModalData,
  getOrderRequest,
  getCurrentOrder
} = orderSlice.selectors;
export const orderReducer = orderSlice.reducer;
