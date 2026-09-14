import { forwardRef, useMemo } from 'react';
import { TIngredientsCategoryProps } from './type';
import { TConstructorIngredient } from '@utils-types';
import { IngredientsCategoryUI } from '../ui/ingredients-category';
import { useSelector } from '../../services/store';
import { selectBurgerConstructor } from '@slices/burgerConstructorSlice';

export const IngredientsCategory = forwardRef<
  HTMLUListElement,
  TIngredientsCategoryProps
>(({ title, titleRef, ingredients }, ref) => {
  const burgerConstructor = useSelector(selectBurgerConstructor);

  const ingredientsCounters = useMemo(() => {
    const { bun, ingredients: constructorIngredients } = burgerConstructor;
    const counters: { [key: string]: number } = {};
    constructorIngredients.forEach((ingredient: TConstructorIngredient) => {
      if (!counters[ingredient._id]) counters[ingredient._id] = 0;
      counters[ingredient._id]++;
    });
    if (bun) counters[bun._id] = 2;
    return counters;
  }, [burgerConstructor]);

  return (
    <IngredientsCategoryUI
      title={title}
      titleRef={titleRef}
      ingredients={ingredients}
      ingredientsCounters={ingredientsCounters}
      ref={ref}
    />
  );
});
