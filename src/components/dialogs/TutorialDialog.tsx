import { useEffect } from 'react';
import DialogModal from '../DialogModal';
import Tutorial from '../../app/pages/Tutorial';

type Props = {
    open: boolean;
    onClose: ({ success }: { success: boolean }) => void;
};

export default function TutorialDialog({ open, onClose }: Props) {
    const handleSubmit = async () => {
        onClose({ success: true });
    };

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
        <DialogModal open={open} onClose={() => onClose({ success: false })}>
            <Tutorial />
        </DialogModal>
    );
}
