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

    const onWelcomeWindowClose = async () => {
        dispatch(
            setCurrentTutorialDialogPage({
                currentTutorialDialogPage: appState.currentTutorialDialogPage + 1,
            })
        );
    };

    const onFirstSetupDialogClose = async () => {
        dispatch(
            setCurrentTutorialDialogPage({
                currentTutorialDialogPage: appState.currentTutorialDialogPage + 1,
            })
        );
    };

    const currentPage = React.useMemo(() => {
        switch (appState.currentTutorialDialogPage) {
            case 0:
                return <WelcomePage onClose={onWelcomeWindowClose} />;
            case 1:
                return <SecurePage onClose={onFirstSetupDialogClose} />;
            case 2:
                return <DisclaimerPage onClose={onFirstSetupDialogClose} />;
            default:
                return null;
        }
    }, [appState.currentTutorialDialogPage, open, onClose]);

    return (
        <DialogModal open={open} onClose={() => handleCloseEvent({ success: false })}>
            {currentPage}
        </DialogModal>
    );
}

type WelcomeWindowProps = {
    onClose: () => void;
};

const WelcomePage = ({ onClose }: WelcomeWindowProps): React.ReactElement => {
    return (
        <div className="space-y-2">
            <div className="flex justify-center items-center h-28">
                <div className="w-16 h-16 rounded-full bg-indigo-500 text-white">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6 p-3">
                        <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
                        <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.711 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.83.634 2.726.99v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.66a6.727 6.727 0 0 0 .551-1.607 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.667 2.25 2.25 0 0 0 2.12 0Z" />
                        <path d="M4.462 19.462c.42-.419.753-.89 1-1.395.453.214.902.435 1.347.662a6.742 6.742 0 0 1-1.286 1.794.75.75 0 0 1-1.06-1.06Z" />
                    </svg>
                </div>
            </div>
            <h1 className="text-2xl font-semibold">Ilias Ultimate</h1>
            <p className="text-gray-200 font-light text-md">
                This application allows you to manage your courses and files at the{' '}
                <a href="https://ilias.uni-stuttgart.de" className="text-blue-500 hover:underline">
                    University of Mannheim's Ilias
                </a>{' '}
                platform.
            </p>
            <div className="flex flex-col space-y-2">
                <div className="p-2 flex justify-start items-center space-x-3">
                    <div className="text-blue-500 w-6 h-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6">
                            <path
                                fillRule="evenodd"
                                d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <p className="text-gray-200 font-light">Access your data fast and easy</p>
                </div>
                <div className="p-2 flex justify-start items-center space-x-3">
                    <div className="text-violet-500 w-6 h-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6">
                            <path d="M8.25 10.875a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0Z" />
                            <path
                                fillRule="evenodd"
                                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.125 4.5a4.125 4.125 0 1 0 2.338 7.524l2.007 2.006a.75.75 0 1 0 1.06-1.06l-2.006-2.007a4.125 4.125 0 0 0-3.399-6.463Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <p className="text-gray-200 font-light">Search for your courses and files</p>
                </div>
                <div className="p-2 flex justify-start items-center space-x-3">
                    <div className="text-emerald-500 w-6 h-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6">
                            <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.615 54.615 0 0 1 4.653-2.52.75.75 0 0 0-.65-1.352 56.123 56.123 0 0 0-4.78 2.589 1.858 1.858 0 0 0-.859 1.228 49.803 49.803 0 0 0-4.634-1.527.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
                            <path d="M13.06 15.473a48.45 48.45 0 0 1 7.666-3.282c.134 1.414.22 2.843.255 4.284a.75.75 0 0 1-.46.711 47.87 47.87 0 0 0-8.105 4.342.75.75 0 0 1-.832 0 47.87 47.87 0 0 0-8.104-4.342.75.75 0 0 1-.461-.71c.035-1.442.121-2.87.255-4.286.921.304 1.83.634 2.726.99v1.27a1.5 1.5 0 0 0-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.66a6.727 6.727 0 0 0 .551-1.607 1.5 1.5 0 0 0 .14-2.67v-.645a48.549 48.549 0 0 1 3.44 1.667 2.25 2.25 0 0 0 2.12 0Z" />
                            <path d="M4.462 19.462c.42-.419.753-.89 1-1.395.453.214.902.435 1.347.662a6.742 6.742 0 0 1-1.286 1.794.75.75 0 0 1-1.06-1.06Z" />
                        </svg>
                    </div>
                    <p className="text-gray-200 font-light">Keep track of work and deadlines</p>
                </div>
            </div>
            <div className="flex justify-center items-center space-x-8 scale-90 py-4">
                <div className="hover:-translate-y-2 transition">
                    <a href="https://github.com/robert-kratz/ilias-uni-mannheim-wrapper" target="_blank">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M24 0C10.748 0 0 10.746 0 24C0 34.604 6.876 43.6 16.414 46.774C17.612 46.996 18 46.252 18 45.62V41.152C11.324 42.604 9.934 38.32 9.934 38.32C8.842 35.546 7.268 34.808 7.268 34.808C5.09 33.318 7.434 33.35 7.434 33.35C9.844 33.518 11.112 35.824 11.112 35.824C13.252 39.492 16.726 38.432 18.096 37.818C18.31 36.268 18.932 35.208 19.62 34.61C14.29 34 8.686 31.942 8.686 22.748C8.686 20.126 9.624 17.986 11.158 16.306C10.91 15.7 10.088 13.258 11.392 9.954C11.392 9.954 13.408 9.31 17.994 12.414C19.908 11.882 21.96 11.616 24 11.606C26.04 11.616 28.094 11.882 30.012 12.414C34.594 9.31 36.606 9.954 36.606 9.954C37.912 13.26 37.09 15.702 36.842 16.306C38.382 17.986 39.312 20.128 39.312 22.748C39.312 31.966 33.698 33.996 28.354 34.59C29.214 35.334 30 36.794 30 39.034V45.62C30 46.258 30.384 47.008 31.602 46.772C41.132 43.594 48 34.6 48 24C48 10.746 37.254 0 24 0Z"
                                fill="black"
                            />
                        </svg>
                    </a>
                </div>
                <div className="hover:-translate-y-2 transition">
                    <a href="https://rjks.us" target="_blank">
                        <img src={Logo} alt="Logo" className="w-16 h-16 rounded-full p-1" />
                    </a>
                </div>
            </div>
            <div>
                <button
                    onClick={onClose}
                    className="bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-md px-4 py-3 w-full">
                    Next
                </button>
            </div>
        </div>
    );
};

type SecurePageProps = {
    onClose: () => void;
};

const SecurePage = ({ onClose }: SecurePageProps) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Secure and Reliable</h1>
                <div className="w-12 h-12 rounded-full bg-violet-500 text-white">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6 p-3">
                        <path
                            fillRule="evenodd"
                            d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            </div>

            <p className="200 font-light text-md">
                For your convenience, you can safe your Ilias credentials in the
                <strong className="font-bold"> local keychain</strong>, so you don't have to enter them every time you
                want to access your data.
            </p>
            <div className="flex flex-col space-y-2">
                <div className="p-2 flex justify-start items-center space-x-3">
                    <div className="text-blue-500 w-6 h-6 p-0.5">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6">
                            <path
                                fillRule="evenodd"
                                d="M12 3.75a6.715 6.715 0 0 0-3.722 1.118.75.75 0 1 1-.828-1.25 8.25 8.25 0 0 1 12.8 6.883c0 3.014-.574 5.897-1.62 8.543a.75.75 0 0 1-1.395-.551A21.69 21.69 0 0 0 18.75 10.5 6.75 6.75 0 0 0 12 3.75ZM6.157 5.739a.75.75 0 0 1 .21 1.04A6.715 6.715 0 0 0 5.25 10.5c0 1.613-.463 3.12-1.265 4.393a.75.75 0 0 1-1.27-.8A6.715 6.715 0 0 0 3.75 10.5c0-1.68.503-3.246 1.367-4.55a.75.75 0 0 1 1.04-.211ZM12 7.5a3 3 0 0 0-3 3c0 3.1-1.176 5.927-3.105 8.056a.75.75 0 1 1-1.112-1.008A10.459 10.459 0 0 0 7.5 10.5a4.5 4.5 0 1 1 9 0c0 .547-.022 1.09-.067 1.626a.75.75 0 0 1-1.495-.123c.041-.495.062-.996.062-1.503a3 3 0 0 0-3-3Zm0 2.25a.75.75 0 0 1 .75.75c0 3.908-1.424 7.485-3.781 10.238a.75.75 0 0 1-1.14-.975A14.19 14.19 0 0 0 11.25 10.5a.75.75 0 0 1 .75-.75Zm3.239 5.183a.75.75 0 0 1 .515.927 19.417 19.417 0 0 1-2.585 5.544.75.75 0 0 1-1.243-.84 17.915 17.915 0 0 0 2.386-5.116.75.75 0 0 1 .927-.515Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <p className="200 font-light">Store your credentials securely</p>
                </div>
                <div className="p-2 flex justify-start items-center space-x-3">
                    <div className="text-emerald-500 w-6 h-6 p-0.5">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6">
                            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                        </svg>
                    </div>
                    <p className="200 font-light">Fetch all your data with one click</p>
                </div>
            </div>
            <div>
                <button
                    onClick={onClose}
                    className="bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-md px-4 py-3 w-full">
                    Next
                </button>
            </div>
        </div>
    );
};

type DisclaimerPageProps = {
    onClose: () => void;
};

const DisclaimerPage = ({ onClose }: DisclaimerPageProps) => {
    const [loading, setLoading] = useState<boolean>(false);

    const openLoginModal = () => {
        if (loading) {
            return;
        }

        window?.api?.openLoginWindow();
        setLoading(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Disclaimer</h1>
                <div className="w-12 h-12 rounded-full bg-indigo-500 text-white">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6 p-3">
                        <path
                            fillRule="evenodd"
                            d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 0 0 3 3h15a3 3 0 0 1-3-3V4.875C17.25 3.839 16.41 3 15.375 3H4.125ZM12 9.75a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H12Zm-.75-2.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H12a.75.75 0 0 1-.75-.75ZM6 12.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5H6Zm-.75 3.75a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75ZM6 6.75a.75.75 0 0 0-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-3A.75.75 0 0 0 9 6.75H6Z"
                            clipRule="evenodd"
                        />
                        <path d="M18.75 6.75h1.875c.621 0 1.125.504 1.125 1.125V18a1.5 1.5 0 0 1-3 0V6.75Z" />
                    </svg>
                </div>
            </div>
            <p className="200 font-light text-md">
                This application is not affiliated with the University of Mannheim or the Ilias platform. It is a
                personal project developed by{' '}
                <a href="https://rjks.us/" className="text-blue-500 hover:underline">
                    Robert Julian Kratz
                </a>{' '}
            </p>
            <div className="flex flex-col space-y-2">
                <div className="p-2 flex justify-start items-center space-x-3">
                    <div className="text-violet-500 w-6 h-6 p-0.5">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6">
                            <path d="M10.5 1.875a1.125 1.125 0 0 1 2.25 0v8.219c.517.162 1.02.382 1.5.659V3.375a1.125 1.125 0 0 1 2.25 0v10.937a4.505 4.505 0 0 0-3.25 2.373 8.963 8.963 0 0 1 4-.935A.75.75 0 0 0 18 15v-2.266a3.368 3.368 0 0 1 .988-2.37 1.125 1.125 0 0 1 1.591 1.59 1.118 1.118 0 0 0-.329.79v3.006h-.005a6 6 0 0 1-1.752 4.007l-1.736 1.736a6 6 0 0 1-4.242 1.757H10.5a7.5 7.5 0 0 1-7.5-7.5V6.375a1.125 1.125 0 0 1 2.25 0v5.519c.46-.452.965-.832 1.5-1.141V3.375a1.125 1.125 0 0 1 2.25 0v6.526c.495-.1.997-.151 1.5-.151V1.875Z" />
                        </svg>
                    </div>
                    <p className="200 font-light">Project under development</p>
                </div>
                <div className="p-2 flex justify-start items-center space-x-3">
                    <div className="text-emerald-500 w-6 h-6 p-0.5">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6">
                            <path
                                fillRule="evenodd"
                                d="M8.478 1.6a.75.75 0 0 1 .273 1.026 3.72 3.72 0 0 0-.425 1.121c.058.058.118.114.18.168A4.491 4.491 0 0 1 12 2.25c1.413 0 2.673.651 3.497 1.668.06-.054.12-.11.178-.167a3.717 3.717 0 0 0-.426-1.125.75.75 0 1 1 1.298-.752 5.22 5.22 0 0 1 .671 2.046.75.75 0 0 1-.187.582c-.241.27-.505.52-.787.749a4.494 4.494 0 0 1 .216 2.1c-.106.792-.753 1.295-1.417 1.403-.182.03-.364.057-.547.081.152.227.273.476.359.742a23.122 23.122 0 0 0 3.832-.803 23.241 23.241 0 0 0-.345-2.634.75.75 0 0 1 1.474-.28c.21 1.115.348 2.256.404 3.418a.75.75 0 0 1-.516.75c-1.527.499-3.119.854-4.76 1.049-.074.38-.22.735-.423 1.05 2.066.209 4.058.672 5.943 1.358a.75.75 0 0 1 .492.75 24.665 24.665 0 0 1-1.189 6.25.75.75 0 0 1-1.425-.47 23.14 23.14 0 0 0 1.077-5.306c-.5-.169-1.009-.32-1.524-.455.068.234.104.484.104.746 0 3.956-2.521 7.5-6 7.5-3.478 0-6-3.544-6-7.5 0-.262.037-.511.104-.746-.514.135-1.022.286-1.522.455.154 1.838.52 3.616 1.077 5.307a.75.75 0 1 1-1.425.468 24.662 24.662 0 0 1-1.19-6.25.75.75 0 0 1 .493-.749 24.586 24.586 0 0 1 4.964-1.24h.01c.321-.046.644-.085.969-.118a2.983 2.983 0 0 1-.424-1.05 24.614 24.614 0 0 1-4.76-1.05.75.75 0 0 1-.516-.75c.057-1.16.194-2.302.405-3.417a.75.75 0 0 1 1.474.28c-.164.862-.28 1.74-.345 2.634 1.237.371 2.517.642 3.832.803.085-.266.207-.515.359-.742a18.698 18.698 0 0 1-.547-.08c-.664-.11-1.311-.612-1.417-1.404a4.535 4.535 0 0 1 .217-2.103 6.788 6.788 0 0 1-.788-.751.75.75 0 0 1-.187-.583 5.22 5.22 0 0 1 .67-2.04.75.75 0 0 1 1.026-.273Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <p className="200 font-light">At your own risk</p>
                </div>
            </div>
            <div>
                <button
                    onClick={openLoginModal}
                    disabled={loading}
                    className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-600 disabled:cursor-not-allowed transition text-white rounded-md px-4 py-3 w-full relative">
                    {loading ? 'Continue in other window' : 'Proceed to Login (Ilias)'}
                    {loading && (
                        <div className="absolute w-6 h-6 min-w-[1.5rem] border-4 border-t-4 border-gray-300 border-t-indigo-500 rounded-full animate-spin right-2 top-3"></div>
                    )}
                </button>
            </div>
        </div>
    );
};
