import Store from 'electron-store';

type StoreType = {
    isFirstStartUp: boolean;
    username: string;
    userId: string;
    credentialsSaved: boolean;
    sessionToken: string | null;
};

const store = new Store<StoreType>({
    defaults: {
        isFirstStartUp: true,
        username: '',
        userId: '',
        credentialsSaved: false,
        sessionToken: null,
    },
});

const isFirstStartUp = store.get('isFirstStartUp');
const credentialsSaved = store.get('credentialsSaved');
const getSessionToken = store.get('sessionToken');
const getUsername = store.get('username');
const getUserId = store.get('userId');

//reset to default values
const resetStore = () => {
    store.set('isFirstStartUp', true);
    store.set('credentialsSaved', false);
    store.set('sessionToken', null);
    store.set('username', '');
    store.set('userId', '');
};

export { store, isFirstStartUp, credentialsSaved, getSessionToken, resetStore };
