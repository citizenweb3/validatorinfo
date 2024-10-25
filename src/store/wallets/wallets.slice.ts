import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const walletsSlice = createSlice({
  name: "wallets",
  initialState: {
    address: "",
    providerName: "",
    name: "",
    chainId: "",
  },
  reducers: {
    connectWallet: (
      state,
      action: PayloadAction<{
        chainId: string;
        address: string;
        providerName: string;
        name: string;
      }>
    ) => {
      state.address = action.payload.address;
      state.name = action.payload.name;
      state.providerName = action.payload.providerName;
      state.chainId = action.payload.chainId;
    },
  },
});

export const { actions, reducer } = walletsSlice;