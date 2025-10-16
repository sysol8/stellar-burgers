import { describe, expect, it } from '@jest/globals';
import { getStore, rootReducer } from './store';
import { ingredientsReducer } from '@slices';
import { userReducer } from '@slices';
import { burgerConstructorReducer } from '@slices';
import { feedReducer } from '@slices';
import { orderReducer } from '@slices';

describe('rootReducer', () => {
  it('корректно инициализируется', () => {
    const state = rootReducer(undefined, { type: '@@INIT' });

    expect(Object.keys(state).sort()).toEqual(
      ['ingredients', 'user', 'burgerConstructor', 'feed', 'order'].sort()
    );

    expect(state).toHaveProperty('ingredients');
    expect(state).toHaveProperty('user');
    expect(state).toHaveProperty('burgerConstructor');
    expect(state).toHaveProperty('feed');
    expect(state).toHaveProperty('order');
  });

  it('инстанс хранилища из функции getStore эквивалентен "обычному" стору', () => {
    const store = getStore();
    const storeFromReducer = rootReducer(undefined, { type: '@@INIT' });
    expect(store.getState()).toEqual(storeFromReducer);
  });

  it('игнорирует неизвестные экшены', () => {
    const prev = rootReducer(undefined, { type: '@@INIT' });
    const next = rootReducer(prev, { type: 'UNKNOWN_ACTION' });
    expect(Object.keys(next)).toEqual(Object.keys(prev));
  });
});
