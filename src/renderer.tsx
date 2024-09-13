import './styles/index.css';
import 'vercel-toast/css';

import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './app/App';
import store, { persistor } from './state/store';
import { PersistGate } from 'redux-persist/integration/react';

const ElectronApplication: React.FC = () => {
    return (
        <>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <App />
                </PersistGate>
            </Provider>
        </>
    );
};

const domNode = document.getElementById('root');
const root = createRoot(domNode);
root.render(<ElectronApplication />);
