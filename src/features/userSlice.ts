import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    isUserLoggedIn: boolean;
    sessionId: string | null;
    lastAuth: Date | null;
}

const initialState: UserState = {
    isUserLoggedIn: false,
    sessionId: null,
    lastAuth: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setLoginState(state, action: PayloadAction<{ isLoggedIn: boolean; sessionId: string }>) {
            state.isUserLoggedIn = action.payload.isLoggedIn;
            state.sessionId = action.payload.isLoggedIn ? action.payload.sessionId : null;

            console.log('User is logged in: ', state);
        },
        updateLastAuth(state, action: PayloadAction<Date>) {
            state.lastAuth = action.payload;
        },
        logout(state) {
            state.isUserLoggedIn = false;
            state.sessionId = null;
            state.lastAuth = null;
        },
        signIn(state) {
            state.isUserLoggedIn = true;
        },
    },
});

export const { setLoginState, updateLastAuth, logout, signIn } = userSlice.actions;
export default userSlice.reducer;
