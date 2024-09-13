import { useEffect, useReducer, useState } from 'react';
import DialogModal, {
    Button,
    ButtonActionWrapper,
    CancelButton,
    DialogForm,
    DialogInputField,
    DialogInputPasswordField,
    DialogTitle,
} from '../DialogModalTemplate';
import { createToast } from 'vercel-toast';

type Props = {
    open: boolean;
    onClose: ({ success }: { success: boolean }) => void;
};

export default function SaveCredentialsDialog({ open, onClose }: Props) {
    const [currentFormData, updateFormData] = useReducer((state: any, newState: any) => ({ ...state, ...newState }), {
        username: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async () => {
        setLoading(true);
        console.log('Submitting credentials: ', currentFormData);

        if (!currentFormData.username || !currentFormData.password) {
            createToast('Please fill in all fields', {
                type: 'error',
                timeout: 3000,
            });

            setLoading(false);
            return;
        }

        window.api.sendCredentials(currentFormData.username, currentFormData.password);
    };

    const closeModal = ({ success }: { success: boolean }) => {
        if (loading) return;

        onClose({ success });
    };

    useEffect(() => {
        const handleCredentialsCallback = (event: Electron.IpcRendererEvent, { isValid }: { isValid: boolean }) => {
            console.log('Credentials validation result: ', isValid);

            setLoading(false);

            if (isValid) {
                onClose({ success: true });
            } else {
                createToast('Invalid credentials, please try again', {
                    type: 'error',
                    timeout: 3000,
                });
            }
        };

        window.api.onCredentialsValidated(handleCredentialsCallback);

        return () => {
            // Assuming you expose a remove method as well
            window.api.removeCredentialsValidatedListener(handleCredentialsCallback);
        };
    }, []);

    useEffect(() => {
        if (!open) return;

        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                handleSubmit();
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [open, handleSubmit]);

    return (
        <DialogModal open={open} onClose={() => closeModal({ success: false })}>
            <DialogTitle
                title="Save Credentials"
                description="Enter your credentials to save them, so you don't have to enter them every time."
            />
            <DialogForm>
                <DialogInputField
                    id="username"
                    label="Username"
                    name="username"
                    type="text"
                    disabled={loading}
                    value={currentFormData.username}
                    onChange={(e) => updateFormData({ username: e.target.value })}
                    autoComplete="username"
                    autoCorrect="off"
                />
                <DialogInputPasswordField
                    id="password"
                    label="Password"
                    name="password"
                    disabled={loading}
                    value={currentFormData.password}
                    onChange={(e) => updateFormData({ password: e.target.value })}
                    showPassword={showPassword}
                    onVisibilityChange={() => setShowPassword(!showPassword)}
                    autoComplete="current-password"
                    autoCorrect="off"
                />
                <ButtonActionWrapper>
                    <CancelButton onClick={() => closeModal({ success: false })} text="Cancel" />
                    <Button
                        onClick={handleSubmit}
                        text="Attempt Save
                    "
                        loading={loading}
                        disabled={loading}
                    />
                </ButtonActionWrapper>
            </DialogForm>
        </DialogModal>
    );
}
