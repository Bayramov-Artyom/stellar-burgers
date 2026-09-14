import { FC, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient, TOrder } from '@utils-types';
import { useDispatch, useSelector } from '../../services/store';
import { selectFeedOrders } from '@slices/feedSlice';
import { selectProfileOrders } from '@slices/profileOrdersSlice';
import {
  fetchOrderByNumber,
  selectOrderDetails
} from '@slices/orderDetailsSlice';
import { selectIngredients } from '@slices/ingredientsSlice';

export const OrderInfo: FC = () => {
  const dispatch = useDispatch();
  const { number } = useParams<{ number: string }>();
  const orderNumber = Number(number);

  const feedOrders = useSelector(selectFeedOrders);
  const profileOrders = useSelector(selectProfileOrders);
  const fetchedOrder = useSelector(selectOrderDetails);
  const ingredients = useSelector(selectIngredients);

  const orderFromStore = [...feedOrders, ...profileOrders].find(
    (item) => item.number === orderNumber
  );

  const orderData: TOrder | undefined =
    orderFromStore || fetchedOrder || undefined;

  useEffect(() => {
    if (!orderFromStore) {
      dispatch(fetchOrderByNumber(orderNumber));
    }
  }, [orderNumber, dispatch]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
