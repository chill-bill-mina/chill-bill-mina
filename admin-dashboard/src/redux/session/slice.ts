import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  deletePublicKeyCookie,
  deletePublicKeyToken,
  setPublicKeyCookie,
  setTokenCookie,
} from "./thunk";
import { SessionType } from "@/types/session";

const initialState: SessionType = {
  publicKeyBase58: null,
  token: null,
};

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<string>) => {
      state.publicKeyBase58 = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setPublicKeyCookie.fulfilled, (state, action) => {
        state.publicKeyBase58 = action.payload
          ? action.payload.publicKeyBase58
          : null;
      })
      .addCase(deletePublicKeyCookie.fulfilled, (state) => {
        state.publicKeyBase58 = null;
      })
      .addCase(deletePublicKeyToken.fulfilled, (state) => {
        state.token = null;
      })
      .addCase(setTokenCookie.fulfilled, (state, action) => {
        state.token = action.payload ? action.payload.token : null;
      });
  },
});

// Action creators are generated for each case reducer function
export const { setSession, setToken } = sessionSlice.actions;

export default sessionSlice.reducer;
