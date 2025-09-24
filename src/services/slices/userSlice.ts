import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import {
  registerUserApi,
  loginUserApi,
  logoutApi,
  updateUserApi,
  forgotPasswordApi,
  resetPasswordApi,
  getUserApi,
  TLoginData,
  TRegisterData
} from '@api';
import { TUser } from '@utils-types';
import { deleteCookie, setCookie } from '../../utils/cookie';

interface IUserState {
  user: TUser | null;
  loading: boolean;
  error: string | null;
  isAuthChecked: boolean;
}

const initialState: IUserState = {
  user: null,
  loading: false,
  error: null,
  isAuthChecked: false
};

// методы, которые возвращают TUser

export const getUser = createAsyncThunk('user/getUser', async () => {
  const response = await getUserApi();
  return response.user;
});

export const login = createAsyncThunk(
  'user/login',
  async (data: TLoginData) => {
    const response = await loginUserApi(data);
    setCookie('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response.user;
  }
);

export const register = createAsyncThunk(
  'user/register',
  async (data: TRegisterData) => {
    const response = await registerUserApi(data);
    setCookie('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response.user;
  }
);

export const updateUser = createAsyncThunk(
  'user/update',
  async (data: Partial<TRegisterData>) => {
    const response = await updateUserApi(data);
    return response.user;
  }
);

// методы, которые возвращают что-либо, кроме TUser
export const logout = createAsyncThunk('user/logout', async () => {
  const response = await logoutApi();
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
});

export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async (data: { password: string; token: string }) => {
    await resetPasswordApi(data);
  }
);

const remindPassword = createAsyncThunk(
  'user/forgotPassword',
  async (data: { email: string }) => {
    await forgotPasswordApi(data);
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    markAuthChecked: (state) => {
      state.isAuthChecked = true;
    }
  },
  selectors: {
    getUserSelector: (state) => state
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isAuthChecked = false;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error =
          action.error.message ?? 'Ошибка при загрузке пользователя';
        state.isAuthChecked = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthChecked = true;
      });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addMatcher(
      isAnyOf(
        getUser.pending,
        login.pending,
        register.pending,
        updateUser.pending,
        resetPassword.pending,
        remindPassword.pending,
        logout.pending
      ),
      (state) => {
        state.loading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      isAnyOf(
        getUser.rejected,
        login.rejected,
        register.rejected,
        updateUser.rejected,
        resetPassword.rejected,
        remindPassword.rejected,
        logout.rejected
      ),
      (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Неизвестная ошибка';
      }
    );
  }
});

export const { markAuthChecked } = userSlice.actions;
export const { getUserSelector } = userSlice.selectors;
export const userReducer = userSlice.reducer;
