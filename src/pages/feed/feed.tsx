import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import {
  connectFeedSocket,
  disconnectFeedSocket,
  getFeeds,
  selectFeedLoading,
  selectFeedOrders
} from '@slices/feedSlice';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectFeedOrders);
  const loading = useSelector(selectFeedLoading);

  useEffect(() => {
    dispatch(connectFeedSocket());
    return () => {
      dispatch(disconnectFeedSocket());
    };
  }, [dispatch]);

  const handleGetFeeds = () => {
    dispatch(getFeeds());
  };

  if (!orders.length && loading) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
