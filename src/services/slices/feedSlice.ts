import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getFeedsApi } from '@api';
import { TOrder } from '@utils-types';
import type { AppDispatch, RootState } from '../store';
import { WS_URL } from '../../utils/wsUrl';

type TFeedWsMessage = {
  success: boolean;
  orders: TOrder[];
  total: number;
  totalToday: number;
};

type TFeedState = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
};

const initialState: TFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  loading: false,
  error: null,
  wsConnected: false
};

export const getFeeds = createAsyncThunk('feed/getFeeds', async () =>
  getFeedsApi()
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    feedWsConnecting: (state) => {
      state.loading = true;
      state.error = null;
    },
    feedWsOpen: (state) => {
      state.wsConnected = true;
      state.loading = false;
    },
    feedWsClose: (state) => {
      state.wsConnected = false;
    },
    feedWsError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    feedWsMessage: (state, action: PayloadAction<TFeedWsMessage>) => {
      state.orders = action.payload.orders;
      state.total = action.payload.total;
      state.totalToday = action.payload.totalToday;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFeeds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeeds.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(getFeeds.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? 'Не удалось загрузить ленту заказов';
      });
  }
});

export const {
  feedWsConnecting,
  feedWsOpen,
  feedWsClose,
  feedWsError,
  feedWsMessage
} = feedSlice.actions;

let feedSocket: WebSocket | null = null;

export const connectFeedSocket = () => (dispatch: AppDispatch) => {
  if (feedSocket) return;

  dispatch(feedWsConnecting());
  feedSocket = new WebSocket(`${WS_URL}/orders/all`);

  feedSocket.onopen = () => dispatch(feedWsOpen());

  feedSocket.onerror = () =>
    dispatch(feedWsError('Ошибка соединения с лентой заказов'));

  feedSocket.onclose = () => {
    dispatch(feedWsClose());
    feedSocket = null;
  };

  feedSocket.onmessage = (event) => {
    const data = JSON.parse(event.data) as TFeedWsMessage;
    if (data.success) {
      dispatch(feedWsMessage(data));
    }
  };
};

export const disconnectFeedSocket = () => () => {
  feedSocket?.close();
  feedSocket = null;
};

export const selectFeedOrders = (state: RootState) => state.feed.orders;
export const selectFeedTotal = (state: RootState) => state.feed.total;
export const selectFeedTotalToday = (state: RootState) => state.feed.totalToday;
export const selectFeedLoading = (state: RootState) => state.feed.loading;

export default feedSlice.reducer;
