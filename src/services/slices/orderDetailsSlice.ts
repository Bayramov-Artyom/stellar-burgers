import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getOrderByNumberApi } from '@api';
import { TOrder } from '@utils-types';
import type { RootState } from '../store';

type TOrderDetailsState = {
  order: TOrder | null;
  loading: boolean;
  error: string | null;
};

const initialState: TOrderDetailsState = {
  order: null,
  loading: false,
  error: null
};

export const fetchOrderByNumber = createAsyncThunk(
  'orderDetails/fetchOrderByNumber',
  async (number: number) => {
    const data = await getOrderByNumberApi(number);
    return data.orders[0];
  }
);

const orderDetailsSlice = createSlice({
  name: 'orderDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Заказ не найден';
      });
  }
});

export const selectOrderDetails = (state: RootState) =>
  state.orderDetails.order;
export const selectOrderDetailsLoading = (state: RootState) =>
  state.orderDetails.loading;

export default orderDetailsSlice.reducer;
