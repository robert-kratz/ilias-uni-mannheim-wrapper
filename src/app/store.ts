// src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';

import userReducer from '../features/userSlice';

const userPersistConfig = {
    key: 'user',
    storage: storage,
    whitelist: ['isUserLoggedIn', 'sessionId', 'lastAuth'], // Specify which parts of the state to persist
};

const rootReducer = combineReducers({
    user: persistReducer(userPersistConfig, userReducer),
    // other reducers can go here
});

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
