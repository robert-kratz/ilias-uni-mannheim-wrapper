// src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';

import userReducer from './stateSlice';

const userPersistConfig = {
    key: 'state',
    storage: storage,
    whitelist: [
        'currentHomePageIndex',
        'currentTutorialDialogPage',
        'showCurrentDirectory',
        'currentFirstSetupWizardPage',
        'searchResults',
    ],
};

const rootReducer = combineReducers({
    app: persistReducer(userPersistConfig, userReducer),
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
