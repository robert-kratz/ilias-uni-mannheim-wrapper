import React, { useEffect, useState } from 'react';
import DialogModal from '../DialogModalTemplate';
import { AppDispatch, RootState } from '../../state/store';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTutorialDialogPage } from '../../state/stateSlice';
import Logo from '../../../assets/rjks_logo_dark-256.svg';

type Props = {
    open: boolean;
    onClose: ({ success }: { success: boolean }) => void;
};

export default function TutorialDialog({ open, onClose }: Props) {
    const appState = useSelector((state: RootState) => state.app);
    const dispatch: AppDispatch = useDispatch();

    useEffect(() => {
        const fetchApplicationState = async () => {};

        const onReload = (event: Electron.IpcRendererEvent, data: { message: string; type: 'success' | 'error' }) => {
            fetchApplicationState();
        };

        window.api.onReload(onReload);

        fetchApplicationState();

        return () => {
            window.api.removeReloadListener(onReload);
        };
    }, []);

    const handleCloseEvent = async ({ success }: { success: boolean }) => {
        if (appState.currentTutorialDialogPage !== 4) {
            return;
        }

        onClose && onClose({ success });
    };

    // return <DialogModal open={open} onClose={() => handleCloseEvent({ success: false })}></DialogModal>;
}
