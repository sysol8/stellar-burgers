import {
  createAsyncThunk,
  createSlice,
  nanoid,
  type PayloadAction
} from '@reduxjs/toolkit';
import {
  TConstructorIngredient,
  TIngredient,
  TConstructorItems
} from '@utils-types';
import { swapItemsInArray } from '../../utils/utils';
import { createOrder } from './orderSlice';

interface IBurgerConstructorState {
  constructorItems: TConstructorItems;
}

const initialState: IBurgerConstructorState = {
  constructorItems: {
    bun: null,
    ingredients: []
  }
};

const burgerConstructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  selectors: {
    getConstructorItems: (state) => state.constructorItems
  },
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.constructorItems.bun = action.payload;
        } else {
          state.constructorItems.ingredients.push(action.payload);
        }
      },
      prepare: (ingredient: TIngredient) => {
        const key = nanoid();
        return { payload: { ...ingredient, id: key } };
      }
    },
    removeIngredient: (
      state,
      action: PayloadAction<TConstructorIngredient>
    ) => {
      state.constructorItems.ingredients =
        state.constructorItems.ingredients.filter(
          (ingredient) => ingredient.id !== action.payload.id
        );
    },
    moveIngredientUp: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      const ingredients = state.constructorItems.ingredients;
      if (index > 0) swapItemsInArray(ingredients, index, index - 1);
    },
    moveIngredientDown: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      const ingredients = state.constructorItems.ingredients;
      if (index < state.constructorItems.ingredients.length - 1)
        swapItemsInArray(ingredients, index, index + 1);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(createOrder.fulfilled, (state) => {
      state.constructorItems.ingredients = [];
      state.constructorItems.bun = null;
    });
  }
});

export const {
  addIngredient,
  removeIngredient,
  moveIngredientUp,
  moveIngredientDown
} = burgerConstructorSlice.actions;
export const { getConstructorItems } = burgerConstructorSlice.selectors;
export const burgerConstructorReducer = burgerConstructorSlice.reducer;
