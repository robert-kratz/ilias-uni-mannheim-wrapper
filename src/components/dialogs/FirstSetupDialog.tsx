import { useEffect, useState } from 'react';
import DialogModal from '../DialogModal';
import React from 'react';
import { createToast } from 'vercel-toast';
import { ScrapeEvent } from '../../types/objects';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { AppDispatch } from '../../app/store';
import { setCurrentFirstSetupWizardPage } from '../../features/stateSlice';
import SaveCredentialsDialog from './SaveCredentialsDialog';

const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
};

/**
 * 1. WelcomeWindow, greeting the user after successful first login. Fetch Index Page.
 * 2. SelectYearWindow, show a list of all available years and let the user select one or multiple.
 * 3. FetchingDataWindow, show a loading spinner while fetching data.
 * 4. SettingsSetupWindow, let the user configure settings, save credentials, etc.
 * 5. FinishSetupWindow, show a success message with a button to close the dialog.
 */

type Props = {
    open: boolean;
    onClose: ({ success }: { success: boolean }) => void;
};

export default function FirstSetupDialog({ open, onClose }: Props) {
    const appState = useSelector((state: RootState) => state.app);
    const dispatch: AppDispatch = useDispatch();

    const [username, setUsername] = useState<string>('');

    const [aviablableYears, setAviablableYears] = useState<string[]>([]);
    const [selectedYears, setSelectedYears] = useState<string[]>([]);

    useEffect(() => {
        const fetchApplicationState = async () => {
            if (window.api) {
                window.api.getStoreValue('aviablableYears').then((years) => {
                    setAviablableYears(years);
                });
                window.api.getStoreValue('selectedYears').then((years) => {
                    setSelectedYears(years);
                });
                window.api.getStoreValue('username').then((name) => {
                    setUsername(name);
                });
            }
        };

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
        if (appState.currentFirstSetupWizardPage !== 4) {
            return;
        }

        onClose && onClose({ success });
    };

    const onWelcomeWindowClose = async ({ success }: { success: boolean }) => {
        if (success) {
            dispatch(
                setCurrentFirstSetupWizardPage({
                    currentFirstSetupWizardPage: appState.currentFirstSetupWizardPage + 1,
                })
            );
        }
    };

    const onYearSelectWindowClose = async ({ selectedYears }: { selectedYears: string[] }) => {
        if (selectedYears.length === 0) {
            return;
        }

        if (window.api) {
            window.api.setStoreValue('selectedYears', selectedYears);
        }

        setSelectedYears(selectedYears);

        dispatch(
            setCurrentFirstSetupWizardPage({
                currentFirstSetupWizardPage: appState.currentFirstSetupWizardPage + 1,
            })
        );
    };

    const onFetchDataWindowClose = async ({ success }: { success: boolean }) => {
        if (!success) {
            dispatch(
                setCurrentFirstSetupWizardPage({
                    currentFirstSetupWizardPage: 1,
                })
            );

            createToast('Error fetching data.', {
                type: 'error',
                timeout: 5000,
            });
            return;
        }

        dispatch(
            setCurrentFirstSetupWizardPage({
                currentFirstSetupWizardPage: appState.currentFirstSetupWizardPage + 1,
            })
        );
    };

    const onSettingsSetupWindowClose = async () => {
        dispatch(
            setCurrentFirstSetupWizardPage({
                currentFirstSetupWizardPage: appState.currentFirstSetupWizardPage + 1,
            })
        );
    };

    const onCloseFinishSetupWindow = async () => {
        if (window.api) {
            window.api.setStoreValue('hasSetUpWizard', true);
        }

        onClose && onClose({ success: true });
    };

    const currentPage = React.useMemo(() => {
        switch (appState.currentFirstSetupWizardPage) {
            case 0:
                return <WelcomeWindow usename={username} onClose={onWelcomeWindowClose} />;
            case 1:
                return <SelectYearWindow onClose={onYearSelectWindowClose} aviablableYears={aviablableYears} />;
            case 2:
                return <FetchingDataWindow onClose={onFetchDataWindowClose} selectedYears={selectedYears} />;
            case 3:
                return <SettingsSetupWindow onClose={onSettingsSetupWindowClose} />;
            case 4:
                return <FinishSetupWindow onClose={onCloseFinishSetupWindow} />;
            default:
                return null;
        }
    }, [appState.currentFirstSetupWizardPage, open, onClose]);

    return (
        <DialogModal open={open} onClose={() => handleCloseEvent({ success: false })}>
            {currentPage}
        </DialogModal>
    );
}

type WelcomeWindowProps = {
    usename: string;
    onClose: ({ success }: { success: boolean }) => void;
};

const WelcomeWindow = ({ onClose, usename }: WelcomeWindowProps): React.ReactNode => {
    const handleNext = () => {
        onClose && onClose({ success: true });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center space-x-4">
                <h1 className="text-2xl font-bold">Welcome {usename}!</h1>
                <div className="w-12 h-12 rounded-full bg-violet-500 text-white">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6 p-3">
                        <path
                            fillRule="evenodd"
                            d="M12 6.75a5.25 5.25 0 0 1 6.775-5.025.75.75 0 0 1 .313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 0 1 1.248.313 5.25 5.25 0 0 1-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 1 1 2.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0 1 12 6.75ZM4.117 19.125a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z"
                            clipRule="evenodd"
                        />
                        <path d="m10.076 8.64-2.201-2.2V4.874a.75.75 0 0 0-.364-.643l-3.75-2.25a.75.75 0 0 0-.916.113l-.75.75a.75.75 0 0 0-.113.916l2.25 3.75a.75.75 0 0 0 .643.364h1.564l2.062 2.062 1.575-1.297Z" />
                        <path
                            fillRule="evenodd"
                            d="m12.556 17.329 4.183 4.182a3.375 3.375 0 0 0 4.773-4.773l-3.306-3.305a6.803 6.803 0 0 1-1.53.043c-.394-.034-.682-.006-.867.042a.589.589 0 0 0-.167.063l-3.086 3.748Zm3.414-1.36a.75.75 0 0 1 1.06 0l1.875 1.876a.75.75 0 1 1-1.06 1.06L15.97 17.03a.75.75 0 0 1 0-1.06Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            </div>
            <div>
                <p className="text-md text-gray-300">
                    <strong>Thank You for using Ilias Ultimate!</strong>
                    <br />
                    <br />
                    In the following steps we will setup the application for you.
                </p>
                <ul className="list-disc list-inside text-md text-gray-300 p-2 py-6">
                    <li>Select Semesters</li>
                    <li>Index your courses</li>
                    <li>Configure your settings</li>
                </ul>
                <p className="text-md text-gray-300">
                    The process of indexing, depending on the amount of semesters, may take a while.
                </p>
            </div>
            <button
                onClick={handleNext}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-600 transition text-white rounded-md px-4 py-3 w-full">
                Start Setup
            </button>
        </div>
    );
};

type SelectYearWindowProps = {
    aviablableYears: string[];
    onClose: ({ selectedYears }: { selectedYears: string[] }) => void;
};

const SelectYearWindow = ({ onClose, aviablableYears }: SelectYearWindowProps): React.ReactNode => {
    const [selectedYears, setSelectedYears] = useState<string[]>([]);

    useEffect(() => {
        //select second year by default
        setSelectedYears([aviablableYears[1]]);
    }, [aviablableYears]);

    const handleYearSelect = (year: string) => {
        setSelectedYears((prev) => {
            if (prev.includes(year)) {
                return prev.filter((y) => y !== year);
            }

            return [...prev, year];
        });
    };

    const handleNext = () => {
        if (selectedYears.length === 0) {
            createToast('Please select at least one semester.', {
                type: 'error',
                timeout: 5000,
            });
        }

        onClose && onClose({ selectedYears });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center space-x-4">
                <div>
                    <h1 className="text-2xl font-bold">Select Semesters to index:</h1>
                    <p className="text-sm text-gray-300">
                        Please select the semesters you want to index in this application.
                    </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white min-w-[3rem]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6 p-3">
                        <path d="M18.75 12.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM12 6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 6ZM12 18a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 18ZM3.75 6.75h1.5a.75.75 0 1 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM5.25 18.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 0 1.5ZM3 12a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 12ZM9 3.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM12.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM9 15.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
                    </svg>
                </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-scroll">
                <span className="text-sm text-gray-300">
                    Found <strong>{aviablableYears.length}</strong> semesters:
                </span>
                {aviablableYears.map((year) => {
                    if (year === 'MSDNAA') return null;

                    let isSelected = selectedYears.includes(year);

                    return (
                        <div
                            key={year}
                            onClick={() => handleYearSelect(year)}
                            className={classNames(
                                'flex justify-between items-center p-4 bg-dark-gray-3 hover:bg-dark-gray-2 transition rounded-md border-2 cursor-pointer',
                                isSelected ? 'border-emerald-600' : 'border-dark-gray'
                            )}>
                            <p className="text-gray-300">{year}</p>
                            {isSelected && (
                                <div className="w-6 h-6 text-emerald-500 flex justify-center items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="size-6">
                                        <path
                                            fillRule="evenodd"
                                            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <button
                onClick={handleNext}
                disabled={selectedYears.length === 0}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-600 transition text-white rounded-md px-4 py-3 w-full">
                {selectedYears.length === 0 ? 'Select at least one semester' : 'Next'}
            </button>
        </div>
    );
};

type FetchingDataWindowProps = {
    selectedYears: string[];
    onClose: ({ success }: { success: boolean }) => void;
};

const FetchingDataWindow = ({ onClose, selectedYears }: FetchingDataWindowProps): React.ReactNode => {
    //TODO: Implement fetching data from Ilias, callback here, finish year, directory, etc.
    const [isFetching, setIsFetching] = useState(false);
    const [lastScrapeEvent, setLastScrapeEvent] = useState<ScrapeEvent | null>(null);

    useEffect(() => {
        if (window.api) {
            window.api.onApplicationScrape((event, data) => {
                console.log('Scrape data:', data);
                setLastScrapeEvent(data);

                if (data.type === 'error') {
                    setIsFetching(false);
                    onClose && onClose({ success: false });
                    createToast('Error fetching data.' + data.error, {
                        type: 'error',
                        timeout: 5000,
                    });
                }

                if (data.type === 'start' || data.type === 'indexing') {
                    setIsFetching(true);
                }

                if (data.type === 'finish') {
                    setIsFetching(false);
                    onClose && onClose({ success: true });
                    createToast('Successfully fetched data.', {
                        type: 'success',
                        timeout: 5000,
                    });
                }
            });
        }

        if (!isFetching) {
            console.log(selectedYears);

            window.api.startScrape(selectedYears);
            console.log('Start scraping data');
        }

        return () => {
            if (window.api) {
                window.api.removeApplicationScrapeListener(() => {});
            }
        };
    }, []);

    let id = lastScrapeEvent?.ref_id;

    //replace all d-, c- with empty string
    id = id?.replace(/(d-|c-)/g, '');

    let isFile = id?.includes('file');

    let dirUrl = 'https://ilias.uni-mannheim.de/ilias.php?baseClass=ilrepositorygui&cmd=view&ref_id=' + id;
    let fileUrl = 'https://ilias.uni-mannheim.de/goto.php?client_id=ILIAS?target=' + id;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center space-x-4">
                <div>
                    <h1 className="text-2xl font-bold">Indexing Ilias</h1>
                </div>
            </div>
            <div className="boder-b-2 border-dark-gray-3">
                <div className="p-3 bg-opacity-70 border-2 rounded-md flex justify-start items-center space-x-3 bg-red-400 border-red-500 text-red-800">
                    <div className="h-6 w-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6">
                            <path
                                fillRule="evenodd"
                                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <p>Do not close the application!</p>
                </div>
            </div>
            <div className="flex justify-between items-center bg-dark-gray-3 border-2 border-dark-gray rounded-md p-4 space-x-4 min-h-[5rem]">
                <div className="max-w-[17rem]">
                    <p className="text-sm text-gray-300">
                        {lastScrapeEvent?.name && lastScrapeEvent?.ref_id ? (
                            <a
                                href={isFile ? fileUrl : dirUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline truncate text-clip break-words max-w-[17rem]">
                                {lastScrapeEvent.name.length > 40
                                    ? lastScrapeEvent.name.substring(0, 40) + '...'
                                    : lastScrapeEvent.name}
                            </a>
                        ) : (
                            'Preparing...'
                        )}
                    </p>
                </div>
                <div className="w-6 h-6 min-w-[1.5rem] border-4 border-t-4 border-gray-300 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
            <div>
                <p className="text-sm text-gray-300">
                    Indexing may take a while, depending on the amount of semesters. (Approx.{' '}
                    {Math.round(selectedYears.length * 3)} minutes)
                </p>
            </div>
        </div>
    );
};

type SettingsSetupWindowProps = {
    onClose: () => void;
};

const SettingsSetupWindow = ({ onClose }: SettingsSetupWindowProps): React.ReactNode => {
    const [saveCredentialsOpen, setSaveCredentialsOpen] = useState(false);

    const handleNext = () => {
        onClose && onClose();
    };

    const onSaveCredentialsClose = ({ success }: { success: boolean }) => {
        if (success) {
            onClose && onClose();
        }

        setSaveCredentialsOpen(false);
    };

    return (
        <div className="space-y-4">
            <SaveCredentialsDialog open={saveCredentialsOpen} onClose={onSaveCredentialsClose} />
            <div className="flex justify-between items-center space-x-4">
                <div>
                    <h1 className="text-2xl font-bold">Finish Setup</h1>
                </div>
                <div className="w-12 h-12 rounded-full bg-violet-500 text-white min-w-[3rem]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6 p-3">
                        <path
                            fillRule="evenodd"
                            d="M12 3.75a6.715 6.715 0 0 0-3.722 1.118.75.75 0 1 1-.828-1.25 8.25 8.25 0 0 1 12.8 6.883c0 3.014-.574 5.897-1.62 8.543a.75.75 0 0 1-1.395-.551A21.69 21.69 0 0 0 18.75 10.5 6.75 6.75 0 0 0 12 3.75ZM6.157 5.739a.75.75 0 0 1 .21 1.04A6.715 6.715 0 0 0 5.25 10.5c0 1.613-.463 3.12-1.265 4.393a.75.75 0 0 1-1.27-.8A6.715 6.715 0 0 0 3.75 10.5c0-1.68.503-3.246 1.367-4.55a.75.75 0 0 1 1.04-.211ZM12 7.5a3 3 0 0 0-3 3c0 3.1-1.176 5.927-3.105 8.056a.75.75 0 1 1-1.112-1.008A10.459 10.459 0 0 0 7.5 10.5a4.5 4.5 0 1 1 9 0c0 .547-.022 1.09-.067 1.626a.75.75 0 0 1-1.495-.123c.041-.495.062-.996.062-1.503a3 3 0 0 0-3-3Zm0 2.25a.75.75 0 0 1 .75.75c0 3.908-1.424 7.485-3.781 10.238a.75.75 0 0 1-1.14-.975A14.19 14.19 0 0 0 11.25 10.5a.75.75 0 0 1 .75-.75Zm3.239 5.183a.75.75 0 0 1 .515.927 19.417 19.417 0 0 1-2.585 5.544.75.75 0 0 1-1.243-.84 17.915 17.915 0 0 0 2.386-5.116.75.75 0 0 1 .927-.515Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            </div>
            <div>
                <p className="text-md text-gray-300">
                    You can now save your credentials to login automatically in the future.
                </p>
            </div>
            <button
                onClick={() => setSaveCredentialsOpen(true)}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-600 transition text-white rounded-md px-4 py-3 w-full">
                Save Credentials
            </button>
            <div className="flex justify-center items-center">
                <p onClick={handleNext} className="text-xs text-gray-400 cursor-pointer">
                    Skip for now
                </p>
            </div>
        </div>
    );
};

type FinishSetupWindowProps = {
    onClose: () => void;
};

const FinishSetupWindow = ({ onClose }: FinishSetupWindowProps): React.ReactNode => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center space-x-4">
                <div>
                    <h1 className="text-2xl font-bold">You are all set!</h1>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white min-w-[3rem]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-6 p-3">
                        <path
                            fillRule="evenodd"
                            d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            </div>
            <div>
                <p className="text-md text-gray-300">
                    Thank You for setting up Ilias Ultimate! You can now start using the application.{' '}
                    <a
                        href="https://rjks.us"
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-500 hover:underline">
                        Check out my Website
                    </a>{' '}
                    or this{' '}
                    <a
                        href="https://github.com/robert-kratz/ilias-uni-mannheim-wrapper"
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-500 hover:underline">
                        Github Repository
                    </a>
                </p>
            </div>
            <button
                onClick={() => onClose()}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-600 transition text-white rounded-md px-4 py-3 w-full">
                Try out Now!
            </button>
        </div>
    );
};
