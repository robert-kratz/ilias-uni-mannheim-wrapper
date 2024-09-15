import { useEffect } from 'react';
import DialogModal, {
    Button,
    ButtonActionWrapper,
    CancelButton,
    DialogForm,
    DialogTitle,
} from '../DialogModalTemplate';
import { createToast } from 'vercel-toast';

type Props = {
    open: boolean;
    onClose: ({ success }: { success: boolean }) => void;
};

export default function ConfirmationDialog({ open, onClose }: Props) {
    const closeModal = ({ success }: { success: boolean }) => {
        onClose({ success });
    };

    useEffect(() => {
        const handleCredentialsCallback = (event: Electron.IpcRendererEvent, { isValid }: { isValid: boolean }) => {
            console.log('Credentials validation result: ', isValid);

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

    return (
        <DialogModal open={open} onClose={() => closeModal({ success: false })}>
            <DialogTitle
                title="Are you sure?"
                description="Are you sure you want to reset this application? This action cannot be undone."
            />
            <DialogForm>
                <ButtonActionWrapper>
                    <CancelButton onClick={() => closeModal({ success: false })} text="Cancel" />
                    <Button
                        onClick={() => closeModal({ success: true })}
                        text="Attempt Save
                    "
                        loading={false}
                        disabled={false}
                    />
                </ButtonActionWrapper>
            </DialogForm>
        </DialogModal>
    );
}
