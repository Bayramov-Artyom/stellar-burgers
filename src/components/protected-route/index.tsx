import { FC, ReactElement } from 'react';
import { Navigate, useLocation, Location } from 'react-router-dom';

import { Preloader } from '@ui';
import { useSelector } from '../../services/store';
import { selectIsAuthChecked, selectIsAuthenticated } from '@slices/userSlice';

type TProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: ReactElement;
};

export const ProtectedRoute: FC<TProtectedRouteProps> = ({
  onlyUnAuth = false,
  children
}) => {
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (!onlyUnAuth && !isAuthenticated) {
    return <Navigate replace to='/login' state={{ from: location }} />;
  }

  if (onlyUnAuth && isAuthenticated) {
    const from = (location.state as { from?: Location })?.from;
    return <Navigate replace to={from?.pathname || '/'} />;
  }

  return children;
};
