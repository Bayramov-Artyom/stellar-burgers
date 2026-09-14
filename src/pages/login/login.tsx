import { FC, SyntheticEvent, useState } from 'react';
import { useLocation, useNavigate, Location } from 'react-router-dom';
import { LoginUI } from '@ui-pages';
import { useDispatch, useSelector } from '../../services/store';
import { loginUser, selectLoginError } from '@slices/userSlice';

export const Login: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const errorText = useSelector(selectLoginError) || undefined;

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => {
        const from = (location.state as { from?: Location })?.from;
        navigate(from?.pathname || '/', { replace: true });
      })
      .catch(() => {});
  };

  return (
    <LoginUI
      errorText={errorText}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
