import { useEffect, useReducer, useState } from 'react';
import { User } from '../types/objects';
import ConfirmationDialog from '../components/dialogs/ConfirmationDialog';

export default function SettingsPage() {
    const [userList, setUserList] = useState<User[]>([]);

    const [currentDialogState, updateDialogState] = useReducer(
        (state: any, newState: any) => ({ ...state, ...newState }),
        {
            confirmationDialog: false,
        }
    );

    useEffect(() => {
        const fetchApplicationState = async () => {
            if (window.api) {
                window.api.getUserList().then((data) => {
                    setUserList(data);
                });
            }
        };

        fetchApplicationState();

        const onReload = (event: Electron.IpcRendererEvent, data: { message: string; type: 'success' | 'error' }) => {
            fetchApplicationState();
        };

        window.api.onReload(onReload);

        return () => {
            window.api.removeReloadListener(onReload);
        };
    }, []);

    const closeConfirmationDialog = ({ success }: { success: boolean }) => {
        updateDialogState({ confirmationDialog: false });

        if (success) {
            if (window.api) {
                window.api.resetApplication();
            }
        }
    };

    return (
        <div>
            <ConfirmationDialog open={currentDialogState.confirmationDialog} onClose={closeConfirmationDialog} />
            <h1>Settings</h1>
            <p>User List:</p>
            <ul>
                {userList.map((user) => (
                    <li key={user.id}>{user.email}</li>
                ))}
            </ul>
            <button className="p-4 bg-indigo-500" onClick={() => updateDialogState({ confirmationDialog: true })}>
                Reset Application
            </button>
        </div>
    );
}
