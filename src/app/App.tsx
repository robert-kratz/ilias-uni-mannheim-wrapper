// Assuming store.ts is in the src folder and not inside the app folder
import { createToast } from 'vercel-toast';
import AppRoutes from '../routes';
import Tutorial from './pages/Tutorial';
import { Suspense, useEffect, useReducer, useState } from 'react';
import TutorialDialog from '../components/dialogs/TutorialDialog';
import FirstSetupDialog from '../components/dialogs/FirstSetupDialog';

const App: React.FC = () => {
    const [firstStartUp, setFirstStartUp] = useState<boolean>(true);
    const [credentialsSaved, setCredentialsSaved] = useState<boolean>(false);

    const [currentDialogState, updateDialogState] = useReducer(
        (state: any, newState: any) => ({ ...state, ...newState }),
        {
            tutorialDialog: false,
            firstSetupDialog: false,
        }
    );

    const fetchApplicationState = async () => {
        if (window.api) {
            window.api.getApplicationState().then((state) => {
                console.log('Application state: ', state);

                setCredentialsSaved(state.credentialsSaved);

                let isFirstStart = state.isFirstStartUp;
                let hasDoneWizard = state.hasSetUpWizard;

                if (isFirstStart && !hasDoneWizard) {
                    updateDialogState({ tutorialDialog: true });
                    updateDialogState({ firstSetupDialog: false });
                }

                if (!isFirstStart && !hasDoneWizard) {
                    updateDialogState({ firstSetupDialog: true });
                    updateDialogState({ tutorialDialog: false });
                }
            });
        }
    };

    useEffect(() => {
        fetchApplicationState();

        const handleReload = (
            event: Electron.IpcRendererEvent,
            { message, type }: { message: string; type: 'success' | 'error' }
        ) => {
            console.log(`Received message: ${message} with type: ${type}`);
            // Process the message based on type
            //reload the app

            if (message && type) {
                createToast(message, {
                    type: type,
                    timeout: 3000,
                });
            }

            fetchApplicationState();
        };

        window.api.onReload(handleReload);

        return () => {
            // Assuming you expose a remove method as well
            window.api.removeReloadListener(handleReload);
        };
    }, []);

    //finaly sereve the app
    return (
        <>
            <TutorialDialog
                open={currentDialogState.tutorialDialog}
                onClose={() => updateDialogState({ tutorialDialog: false })}
            />
            <FirstSetupDialog
                open={currentDialogState.firstSetupDialog}
                onClose={() => updateDialogState({ firstSetupDialog: false })}
            />
            <Suspense fallback={<div>Loading...</div>}>
                <AppRoutes />
            </Suspense>
        </>
    );
};

export default App;
