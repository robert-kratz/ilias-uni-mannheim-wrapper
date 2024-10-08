import debounce from 'debounce';
import { Suspense, useEffect, useState } from 'react';

import { EntityDataResponseItem, EntitySearchCurrentState } from '../types/objects';
import { setCurrentSearchQuery, setSearchResults, setSelectedSearchFilter } from '../state/slice';
import { EntityDataListItem } from '../components/EntityDataListItem';
import useRenderState from '../hooks/useRenderState';
import classNames from '../utils/classNames';
import usePageRefresh from '../hooks/usePageRefresh';
import useApplicationState from '../hooks/useApplicationState';

type Props = {
    open: boolean;
    openDirectory: (directoryId: string) => void;
};

export default function SearchPage({ openDirectory }: Props) {
    const { appState, dispatch } = useRenderState();
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);

    const [selectedYears, setSelectedYears] = useState<string[]>([]);

    const search = debounce((query: string, year: string | null, filter?: EntitySearchCurrentState) => {
        let currentSearchFilter = filter || appState.selectedSearchFilter;

        if (window.api) {
            window.api.onSearch(query, year).then((value) => {
                const filteredSearchResults = value?.filter((result: EntityDataResponseItem) => {
                    if (currentSearchFilter === 'files') {
                        return result.matchingEntityType === 'file';
                    } else if (currentSearchFilter === 'directories') {
                        return result.matchingEntityType === 'directory';
                    } else if (currentSearchFilter === 'courses') {
                        return result.matchingEntityType === 'course';
                    } else {
                        return true;
                    }
                });

                dispatch(setSearchResults({ searchResults: filteredSearchResults }));
                setLoading(false);
                console.log('search results', filteredSearchResults);
            });
        }
    }, 800);

    const loadComponent = async () => {
        const applicationState = await useApplicationState();

        setSelectedYears(applicationState.selectedYears);
    };

    usePageRefresh(() => loadComponent());

    useEffect(() => {
        loadComponent();
    }, []);

    /**
     * Handles the search input
     * @param query The search query
     */
    const onSearchInput = (query: string) => {
        setLoading(true);
        dispatch(setCurrentSearchQuery({ currentSearchQuery: query }));
        search(query, selectedYear);
    };

    /**
     * Handles the filter change
     * @param state The current state
     */
    const onFilterChange = (state: EntitySearchCurrentState) => {
        setLoading(true);
        dispatch(setSelectedSearchFilter({ selectedSearchFilter: state }));
        search(appState.currentSearchQuery, selectedYear, state);
    };

    return (
        <div className="space-y-2">
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Settings</h1>
            <div className="flex items-center justify-between py-4">
                <div className="relative w-full">
                    <input
                        type="text"
                        onChange={(e) => onSearchInput(e.target.value)}
                        value={appState.currentSearchQuery}
                        placeholder="Search for a Directory, File or Courses"
                        className="w-full rounded-l-md border border-light-gray-3 bg-light-gray-2 p-4 text-light-text-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-dark-gray dark:bg-dark-gray-2 dark:text-dark-text-3"
                    />
                    {loading && (
                        <div className="absolute right-4 top-4 h-6 w-6 min-w-[1.5rem] animate-spin rounded-full border-4 border-t-4 border-dark-text-3 border-t-indigo-500"></div>
                    )}
                </div>
                <EntitySearchOptions currentlySelected={appState.selectedSearchFilter} onChanges={onFilterChange} />
            </div>
            <div className="space-y-2">
                <span className="text-sm text-light-text-3 dark:text-dark-text-3">Search for a specific year:</span>
                <div className="flex w-full justify-start space-x-2 overflow-x-scroll">
                    {selectedYears.map((year, index) => {
                        if (year === 'MSDNAA') return null;

                        let selected = selectedYear === year;

                        const toggleYear = () => {
                            setLoading(true);
                            if (selected) {
                                setSelectedYear(null);
                            } else {
                                setSelectedYear(year);
                            }

                            search(appState.currentSearchQuery, selectedYear === year ? null : year);
                        };

                        return (
                            <div
                                key={index}
                                onClick={toggleYear}
                                className={classNames(
                                    'flex cursor-pointer items-center justify-center rounded-md border-2 bg-light-gray-2 p-3 px-4 shadow-md transition hover:bg-light-gray-2 dark:bg-dark-gray-2 dark:hover:bg-dark-gray-3',
                                    selected
                                        ? 'border-emerald-500 dark:border-emerald-600'
                                        : 'border-light-gray-3 dark:border-dark-gray'
                                )}>
                                <span className="text-sm text-light-text-3 dark:text-dark-text-2">{year}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-b-md bg-light-gray-3 dark:bg-dark-gray">
                <h2 className="p-4 text-lg font-semibold text-light-text-2 dark:text-dark-text-2">
                    Search Results {selectedYear && ` found in ${selectedYear}`}
                </h2>
                <p className="p-4 text-sm text-light-text-2 dark:text-dark-text-2">
                    {appState?.searchResults?.length} results found
                </p>
            </div>
            <div className="w-full space-y-4 p-2">
                <Suspense fallback={<div>Loading...</div>}>
                    {appState?.searchResults?.map((result, index) => {
                        if (index > 150) return null;

                        return (
                            <EntityDataListItem
                                key={index}
                                showRoute={true}
                                item={result}
                                openDirectory={openDirectory}
                            />
                        );
                    })}
                </Suspense>
            </div>
        </div>
    );
}

type EntitySearchOptionsProps = {
    onChanges?: (state: EntitySearchCurrentState) => void;
    currentlySelected?: EntitySearchCurrentState;
};

function EntitySearchOptions({ currentlySelected, onChanges }: EntitySearchOptionsProps) {
    const [currentState, setCurrentState] = useState<EntitySearchCurrentState>(currentlySelected || 'none');

    const changeState = (state: EntitySearchCurrentState) => {
        if (currentState === state) {
            setCurrentState('none');
            onChanges && onChanges('none');
            return;
        }

        setCurrentState(state);
        onChanges && onChanges(state);
    };

    return (
        //text-light-text-2 bg-light-gray-2 border-light-gray-3
        <div className="flex cursor-pointer items-center justify-end divide-x-2 divide-light-gray-1 rounded-r-md border border-light-gray-3 bg-light-gray-2 font-light dark:divide-dark-gray dark:border-dark-gray dark:bg-dark-gray-2">
            <button
                onClick={() => changeState('files')}
                className={classNames(
                    'p-4 focus:outline-none focus:ring-0',
                    currentState === 'files'
                        ? 'bg-indigo-600 text-dark-text hover:bg-indigo-700'
                        : 'text-light-text-2 dark:text-dark-text-2'
                )}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6 h-6 w-6">
                    <path
                        fillRule="evenodd"
                        d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
                        clipRule="evenodd"
                    />
                    <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                </svg>
            </button>
            <button
                onClick={() => changeState('courses')}
                className={classNames(
                    'p-4 focus:outline-none focus:ring-0',
                    currentState === 'courses'
                        ? 'bg-violet-600 text-dark-text hover:bg-violet-700'
                        : 'text-light-text-2 dark:text-dark-text-2'
                )}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6 h-6 w-6">
                    <path
                        fillRule="evenodd"
                        d="M2.25 5.25a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 0 1-.53 1.28h-9a.75.75 0 0 1-.53-1.28l.621-.622a2.25 2.25 0 0 0 .659-1.59V18h-3a3 3 0 0 1-3-3V5.25Zm1.5 0v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5Z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
            <button
                onClick={() => changeState('directories')}
                className={classNames(
                    'rounded-r-md p-4 focus:outline-none focus:ring-0',
                    currentState === 'directories'
                        ? 'bg-emerald-600 text-dark-text hover:bg-emerald-700'
                        : 'text-light-text-2 dark:text-dark-text-2'
                )}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6 w-6- h-6">
                    <path d="M19.906 9c.382 0 .749.057 1.094.162V9a3 3 0 0 0-3-3h-3.879a.75.75 0 0 1-.53-.22L11.47 3.66A2.25 2.25 0 0 0 9.879 3H6a3 3 0 0 0-3 3v3.162A3.756 3.756 0 0 1 4.094 9h15.812ZM4.094 10.5a2.25 2.25 0 0 0-2.227 2.568l.857 6A2.25 2.25 0 0 0 4.951 21H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-2.227-2.568H4.094Z" />
                </svg>
            </button>
        </div>
    );
}
