import { ProfileOrdersUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import {
  connectProfileOrdersSocket,
  disconnectProfileOrdersSocket,
  fetchUserOrders,
  selectProfileOrders
} from '@slices/profileOrdersSlice';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectProfileOrders);

  useEffect(() => {
    dispatch(fetchUserOrders());
    dispatch(connectProfileOrdersSocket());
    return () => {
      dispatch(disconnectProfileOrdersSocket());
    };
  }, [dispatch]);

  return <ProfileOrdersUI orders={orders} />;
};
