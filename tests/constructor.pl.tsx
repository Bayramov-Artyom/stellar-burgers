import { test, expect, Page } from '@playwright/test';

const BUN_NAME = 'Краторная булка N-200i';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';
const SAUCE_NAME = 'Соус Spicy-X';
// Углеводы соуса Spicy-X = 40. Это значение УНИКАЛЬНО в модальном окне.
// (Калории = 30 и Белки = 30 дублируются, из-за чего Playwright strict mode
// падал с ошибкой "resolved to 2 elements")
const SAUCE_CARBS = '40';
const ORDER_NUMBER = '12345';

const getIngredientsSection = (page: Page) => page.locator('section').first();
const getConstructorSection = (page: Page) => page.locator('section').last();

test.describe('Добавление ингредиента в конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('tests/hars/ingredients.har', {
      url: '**/api/**',
      notFound: 'fallback'
    });
    await page.goto('/');
    await expect(page.getByText(BUN_NAME)).toBeVisible();
  });

  test('до добавления ингредиентов конструктор показывает пустые плейсхолдеры', async ({
    page
  }) => {
    const constructorSection = getConstructorSection(page);
    await expect(constructorSection.getByText('Выберите булки')).toHaveCount(
      2
    );
    await expect(
      constructorSection.getByText('Выберите начинку')
    ).toBeVisible();
  });

  test('клик по кнопке «Добавить» на булке добавляет её в верх и низ конструктора', async ({
    page
  }) => {
    const ingredientsSection = getIngredientsSection(page);
    const constructorSection = getConstructorSection(page);

    await ingredientsSection
      .locator('li', { hasText: BUN_NAME })
      .getByRole('button', { name: 'Добавить' })
      .click();

    await expect(constructorSection.getByText(BUN_NAME)).toHaveCount(2);
    await expect(
      constructorSection.getByText('Выберите булки')
    ).toHaveCount(0);
  });

  test('клик по кнопке «Добавить» на начинке добавляет её в список конструктора', async ({
    page
  }) => {
    const ingredientsSection = getIngredientsSection(page);
    const constructorSection = getConstructorSection(page);

    await ingredientsSection
      .locator('li', { hasText: MAIN_NAME })
      .getByRole('button', { name: 'Добавить' })
      .click();

    await expect(constructorSection.getByText(MAIN_NAME)).toBeVisible();
    await expect(
      constructorSection.getByText('Выберите начинку')
    ).toHaveCount(0);
  });

  test('можно добавить несколько разных ингредиентов подряд', async ({
    page
  }) => {
    const ingredientsSection = getIngredientsSection(page);
    const constructorSection = getConstructorSection(page);

    await ingredientsSection
      .locator('li', { hasText: BUN_NAME })
      .getByRole('button', { name: 'Добавить' })
      .click();
    await ingredientsSection
      .locator('li', { hasText: MAIN_NAME })
      .getByRole('button', { name: 'Добавить' })
      .click();
    await ingredientsSection
      .locator('li', { hasText: SAUCE_NAME })
      .getByRole('button', { name: 'Добавить' })
      .click();

    await expect(constructorSection.getByText(BUN_NAME)).toHaveCount(2);
    await expect(constructorSection.getByText(MAIN_NAME)).toBeVisible();
    await expect(constructorSection.getByText(SAUCE_NAME)).toBeVisible();
  });
});

test.describe('Модальное окно с описанием ингредиента', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR('tests/hars/ingredients.har', {
      url: '**/api/**',
      notFound: 'fallback'
    });
    await page.goto('/');
    await expect(page.getByText(BUN_NAME)).toBeVisible();
  });

  test('клик по ингредиенту открывает модальное окно с его описанием', async ({
    page
  }) => {
    const ingredientsSection = getIngredientsSection(page);
    const modal = page.locator('#modals');

    await ingredientsSection
      .locator('li', { hasText: BUN_NAME })
      .getByText(BUN_NAME)
      .click();

    await expect(modal.getByText(BUN_NAME)).toBeVisible();
    await expect(modal.getByText('Калории, ккал')).toBeVisible();
  });

  test('в модальном окне отображаются данные именно того ингредиента, по которому кликнули', async ({
    page
  }) => {
    const ingredientsSection = getIngredientsSection(page);
    const modal = page.locator('#modals');

    await ingredientsSection
      .locator('li', { hasText: SAUCE_NAME })
      .getByText(SAUCE_NAME)
      .click();

    await expect(modal.getByText(SAUCE_NAME)).toBeVisible();
    await expect(
      modal.getByText(SAUCE_CARBS, { exact: true })
    ).toBeVisible();
    await expect(modal.getByText(BUN_NAME)).toHaveCount(0);
  });

  test('модальное окно закрывается по клику на крестик', async ({ page }) => {
    const ingredientsSection = getIngredientsSection(page);
    const modal = page.locator('#modals');

    await ingredientsSection
      .locator('li', { hasText: BUN_NAME })
      .getByText(BUN_NAME)
      .click();
    await expect(modal.getByText(BUN_NAME)).toBeVisible();

    await modal.locator('button').click();

    await expect(modal).toBeEmpty();
  });

  test('модальное окно закрывается по клику на оверлей', async ({ page }) => {
    const ingredientsSection = getIngredientsSection(page);
    const modal = page.locator('#modals');

    await ingredientsSection
      .locator('li', { hasText: BUN_NAME })
      .getByText(BUN_NAME)
      .click();
    await expect(modal.getByText(BUN_NAME)).toBeVisible();

    await modal
      .locator('> div')
      .nth(1)
      .click({ position: { x: 10, y: 10 } });

    await expect(modal).toBeEmpty();
  });
});

test.describe('Создание заказа', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer%20fake-access-token',
        url: 'http://localhost:4000'
      }
    ]);
    await page.addInitScript(() => {
      window.localStorage.setItem('refreshToken', 'fake-refresh-token');
    });

    await page.routeFromHAR('tests/hars/order.har', {
      url: '**/api/**',
      notFound: 'fallback'
    });

    await page.goto('/');
    await expect(page.getByText(BUN_NAME)).toBeVisible();
    // ждём, пока авторизация по фейковым токенам подтянет имя пользователя в шапку —
    // это гарантирует, что isAuthenticated уже true и клик по «Оформить заказ» не уйдёт на /login
    await expect(page.getByText('Test User')).toBeVisible();
  });

  test('сборка бургера и оформление заказа: модальное окно с верным номером, очистка конструктора', async ({
    page
  }) => {
    const ingredientsSection = getIngredientsSection(page);
    const constructorSection = getConstructorSection(page);
    const modal = page.locator('#modals');

    await ingredientsSection
      .locator('li', { hasText: BUN_NAME })
      .getByRole('button', { name: 'Добавить' })
      .click();
    await ingredientsSection
      .locator('li', { hasText: MAIN_NAME })
      .getByRole('button', { name: 'Добавить' })
      .click();

    await expect(constructorSection.getByText(BUN_NAME)).toHaveCount(2);
    await expect(constructorSection.getByText(MAIN_NAME)).toBeVisible();

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    await expect(modal.getByText(ORDER_NUMBER, { exact: true })).toBeVisible();

    await modal.locator('button').click();
    await expect(modal).toBeEmpty();

    await expect(constructorSection.getByText('Выберите булки')).toHaveCount(
      2
    );
    await expect(
      constructorSection.getByText('Выберите начинку')
    ).toBeVisible();
  });
});