import Store from 'electron-store';

type StoreType = {
    isFirstStartUp: boolean;
    username: string;
    userId: string;
    credentialsSaved: boolean;
    hasSetUpWizard: boolean;
    sessionToken: string | null;
    aviablableYears: string[];
    selectedYears: string[];
};

const store = new Store<StoreType>({
    defaults: {
        isFirstStartUp: true,
        username: '',
        userId: '',
        credentialsSaved: false,
        hasSetUpWizard: false,
        sessionToken: null,
        aviablableYears: [],
        selectedYears: [],
    },
});

const isFirstStartUp = store.get('isFirstStartUp');
const credentialsSaved = store.get('credentialsSaved');
const getSessionToken = store.get('sessionToken');
const getUsername = store.get('username');
const getUserId = store.get('userId');
const getAvailabeYears = store.get('aviablableYears');
const getSelectedYears = store.get('selectedYears');

//reset to default values
const resetStore = () => {
    store.set('isFirstStartUp', true);
    store.set('credentialsSaved', false);
    store.set('sessionToken', null);
    store.set('username', '');
    store.set('userId', '');
    store.set('aviablableYears', []);
    store.set('selectedYears', []);
    store.set('hasSetUpWizard', false);
};

export { store, isFirstStartUp, credentialsSaved, getSessionToken, resetStore };
