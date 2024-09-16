import { useEffect, useReducer, useState } from 'react';
import { User } from '../types/objects';
import ConfirmationDialog from '../components/dialogs/ConfirmationDialog';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../state/store';
import { RootState } from '../state/store';
import Logo from '../../assets/rjks_logo_dark-256.svg';

type SettingsPageProps = {
    open: boolean;
};

export default function SettingsPage({ open }: SettingsPageProps) {
    const [userList, setUserList] = useState<User[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const appState = useSelector((state: RootState) => state.app);
    const dispatch: AppDispatch = useDispatch();

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
                window.api.getApplicationState().then((value) => {
                    setCurrentUserId(value.userId);
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
    }, [open]);

    const closeConfirmationDialog = ({ success }: { success: boolean }) => {
        updateDialogState({ confirmationDialog: false });

        if (success) {
            if (window.api) {
                window.api.resetApplication();
            }
        }
    };

    return (
        <div className="space-y-2">
            <ConfirmationDialog open={currentDialogState.confirmationDialog} onClose={closeConfirmationDialog} />
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <div className="grid grid-cols-4 gap-4 py-2">
                <div className="col-span-2 space-y-2 rounded-md bg-dark-gray-2 p-4">
                    <h2 className="text-lg font-bold text-gray-200">User List</h2>
                    <div className="flex cursor-pointer items-center justify-between space-x-4 rounded-md bg-dark-gray-3 p-4">
                        {userList.map((user) => (
                            <>
                                <h2 key={user.id} className="text-md font-normal text-gray-300">
                                    {user.email}
                                </h2>
                                {currentUserId === user.id && (
                                    <div className="rounded-md bg-indigo-500 p-2">
                                        <h1 className="text-sm font-bold text-white">Current User</h1>
                                    </div>
                                )}
                            </>
                        ))}
                    </div>
                </div>
                <div className="col-span-2 grid grid-cols-4 gap-4 rounded-md bg-dark-gray-2 p-4">
                    <div className="flex cursor-pointer items-center justify-center space-x-4 rounded-md bg-dark-gray-3 p-4 transition hover:scale-[103%]">
                        <div className="flex flex-col items-center space-y-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6 h-10 w-10 text-violet-500">
                                <path
                                    fillRule="evenodd"
                                    d="M2.25 5.25a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 0 1-.53 1.28h-9a.75.75 0 0 1-.53-1.28l.621-.622a2.25 2.25 0 0 0 .659-1.59V18h-3a3 3 0 0 1-3-3V5.25Zm1.5 0v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="text-md text-center font-semibold text-gray-300">0</span>
                        </div>
                    </div>
                    <div className="flex cursor-pointer items-center justify-center space-x-4 rounded-md bg-dark-gray-3 p-4 transition hover:scale-[103%]">
                        <div className="flex flex-col items-center space-y-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6 h-10 w-10 text-indigo-500">
                                <path
                                    fillRule="evenodd"
                                    d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
                                    clipRule="evenodd"
                                />
                                <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                            </svg>
                            <span className="text-md text-center font-semibold text-gray-300">0</span>
                        </div>
                    </div>
                    <div className="flex cursor-pointer items-center justify-center space-x-4 rounded-md bg-dark-gray-3 p-4 transition hover:scale-[103%]">
                        <div className="flex flex-col items-center space-y-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6 h-10 w-10 text-emerald-500">
                                <path d="M19.906 9c.382 0 .749.057 1.094.162V9a3 3 0 0 0-3-3h-3.879a.75.75 0 0 1-.53-.22L11.47 3.66A2.25 2.25 0 0 0 9.879 3H6a3 3 0 0 0-3 3v3.162A3.756 3.756 0 0 1 4.094 9h15.812ZM4.094 10.5a2.25 2.25 0 0 0-2.227 2.568l.857 6A2.25 2.25 0 0 0 4.951 21H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-2.227-2.568H4.094Z" />
                            </svg>
                            <span className="text-md text-center font-semibold text-gray-300">0</span>
                        </div>
                    </div>
                    <div className="flex cursor-pointer items-center justify-center space-x-4 rounded-md bg-dark-gray-3 p-4 transition hover:scale-[103%]">
                        <div className="flex flex-col items-center space-y-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6 h-10 w-10 text-yellow-500">
                                <path
                                    fillRule="evenodd"
                                    d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z"
                                    clipRule="evenodd"
                                />
                                <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
                            </svg>

                            <span className="text-md text-center font-semibold text-gray-300">0</span>
                        </div>
                    </div>
                </div>
                <div className="col-span-2 space-y-2 rounded-md bg-dark-gray-2 p-4">
                    <h2 className="text-lg font-bold text-gray-200">Saved Credentials</h2>
                    <div className="flex cursor-pointer items-center justify-between space-x-4 rounded-md bg-dark-gray-3 p-4">
                        {userList.map((user) => (
                            <>
                                <h2 key={user.id} className="text-md font-normal text-gray-300">
                                    {user.email}
                                </h2>
                                {currentUserId === user.id && (
                                    <div className="rounded-md bg-indigo-500 p-2">
                                        <h1 className="text-sm font-bold text-white">Current User</h1>
                                    </div>
                                )}
                            </>
                        ))}
                    </div>
                </div>
                <div className="col-span-1 flex flex-col justify-center space-y-4 rounded-md bg-dark-gray-2 p-4">
                    <div className="flex items-center justify-center space-x-6">
                        <div className="transition hover:scale-[103%]">
                            <a
                                href="https://rjks.us?utm_source=ilias-uni-mannheim-wrapper&utm_medium=app&utm_campaign=settings"
                                target="_blank">
                                <img src={Logo} alt="RJKS Logo" className="h-14 w-14 rounded-full" />
                            </a>
                        </div>
                        <div className="transition hover:scale-[103%]">
                            <a href="https://github.com/robert-kratz/ilias-uni-mannheim-wrapper" target="_blank">
                                <svg
                                    width="48"
                                    height="48"
                                    viewBox="0 0 48 48"
                                    fill="none"
                                    className="h-14 w-14"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M24 0C10.748 0 0 10.746 0 24C0 34.604 6.876 43.6 16.414 46.774C17.612 46.996 18 46.252 18 45.62V41.152C11.324 42.604 9.934 38.32 9.934 38.32C8.842 35.546 7.268 34.808 7.268 34.808C5.09 33.318 7.434 33.35 7.434 33.35C9.844 33.518 11.112 35.824 11.112 35.824C13.252 39.492 16.726 38.432 18.096 37.818C18.31 36.268 18.932 35.208 19.62 34.61C14.29 34 8.686 31.942 8.686 22.748C8.686 20.126 9.624 17.986 11.158 16.306C10.91 15.7 10.088 13.258 11.392 9.954C11.392 9.954 13.408 9.31 17.994 12.414C19.908 11.882 21.96 11.616 24 11.606C26.04 11.616 28.094 11.882 30.012 12.414C34.594 9.31 36.606 9.954 36.606 9.954C37.912 13.26 37.09 15.702 36.842 16.306C38.382 17.986 39.312 20.128 39.312 22.748C39.312 31.966 33.698 33.996 28.354 34.59C29.214 35.334 30 36.794 30 39.034V45.62C30 46.258 30.384 47.008 31.602 46.772C41.132 43.594 48 34.6 48 24C48 10.746 37.254 0 24 0Z"
                                        fill="black"
                                    />
                                </svg>
                            </a>
                        </div>
                    </div>
                    <span className="text-center text-xs font-normal text-gray-300">
                        &copy; {new Date().getFullYear()} Robert Kratz. All rights reserved.
                    </span>
                </div>
                <div className="col-span-1 space-y-2 rounded-md bg-dark-gray-2 p-4">
                    <h2 className="text-lg font-bold text-gray-200">Reset</h2>
                    <div className="flex cursor-pointer items-center justify-between space-x-4 rounded-md bg-dark-gray-3 p-4">
                        <button
                            onClick={() => updateDialogState({ confirmationDialog: true })}
                            className="w-full max-w-xs rounded-md bg-red-500 px-4 py-3 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-600">
                            Reset Application
                        </button>
                    </div>
                </div>
                <div className="col-span-4 space-y-2 rounded-md bg-dark-gray-2 p-4">
                    <div className="flex cursor-pointer items-center justify-between space-x-4 rounded-md bg-dark-gray-3 p-4"></div>
                </div>
            </div>
        </div>
    );
}
