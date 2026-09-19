import ingredientsReducer, { fetchIngredients } from '../ingredientsSlice';
import { TIngredient } from '@utils-types';

describe('редьюсер слайса ingredients', () => {
  const initialState = {
    items: [],
    loading: false,
    error: null
  };

  const mockIngredients: TIngredient[] = [
    {
      _id: '643d69a5c3f7b9001cfa093c',
      name: 'Краторная булка N-200i',
      type: 'bun',
      proteins: 80,
      fat: 24,
      carbohydrates: 53,
      calories: 420,
      price: 1255,
      image: 'https://code.s3.yandex.net/react/code/bun-02.png',
      image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
      image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png'
    }
  ];

  test('должен вернуть начальное состояние при вызове с неизвестным экшеном', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN_ACTION' });
    expect(state).toEqual(initialState);
  });

  test('должен установить loading в true и сбросить error при экшене fetchIngredients.pending', () => {
    const previousState = { ...initialState, error: 'Предыдущая ошибка' };
    const state = ingredientsReducer(
      previousState,
      fetchIngredients.pending('requestId', undefined)
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  test('должен сохранить ингредиенты и сбросить loading при экшене fetchIngredients.fulfilled', () => {
    const previousState = { ...initialState, loading: true };
    const state = ingredientsReducer(
      previousState,
      fetchIngredients.fulfilled(mockIngredients, 'requestId', undefined)
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.items).toEqual(mockIngredients);
  });

  test('должен установить текст ошибки и сбросить loading при экшене fetchIngredients.rejected', () => {
    const previousState = { ...initialState, loading: true };
    const error = new Error('Не удалось загрузить ингредиенты');
    const state = ingredientsReducer(
      previousState,
      fetchIngredients.rejected(error, 'requestId', undefined)
    );
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Не удалось загрузить ингредиенты');
  });
});
