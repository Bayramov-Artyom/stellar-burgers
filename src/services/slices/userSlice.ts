import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  TLoginData,
  TRegisterData,
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  updateUserApi
} from '@api';
import { TUser } from '@utils-types';
import type { RootState } from '../store';
import { deleteCookie, setCookie } from '../../utils/cookie';

type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  isAuthenticated: boolean;
  loginRequest: boolean;
  loginError: string | null;
  registerRequest: boolean;
  registerError: string | null;
  updateUserRequest: boolean;
  updateUserError: string | null;
};

const initialState: TUserState = {
  user: null,
  isAuthChecked: false,
  isAuthenticated: false,
  loginRequest: false,
  loginError: null,
  registerRequest: false,
  registerError: null,
  updateUserRequest: false,
  updateUserError: null
};

const saveTokens = (accessToken: string, refreshToken: string) => {
  setCookie('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = () => {
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
};

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (data: TRegisterData) => {
    const response = await registerUserApi(data);
    saveTokens(response.accessToken, response.refreshToken);
    return response.user;
  }
);

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (data: TLoginData) => {
    const response = await loginUserApi(data);
    saveTokens(response.accessToken, response.refreshToken);
    return response.user;
  }
);

export const checkUserAuth = createAsyncThunk(
  'user/checkUserAuth',
  async () => {
    const response = await getUserApi();
    return response.user;
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (data: Partial<TRegisterData>) => {
    const response = await updateUserApi(data);
    return response.user;
  }
);

export const logoutUser = createAsyncThunk('user/logoutUser', async () => {
  await logoutApi();
  clearTokens();
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    authChecked: (state) => {
      state.isAuthChecked = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.registerRequest = true;
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerRequest = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerRequest = false;
        state.registerError =
          action.error.message ?? 'Не удалось зарегистрироваться';
      })
      .addCase(loginUser.pending, (state) => {
        state.loginRequest = true;
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginRequest = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginRequest = false;
        state.loginError = action.error.message ?? 'Не удалось войти';
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAuthChecked = true;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isAuthChecked = true;
      })
      .addCase(updateUser.pending, (state) => {
        state.updateUserRequest = true;
        state.updateUserError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.updateUserRequest = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateUserRequest = false;
        state.updateUserError =
          action.error.message ?? 'Не удалось обновить данные';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  }
});

export const { authChecked } = userSlice.actions;

export const selectUser = (state: RootState) => state.user.user;
export const selectIsAuthChecked = (state: RootState) =>
  state.user.isAuthChecked;
export const selectIsAuthenticated = (state: RootState) =>
  state.user.isAuthenticated;
export const selectLoginError = (state: RootState) => state.user.loginError;
export const selectRegisterError = (state: RootState) =>
  state.user.registerError;
export const selectUpdateUserError = (state: RootState) =>
  state.user.updateUserError;

export default userSlice.reducer;
