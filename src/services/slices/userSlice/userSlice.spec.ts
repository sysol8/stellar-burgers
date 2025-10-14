import { expect, describe, it } from '@jest/globals';
import {
  getUserApi,
  loginUserApi,
  registerUserApi,
  updateUserApi,
  logoutApi,
  resetPasswordApi
} from '@api';
import { setCookie, deleteCookie } from '../../../utils/cookie';
import { TUser } from '@utils-types';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '../../store';
import {
  getUser,
  login,
  logout,
  register,
  resetPassword,
  updateUser
} from './userSlice';

jest.mock('@api', () => ({
  getUserApi: jest.fn(),
  loginUserApi: jest.fn(),
  registerUserApi: jest.fn(),
  updateUserApi: jest.fn(),
  logoutApi: jest.fn(),
  resetPasswordApi: jest.fn()
}));

jest.mock('../../../utils/cookie', () => ({
  setCookie: jest.fn(),
  deleteCookie: jest.fn()
}));

const user: TUser = { email: 'examp@le.com', name: 'example' };
const updatedUser: TUser = { email: 'test@com.com', name: 'test' };

const getStore = () =>
  configureStore({
    reducer: rootReducer
  });

beforeEach(() => {
  jest.resetAllMocks();
  global.localStorage.clear();
});

describe('userSlice — getUser', () => {
  it('pending: loading=true, error=null, isAuthChecked=false', async () => {
    (getUserApi as jest.Mock).mockResolvedValueOnce({ user: user });

    const store = getStore();
    const result = store.dispatch(getUser());

    const state = store.getState().user;
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
    expect(state.isAuthChecked).toBe(false);

    await result;
  });

  it('fulfilled: user установлен, loading=false, isAuthChecked=true', async () => {
    (getUserApi as jest.Mock).mockResolvedValueOnce({ user: user });

    const store = getStore();
    await store.dispatch(getUser());

    const state = store.getState().user;
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.isAuthChecked).toBe(true);
    expect(state.user).toEqual(user);
  });

  it('rejected: user=null, error установлен, loading=false, isAuthChecked=true', async () => {
    (getUserApi as jest.Mock).mockRejectedValueOnce(
      new Error('Неизвестная ошибка')
    );

    const store = getStore();
    await store.dispatch(getUser());

    const state = store.getState().user;
    expect(state.loading).toBe(false);
    expect(state.user).toBeNull();
    expect(state.isAuthChecked).toBe(true);
    expect(state.error).toBe('Неизвестная ошибка');
  });
});

describe('userSlice — login', () => {
  it('pending: loading=true, error=null', async () => {
    (loginUserApi as jest.Mock).mockResolvedValueOnce({
      user: user,
      accessToken: 'Bearer at',
      refreshToken: 'rt'
    });

    const store = getStore();
    const result = store.dispatch(
      login({ email: user.email, password: 'badpass' })
    );

    const state = store.getState().user;
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();

    await result;
  });

  it('fulfilled: user, isAuthChecked=true; cookies/localStorage проставлены, loading=false', async () => {
    (loginUserApi as jest.Mock).mockResolvedValueOnce({
      user: user,
      accessToken: 'Bearer at',
      refreshToken: 'rt'
    });

    const store = getStore();
    await store.dispatch(login({ email: user.email, password: 'badpass' }));

    expect(setCookie).toHaveBeenCalledWith('accessToken', 'Bearer at');
    expect(localStorage.getItem('refreshToken')).toBe('rt');

    const state = store.getState().user;
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.isAuthChecked).toBe(true);
    expect(state.user).toEqual(user);
  });

  it('rejected: loading=false, error установлен', async () => {
    (loginUserApi as jest.Mock).mockRejectedValueOnce(
      new Error('Неизвестная ошибка')
    );

    const store = getStore();
    await store.dispatch(login({ email: user.email, password: 'badpass' }));

    const state = store.getState().user;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Неизвестная ошибка');
  });
});

describe('userSlice — register', () => {
  it('fulfilled: user установлен, isAuthChecked=true; cookies/localStorage проставлены', async () => {
    (registerUserApi as jest.Mock).mockResolvedValueOnce({
      user: user,
      accessToken: 'Bearer at',
      refreshToken: 'rt'
    });

    const store = getStore();
    await store.dispatch(
      register({ name: user.name, email: user.email, password: 'badpass' })
    );

    expect(setCookie).toHaveBeenCalledWith('accessToken', 'Bearer at');
    expect(localStorage.getItem('refreshToken')).toBe('rt');

    const state = store.getState().user;
    expect(state.user).toEqual(user);
    expect(state.isAuthChecked).toBe(true);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('rejected: error установлен, loading=false', async () => {
    (registerUserApi as jest.Mock).mockRejectedValueOnce(
      new Error('Неизвестная ошибка')
    );

    const store = getStore();
    await store.dispatch(
      register({ name: user.name, email: user.email, password: 'badpass' })
    );

    const state = store.getState().user;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Неизвестная ошибка');
  });
});

describe('userSlice — updateUser', () => {
  it('fulfilled: user обновлён, loading=false', async () => {
    (updateUserApi as jest.Mock).mockResolvedValueOnce({ user: updatedUser });

    const store = getStore();
    await store.dispatch(updateUser({ name: updatedUser.name }));

    const state = store.getState().user;
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.user).toEqual(updatedUser);
  });

  it('rejected: error установлен, loading=false', async () => {
    (updateUserApi as jest.Mock).mockRejectedValueOnce(
      new Error('Неизвестная ошибка')
    );

    const store = getStore();
    await store.dispatch(updateUser({ name: 'x' }));

    const state = store.getState().user;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Неизвестная ошибка');
  });
});

describe('userSlice — logout', () => {
  it('pending: loading=true', async () => {
    (logoutApi as jest.Mock).mockResolvedValueOnce({ success: true });

    const store = getStore();
    const result = store.dispatch(logout());

    expect(store.getState().user.loading).toBe(true);
    await result;
  });

  it('fulfilled: user=null, isAuthChecked=true; cookies/localStorage очищены', async () => {
    (logoutApi as jest.Mock).mockResolvedValueOnce({ success: true });

    const store = getStore();
    localStorage.setItem('refreshToken', 'rt');
    await store.dispatch(logout());

    expect(deleteCookie).toHaveBeenCalledWith('accessToken');
    expect(localStorage.getItem('refreshToken')).toBeNull();

    const state = store.getState().user;
    expect(state.user).toBeNull();
    expect(state.isAuthChecked).toBe(true);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('rejected: error установлен, loading=false', async () => {
    (logoutApi as jest.Mock).mockRejectedValueOnce(
      new Error('Неизвестная ошибка')
    );

    const store = getStore();
    await store.dispatch(logout());

    const s = store.getState().user;
    expect(s.loading).toBe(false);
    expect(s.error).toBe('Неизвестная ошибка');
  });
});

describe('userSlice — resetPassword (без изменения user)', () => {
  it('pending: loading=true (matcher)', async () => {
    (resetPasswordApi as jest.Mock).mockResolvedValueOnce({ success: true });

    const store = getStore();
    const result = store.dispatch(
      resetPassword({ password: 'badpass', token: 'token' })
    );

    expect(store.getState().user.loading).toBe(true);
    await result;
  });

  it('rejected: error установлен, loading=false', async () => {
    (resetPasswordApi as jest.Mock).mockRejectedValueOnce(
      new Error('Неизвестная ошибка')
    );

    const store = getStore();
    await store.dispatch(
      resetPassword({ password: 'badpass', token: 'token' })
    );

    const state = store.getState().user;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Неизвестная ошибка');
  });
});
