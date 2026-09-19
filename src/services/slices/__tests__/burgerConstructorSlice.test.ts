import burgerConstructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredientUp,
  moveIngredientDown,
  clearConstructor
} from '../burgerConstructorSlice';
import { TConstructorIngredient, TIngredient } from '@utils-types';

describe('редьюсер слайса burgerConstructor', () => {
  const initialState = {
    bun: null,
    ingredients: []
  };

  const mockBun: TIngredient = {
    _id: 'bun-1',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'bun.png',
    image_mobile: 'bun_mobile.png',
    image_large: 'bun_large.png'
  };

  const mockMain: TIngredient = {
    _id: 'main-1',
    name: 'Биокотлета из марсианской Магнолии',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'main.png',
    image_mobile: 'main_mobile.png',
    image_large: 'main_large.png'
  };

  const mockSauce: TIngredient = {
    _id: 'sauce-1',
    name: 'Соус Spicy-X',
    type: 'sauce',
    proteins: 30,
    fat: 20,
    carbohydrates: 40,
    calories: 30,
    price: 90,
    image: 'sauce.png',
    image_mobile: 'sauce_mobile.png',
    image_large: 'sauce_large.png'
  };

  test('должен вернуть начальное состояние при вызове с неизвестным экшеном', () => {
    const state = burgerConstructorReducer(undefined, {
      type: 'UNKNOWN_ACTION'
    });
    expect(state).toEqual(initialState);
  });

  test('должен добавить булку в поле bun при экшене addIngredient с ингредиентом типа bun', () => {
    const state = burgerConstructorReducer(
      initialState,
      addIngredient(mockBun)
    );
    expect(state.bun).not.toBeNull();
    expect(state.bun?._id).toBe(mockBun._id);
    expect(state.bun?.name).toBe(mockBun.name);
    expect(typeof state.bun?.id).toBe('string');
    expect(state.bun?.id.length).toBeGreaterThan(0);
    expect(state.ingredients).toHaveLength(0);
  });

  test('должен заменить предыдущую булку новой при повторном экшене addIngredient с типом bun', () => {
    const stateWithBun = burgerConstructorReducer(
      initialState,
      addIngredient(mockBun)
    );
    const secondBun: TIngredient = {
      ...mockBun,
      _id: 'bun-2',
      name: 'Флюоресцентная булка R2-D3'
    };
    const state = burgerConstructorReducer(
      stateWithBun,
      addIngredient(secondBun)
    );
    expect(state.bun?._id).toBe('bun-2');
  });

  test('должен добавить начинку в массив ingredients при экшене addIngredient с ингредиентом типа main', () => {
    const state = burgerConstructorReducer(
      initialState,
      addIngredient(mockMain)
    );
    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0]._id).toBe(mockMain._id);
    expect(typeof state.ingredients[0].id).toBe('string');
  });

  test('должен добавлять несколько ингредиентов подряд в массив ingredients', () => {
    let state = burgerConstructorReducer(initialState, addIngredient(mockMain));
    state = burgerConstructorReducer(state, addIngredient(mockSauce));
    expect(state.ingredients).toHaveLength(2);
    expect(state.ingredients[0]._id).toBe(mockMain._id);
    expect(state.ingredients[1]._id).toBe(mockSauce._id);
  });

  test('должен удалить ингредиент по id при экшене removeIngredient', () => {
    const afterAdd = burgerConstructorReducer(
      initialState,
      addIngredient(mockMain)
    );
    const addedId = afterAdd.ingredients[0].id;
    const state = burgerConstructorReducer(afterAdd, removeIngredient(addedId));
    expect(state.ingredients).toHaveLength(0);
  });

  test('не должен ничего менять при экшене removeIngredient с несуществующим id', () => {
    const afterAdd = burgerConstructorReducer(
      initialState,
      addIngredient(mockMain)
    );
    const state = burgerConstructorReducer(
      afterAdd,
      removeIngredient('not-existing-id')
    );
    expect(state.ingredients).toHaveLength(1);
  });

  test('должен поменять местами соседние ингредиенты при экшене moveIngredientUp', () => {
    let state = burgerConstructorReducer(initialState, addIngredient(mockMain));
    state = burgerConstructorReducer(state, addIngredient(mockSauce));
    const [firstId, secondId] = state.ingredients.map(
      (item: TConstructorIngredient) => item._id
    );
    state = burgerConstructorReducer(state, moveIngredientUp(1));
    expect(
      state.ingredients.map((item: TConstructorIngredient) => item._id)
    ).toEqual([secondId, firstId]);
  });

  test('не должен менять порядок при экшене moveIngredientUp с индексом 0', () => {
    let state = burgerConstructorReducer(initialState, addIngredient(mockMain));
    state = burgerConstructorReducer(state, addIngredient(mockSauce));
    const idsBefore = state.ingredients.map(
      (item: TConstructorIngredient) => item._id
    );
    state = burgerConstructorReducer(state, moveIngredientUp(0));
    const idsAfter = state.ingredients.map(
      (item: TConstructorIngredient) => item._id
    );
    expect(idsAfter).toEqual(idsBefore);
  });

  test('должен поменять местами соседние ингредиенты при экшене moveIngredientDown', () => {
    let state = burgerConstructorReducer(initialState, addIngredient(mockMain));
    state = burgerConstructorReducer(state, addIngredient(mockSauce));
    const [firstId, secondId] = state.ingredients.map(
      (item: TConstructorIngredient) => item._id
    );
    state = burgerConstructorReducer(state, moveIngredientDown(0));
    expect(
      state.ingredients.map((item: TConstructorIngredient) => item._id)
    ).toEqual([secondId, firstId]);
  });

  test('не должен менять порядок при экшене moveIngredientDown с последним индексом', () => {
    let state = burgerConstructorReducer(initialState, addIngredient(mockMain));
    state = burgerConstructorReducer(state, addIngredient(mockSauce));
    const idsBefore = state.ingredients.map(
      (item: TConstructorIngredient) => item._id
    );
    state = burgerConstructorReducer(state, moveIngredientDown(1));
    const idsAfter = state.ingredients.map(
      (item: TConstructorIngredient) => item._id
    );
    expect(idsAfter).toEqual(idsBefore);
  });

  test('должен полностью очищать состояние конструктора при экшене clearConstructor', () => {
    let state = burgerConstructorReducer(initialState, addIngredient(mockBun));
    state = burgerConstructorReducer(state, addIngredient(mockMain));
    state = burgerConstructorReducer(state, clearConstructor());
    expect(state).toEqual(initialState);
  });
});
