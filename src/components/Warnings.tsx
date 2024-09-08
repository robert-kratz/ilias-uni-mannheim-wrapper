import { useState } from 'react';
import SaveCredentialsDialog from './dialogs/SaveCredentialsDialog';
import { createToast } from 'vercel-toast';

type WarningProps = {
    show: boolean;
};

export const SaveCredentialsWarning = ({ show }: WarningProps) => {
    const [open, setOpen] = useState<boolean>(false);

    const onDialogClose = ({ success }: { success: boolean }) => {
        setOpen(false);
    };

    if (!show) {
        return null;
    }

    return (
        <>
            <SaveCredentialsDialog open={open} onClose={({ success }) => onDialogClose({ success })} />
            <div
                onClick={() => setOpen(true)}
                className="p-3 bg-yellow-500 bg-opacity-70 border border-yellow-500 rounded-md mb-6 flex justify-start items-center space-x-3 cursor-pointer">
                <div className="h-6 w-6">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6 text-yellow-900">
                        <path
                            fillRule="evenodd"
                            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                <p className="text-yellow-900">
                    <strong>Warning:</strong> You still haven't saved your credentials yet!{' '}
                    <span className="underline">Click here</span> to save them in your local keychain.
                </p>
            </div>
        </>
    );
};
