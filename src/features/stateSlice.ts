import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchDataResponseItem } from '../types/objects';

interface ApplicationState {
    currentHomePageIndex: number;
    currentSearchQuery: string;
    searchResults: SearchDataResponseItem[];
}

const initialState: ApplicationState = {
    currentHomePageIndex: 0,
    currentSearchQuery: '',
    searchResults: [],
};

const userSlice = createSlice({
    name: 'state',
    initialState,
    reducers: {
        setCurrentHomePageIndex(state, action: PayloadAction<{ currentHomePageIndex: number }>) {
            state.currentHomePageIndex = action.payload.currentHomePageIndex;
        },
        setCurrentSearchQuery(state, action: PayloadAction<{ currentSearchQuery: string }>) {
            state.currentSearchQuery = action.payload.currentSearchQuery;
        },
        setSearchResults(state, action: PayloadAction<{ searchResults: SearchDataResponseItem[] }>) {
            state.searchResults = action.payload.searchResults;
        },
    },
});

export const { setCurrentHomePageIndex, setCurrentSearchQuery, setSearchResults } = userSlice.actions;
export default userSlice.reducer;
