import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice
} from '@reduxjs/toolkit';
import type { TIngredient } from '@utils-types';
import { getIngredientsApi } from '@api';
import { RootState } from '../store';

const ingredientsAdapter = createEntityAdapter({
  selectId: (ingredient: TIngredient) => ingredient._id,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

type ExtraState = { loading: boolean; error: string | null };

const initialState = ingredientsAdapter.getInitialState<ExtraState>({
  loading: false,
  error: null
});

export const getIngredients = createAsyncThunk<TIngredient[]>(
  'ingredients/getAll',
  async () => await getIngredientsApi()
);

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  selectors: {
    getIngredientsSelector: (state) => state
  },
  extraReducers: (builder) => {
    builder
      .addCase(getIngredients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIngredients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      })
      .addCase(getIngredients.fulfilled, (state, action) => {
        state.loading = false;
        ingredientsAdapter.setAll(state, action.payload);
      });
  }
});

export const { getIngredientsSelector } = ingredientsSlice.selectors;
export const {
  selectAll: selectAllIngredients,
  selectById: selectIngredientById
} = ingredientsAdapter.getSelectors<RootState>((state) => state.ingredients);
export const ingredientsReducer = ingredientsSlice.reducer;
