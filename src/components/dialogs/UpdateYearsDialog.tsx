import { useEffect, useState } from 'react';
import DialogModal from '../DialogModalTemplate';
import React from 'react';
import { createToast } from 'vercel-toast';
import { ScrapeEvent } from '../../types/objects';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { AppDispatch } from '../../state/store';
import { setUpdateYearDialogPage } from '../../state/stateSlice';

const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
};

/**
 * 1. SelectYearWindow, show a list of all available years and let the user select one or multiple.
 * 2. FetchingDataWindow, show a loading spinner while fetching data.
 * 3. FinishSetupWindow, show a success message with a button to close the dialog.
 */

type Props = {
    open: boolean;
    onForceDialogOpen?: () => void;
    onClose: ({ success }: { success: boolean }) => void;
};

export default function UpdateYearsDialog({ open, onClose, onForceDialogOpen }: Props) {
    const appState = useSelector((state: RootState) => state.app);
    const dispatch: AppDispatch = useDispatch();

    const [aviablableYears, setAviablableYears] = useState<string[]>([]);
    const [selectedYears, setSelectedYears] = useState<string[]>([]);

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

    const onWelcomeWindowClose = async ({ avaiableYears }: { avaiableYears: string[] }) => {
        setAviablableYears(avaiableYears);

        onForceDialogOpen && onForceDialogOpen();

        dispatch(
            setUpdateYearDialogPage({
                currentUpdateYearDialogPage: 1,
            })
        );
    };

    const handleCloseEvent = async ({ success }: { success: boolean }) => {
        if (!success && appState.currentUpdateYearDialogPage <= 1) {
            setTimeout(() => {
                dispatch(
                    setUpdateYearDialogPage({
                        currentUpdateYearDialogPage: 0,
                    })
                );
            }, 300);
        }

        onClose && onClose({ success });
    };

    const onYearSelectWindowClose = async ({ selectedYears }: { selectedYears: string[] }) => {
        if (selectedYears.length === 0) {
            return;
        }

        setSelectedYears(selectedYears);

        dispatch(
            setUpdateYearDialogPage({
                currentUpdateYearDialogPage: 2,
            })
        );
    };

    const onFetchDataWindowClose = async ({ success }: { success: boolean }) => {
        if (!success) {
            handleCloseEvent({ success: false });
            createToast('Error fetching data.', {
                type: 'error',
                timeout: 5000,
            });
            return;
        }

        onForceDialogOpen && onForceDialogOpen();

        if (window.api) {
            window.api.setStoreValue('selectedYears', selectedYears);
        }

        dispatch(
            setUpdateYearDialogPage({
                currentUpdateYearDialogPage: 3,
            })
        );
    };

    const onCloseFinishSetupWindow = async () => {
        handleCloseEvent({ success: true });

        //reload the app
        window.api.reloadApp();
    };

    const currentPageComponent = React.useMemo(() => {
        switch (appState.currentUpdateYearDialogPage) {
            case 0:
                return <WelcomeWindow onClose={onWelcomeWindowClose} />;
            case 1:
                return <SelectYearWindow onClose={onYearSelectWindowClose} aviablableYears={aviablableYears} />;
            case 2:
                return <FetchingDataWindow onClose={onFetchDataWindowClose} selectedYears={selectedYears} />;
            case 3:
                return <FinishSetupWindow onClose={onCloseFinishSetupWindow} />;
            default:
                return null;
        }
    }, [appState.currentUpdateYearDialogPage, open, onClose]);

    return (
        <DialogModal open={open} onClose={() => handleCloseEvent({ success: false })}>
            {currentPageComponent}
        </DialogModal>
    );
}

type WelcomeWindowProps = {
    onClose: ({ avaiableYears }: { avaiableYears: string[] }) => void;
};

const WelcomeWindow = ({ onClose }: WelcomeWindowProps): React.ReactNode => {
    useEffect(() => {
        if (window.api) {
            window.api
                .fetchYears()
                .then((years: string[]) => {
                    console.log('Fetched years:', years);
                    onClose && onClose({ avaiableYears: years });
                })
                .catch((error) => {
                    console.error('Error fetching years:', error);
                });
        }
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between space-x-4">
                <h1 className="text-2xl font-bold">Add Courses or Semester</h1>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white">
                    <div className="h-6 w-6 min-w-[1.5rem] animate-spin rounded-full border-4 border-t-4 border-indigo-500 border-t-gray-300"></div>
                </div>
            </div>
            <div>
                <p className="text-md font-light text-gray-300">
                    <strong className="font-bold text-white">Please wait until we scan for your courses.</strong>
                    <br />
                    <br />
                    In the following steps you will:
                </p>
                <ul className="text-md list-inside list-disc p-2 py-6 font-light text-gray-300">
                    <li>Select Semesters</li>
                </ul>
                <p className="text-md font-light text-gray-300">
                    The process of indexing, depending on the amount of semesters, may take a while.
                </p>
            </div>
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
        if (window.api) {
            window.api.getApplicationState().then((state) => {
                if (state.selectedYears.length > 0) {
                    setSelectedYears(state.selectedYears);
                } else {
                    setSelectedYears([aviablableYears[1]]);
                }
            });
        }
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
            <div className="flex items-center justify-between space-x-4">
                <div>
                    <h1 className="text-2xl font-bold">Select Semesters to index:</h1>
                    <p className="text-sm font-light text-gray-300">
                        Please select the semesters you want to index in this application.
                    </p>
                </div>
            </div>
            <div className="max-h-96 space-y-2 overflow-y-scroll">
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
                                'flex cursor-pointer items-center justify-between rounded-md border-2 bg-dark-gray-3 p-4 transition hover:bg-dark-gray-2',
                                isSelected ? 'border-emerald-600' : 'border-dark-gray'
                            )}>
                            <p className="text-gray-300">{year}</p>
                            {isSelected && (
                                <div className="flex h-6 w-6 items-center justify-center text-emerald-500">
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
                className="w-full rounded-md bg-indigo-500 px-4 py-3 text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-600">
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
            <div className="flex items-center justify-between space-x-4">
                <div>
                    <h1 className="text-2xl font-bold">Indexing Ilias</h1>
                </div>
            </div>
            <div className="boder-b-2 border-dark-gray-3">
                <div className="flex items-center justify-start space-x-3 rounded-md border-2 border-red-500 bg-red-400 bg-opacity-70 p-3 text-red-800">
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
                    <p className="font-medium">Do not close the application!</p>
                </div>
            </div>
            <div className="flex min-h-[5rem] items-center justify-between space-x-4 rounded-md border-2 border-dark-gray bg-dark-gray-3 p-4">
                <div className="max-w-[17rem]">
                    <p className="text-sm text-gray-300">
                        {lastScrapeEvent?.name && lastScrapeEvent?.ref_id ? (
                            <a
                                href={isFile ? fileUrl : dirUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="max-w-[17rem] truncate text-clip break-words hover:underline">
                                {lastScrapeEvent.name.length > 40
                                    ? lastScrapeEvent.name.substring(0, 40) + '...'
                                    : lastScrapeEvent.name}
                            </a>
                        ) : (
                            'Preparing...'
                        )}
                    </p>
                </div>
                <div className="h-6 w-6 min-w-[1.5rem] animate-spin rounded-full border-4 border-t-4 border-gray-300 border-t-indigo-500"></div>
            </div>
            <div>
                <p className="text-sm text-gray-300">
                    Indexing may take a while, depending on the amount of semesters. (Approx.{' '}
                    {Math.round(selectedYears.length * 1.5)} minutes)
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
            <div className="flex items-center justify-between space-x-4">
                <div>
                    <h1 className="text-2xl font-bold">You are all set!</h1>
                </div>
                <div className="h-12 w-12 min-w-[3rem] rounded-full bg-emerald-500 text-white">
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
                className="w-full rounded-md bg-indigo-500 px-4 py-3 text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-600">
                Try out Now!
            </button>
        </div>
    );
};
