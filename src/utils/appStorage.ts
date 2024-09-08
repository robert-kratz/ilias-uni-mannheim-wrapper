import Store from 'electron-store';

type StoreType = {
    isFirstStartUp: boolean;
    username: string;
    credentialsSaved: boolean;
    sessionToken: string | null;
};

const store = new Store<StoreType>({
    defaults: {
        isFirstStartUp: true,
        username: '',
        credentialsSaved: false,
        sessionToken: null,
    },
});

const isFirstStartUp = store.get('isFirstStartUp');
const credentialsSaved = store.get('credentialsSaved');
const getSessionToken = store.get('sessionToken');

//reset to default values
const resetStore = () => {
    store.set('isFirstStartUp', true);
    store.set('credentialsSaved', false);
    store.set('sessionToken', null);
    store.set('username', '');
};

export { store, isFirstStartUp, credentialsSaved, getSessionToken, resetStore };
