import { useEffect } from 'react';
import { createToast } from 'vercel-toast';

export default function useToastPipeline() {
    useEffect(() => {
        if (!window.api) {
            return;
        }

        const onMessageReceived = (
            _: Electron.IpcRendererEvent,
            { message, type }: { message: string; type: 'success' | 'error' }
        ) => {
            createToast(message, {
                type: type,
                timeout: 3000,
            });
        };

        window.api.onMessage(onMessageReceived);

        return () => {
            window.api.removeMessageListener(onMessageReceived);
        };
    }, []);
}
