import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter
} from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';
import { getFeedsApi, getOrderByNumberApi } from '@api';
import type { RootState } from '../store';

type ExtraState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  loading: boolean;
  error: string | null;
};

const feedAdapter = createEntityAdapter<TOrder, number>({
  selectId: (order) => order.number,
  sortComparer: (a, b) => a.number - b.number
});

const initialState = feedAdapter.getInitialState<ExtraState>({
  orders: [],
  total: 0,
  totalToday: 0,
  loading: false,
  error: null
});

export const getFeed = createAsyncThunk(
  'feed/getOrders',
  async () => await getFeedsApi()
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  selectors: {
    getFeedState: (state) => state,
    getFeedLoading: (state) => state.loading,
    getTotalOrders: (state) => state.total,
    getTotalTodayOrders: (state) => state.totalToday,
    getFeedOrders: (state) => state.orders
  },
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(getFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
        feedAdapter.removeAll(state);
        state.orders = [];
        state.total = 0;
        state.totalToday = 0;
      })
      .addCase(getFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        feedAdapter.setAll(state, action.payload.orders);
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(getFeed.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? 'Ошибка при получении ленты заказов';
        feedAdapter.removeAll(state);
        state.orders = [];
        state.total = 0;
        state.totalToday = 0;
      })
});

export const {
  getFeedState,
  getFeedOrders,
  getFeedLoading,
  getTotalOrders,
  getTotalTodayOrders
} = feedSlice.selectors;

const feedSelectors = feedAdapter.getSelectors<RootState>(
  (state) => state.feed
);

export const getFeedOrdersFromAdapter = (state: RootState) =>
  feedSelectors.selectAll(state);

export const feedReducer = feedSlice.reducer;
