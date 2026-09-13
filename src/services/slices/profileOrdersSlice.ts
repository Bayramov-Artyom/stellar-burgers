import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getOrdersApi } from '@api';
import { TOrder } from '@utils-types';
import type { AppDispatch, RootState } from '../store';
import { getCookie } from '../../utils/cookie';
import { WS_URL } from '../../utils/wsUrl';

type TProfileOrdersWsMessage = {
  success: boolean;
  orders: TOrder[];
};

type TProfileOrdersState = {
  orders: TOrder[];
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
};

const initialState: TProfileOrdersState = {
  orders: [],
  loading: false,
  error: null,
  wsConnected: false
};

export const fetchUserOrders = createAsyncThunk(
  'profileOrders/fetchUserOrders',
  async () => getOrdersApi()
);

const profileOrdersSlice = createSlice({
  name: 'profileOrders',
  initialState,
  reducers: {
    profileOrdersWsConnecting: (state) => {
      state.loading = true;
      state.error = null;
    },
    profileOrdersWsOpen: (state) => {
      state.wsConnected = true;
      state.loading = false;
    },
    profileOrdersWsClose: (state) => {
      state.wsConnected = false;
    },
    profileOrdersWsError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    profileOrdersWsMessage: (
      state,
      action: PayloadAction<TProfileOrdersWsMessage>
    ) => {
      state.orders = action.payload.orders;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? 'Не удалось загрузить историю заказов';
      });
  }
});

export const {
  profileOrdersWsConnecting,
  profileOrdersWsOpen,
  profileOrdersWsClose,
  profileOrdersWsError,
  profileOrdersWsMessage
} = profileOrdersSlice.actions;

let profileOrdersSocket: WebSocket | null = null;

export const connectProfileOrdersSocket = () => (dispatch: AppDispatch) => {
  if (profileOrdersSocket) return;

  const accessToken = getCookie('accessToken');
  if (!accessToken) return;

  dispatch(profileOrdersWsConnecting());
  const token = accessToken.replace('Bearer ', '');
  profileOrdersSocket = new WebSocket(`${WS_URL}/orders?token=${token}`);

  profileOrdersSocket.onopen = () => dispatch(profileOrdersWsOpen());

  profileOrdersSocket.onerror = () =>
    dispatch(profileOrdersWsError('Ошибка соединения с историей заказов'));

  profileOrdersSocket.onclose = () => {
    dispatch(profileOrdersWsClose());
    profileOrdersSocket = null;
  };

  profileOrdersSocket.onmessage = (event) => {
    const data = JSON.parse(event.data) as TProfileOrdersWsMessage;
    if (data.success) {
      dispatch(profileOrdersWsMessage(data));
    }
  };
};

export const disconnectProfileOrdersSocket = () => () => {
  profileOrdersSocket?.close();
  profileOrdersSocket = null;
};

export const selectProfileOrders = (state: RootState) =>
  state.profileOrders.orders;
export const selectProfileOrdersLoading = (state: RootState) =>
  state.profileOrders.loading;

export default profileOrdersSlice.reducer;
