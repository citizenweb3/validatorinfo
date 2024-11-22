import { configureStore } from '@reduxjs/toolkit';

import { reducer } from './wallets/wallets.slice';

export const makeStore = () => {
  return configureStore({ reducer: { reducer } });
};

export type AppStore = ReturnType<typeof makeStore>;

export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
