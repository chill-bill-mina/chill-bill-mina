/* eslint-disable @typescript-eslint/no-explicit-any */
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "@/redux/store";

export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string | any;
}>();
