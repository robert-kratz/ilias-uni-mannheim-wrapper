import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OpenDirectoryResponse, EntityDataResponseItem } from '../types/objects';

type ThemeMode = 'light' | 'dark' | 'system';

interface ApplicationState {
    currentHomePageIndex: number;
    currentSearchQuery: string;
    currentTutorialDialogPage: number;
    currentFirstSetupWizardPage: number;
    loadingIndicatorTextShown: boolean;
    selectedSearchFilter: 'files' | 'directories' | 'courses' | 'none';
    searchResults: EntityDataResponseItem[];
    showCurrentDirectory: OpenDirectoryResponse | null;
    themeMode: ThemeMode;
}

const initialState: ApplicationState = {
    currentHomePageIndex: 0,
    currentFirstSetupWizardPage: 0,
    currentTutorialDialogPage: 0,
    loadingIndicatorTextShown: true,
    selectedSearchFilter: 'none',
    currentSearchQuery: '',
    searchResults: [],
    showCurrentDirectory: null,
    themeMode: 'system',
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
        setSearchResults(state, action: PayloadAction<{ searchResults: EntityDataResponseItem[] }>) {
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
        setShowCurrentDirectory(state, action: PayloadAction<{ showCurrentDirectory: OpenDirectoryResponse | null }>) {
            state.showCurrentDirectory = action.payload.showCurrentDirectory;
        },
        setSelectedSearchFilter(
            state,
            action: PayloadAction<{ selectedSearchFilter: 'files' | 'directories' | 'courses' | 'none' }>
        ) {
            state.selectedSearchFilter = action.payload.selectedSearchFilter;
        },
        setThemeMode(state, action: PayloadAction<{ themeMode: ThemeMode }>) {
            state.themeMode = action.payload.themeMode;
        },
    },
});

export const {
    setCurrentHomePageIndex,
    setCurrentSearchQuery,
    setSearchResults,
    setSelectedSearchFilter,
    setCurrentFirstSetupWizardPage,
    setCurrentTutorialDialogPage,
    setLoadingIndicatorTextShown,
    setShowCurrentDirectory,
    setThemeMode,
} = userSlice.actions;
export default userSlice.reducer;
