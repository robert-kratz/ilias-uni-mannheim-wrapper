import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchDataResponseItem } from '../types/objects';

interface ApplicationState {
    currentHomePageIndex: number;
    currentSearchQuery: string;
    currentTutorialDialogPage: number;
    currentFirstSetupWizardPage: number;
    loadingIndicatorTextShown: boolean;
    searchResults: SearchDataResponseItem[];
}

const initialState: ApplicationState = {
    currentHomePageIndex: 0,
    currentFirstSetupWizardPage: 0,
    currentTutorialDialogPage: 0,
    loadingIndicatorTextShown: true,
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
        setCurrentFirstSetupWizardPage(state, action: PayloadAction<{ currentFirstSetupWizardPage: number }>) {
            state.currentFirstSetupWizardPage = action.payload.currentFirstSetupWizardPage;
        },
        setCurrentTutorialDialogPage(state, action: PayloadAction<{ currentTutorialDialogPage: number }>) {
            state.currentTutorialDialogPage = action.payload.currentTutorialDialogPage;
        },
        setLoadingIndicatorTextShown(state, action: PayloadAction<{ loadingIndicatorTextShown: boolean }>) {
            state.loadingIndicatorTextShown = action.payload.loadingIndicatorTextShown;
        },
    },
});

export const {
    setCurrentHomePageIndex,
    setCurrentSearchQuery,
    setSearchResults,
    setCurrentFirstSetupWizardPage,
    setCurrentTutorialDialogPage,
    setLoadingIndicatorTextShown,
} = userSlice.actions;
export default userSlice.reducer;
