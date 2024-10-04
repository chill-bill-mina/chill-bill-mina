import { SessionType } from "@/types/session";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { deletePublicKeyCookie, setPublicKeyCookie } from "./thunk";

const initialState: SessionType = {
  publicKeyBase58: null,
};

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<SessionType>) => {
      state.publicKeyBase58 = action.payload.publicKeyBase58;
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
      });
  },
});

// Action creators are generated for each case reducer function
export const { setSession } = sessionSlice.actions;

export default sessionSlice.reducer;
