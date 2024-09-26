// Assuming store.ts is in the src folder and not inside the app folder
import { createToast } from 'vercel-toast';
import AppRoutes from '../routes';
import { Suspense, useEffect, useReducer, useState } from 'react';
import TutorialDialog from '../components/dialogs/TutorialDialog';
import FirstSetupDialog from '../components/dialogs/FirstSetupDialog';
import usePageRefresh from '../hooks/usePageRefresh';
import useApplicationState from '../hooks/useApplicationState';
import useApplicationTheme from '../hooks/useApplicationTheme';
import useToastPipeline from '../hooks/useToastPipeline';

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

    useApplicationTheme(); //Apply the theme on component mount

    useToastPipeline(); //Listen for toast messages

    const loadComponent = async () => {
        const appState = await useApplicationState();

        setCredentialsSaved(appState.credentialsSaved);

        let isFirstStart = appState.isFirstStartUp;
        let hasDoneWizard = appState.hasSetUpWizard;

        if (isFirstStart && !hasDoneWizard) {
            updateDialogState({ tutorialDialog: true });
            updateDialogState({ firstSetupDialog: false });
        }

        if (!isFirstStart && !hasDoneWizard) {
            updateDialogState({ firstSetupDialog: true });
            updateDialogState({ tutorialDialog: false });
        }
    };

    usePageRefresh(() => {
        loadComponent(); // Fetch the application state on page refresh
    });

    useEffect(() => {
        loadComponent(); // Fetch the application state on component mount
    }, []);

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
