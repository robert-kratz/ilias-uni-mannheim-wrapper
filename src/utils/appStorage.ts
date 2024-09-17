import Store from 'electron-store';
import { EntityDataResponseItem } from '../types/objects';

export type StoreType = {
    isFirstStartUp: boolean;
    username: string;
    userId: string;
    credentialsSaved: boolean;
    hasSetUpWizard: boolean;
    aviablableYears: string[];
    selectedYears: string[];
    searchResults: EntityDataResponseItem[];
};

const store = new Store<StoreType>({
    defaults: {
        isFirstStartUp: true,
        username: '',
        userId: '',
        credentialsSaved: false,
        hasSetUpWizard: false,
        aviablableYears: [],
        selectedYears: [],
        searchResults: [],
    },
});

const getApplicationState = async () => {
    return store.store;
};

//reset to default values
const resetStore = () => {
    store.set('isFirstStartUp', true);
    store.set('credentialsSaved', false);
    store.set('username', '');
    store.set('userId', '');
    store.set('aviablableYears', []);
    store.set('selectedYears', []);
    store.set('hasSetUpWizard', false);
    store.set('searchResults', []);
};

export { store, resetStore, getApplicationState };
