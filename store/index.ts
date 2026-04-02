import { configureStore } from "@reduxjs/toolkit";

import loadingReducer from "./slices/loading/loading-slice";
import clientsReducer from "./slices/clients/clients-slice";

export const store = configureStore({
    reducer: {
        loading: loadingReducer,
        clients: clientsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
