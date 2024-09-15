import debounce from 'debounce';
import { Suspense, useEffect, useState } from 'react';
import { SearchDataResponseItem, StaticContentAlert } from '../types/objects';
import { StaticContentAlertSection } from '../components/Alerts';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { AppDispatch } from '../state/store';
import { setCurrentSearchQuery, setSearchResults } from '../state/stateSlice';
import FavouriteBadge from '../components/FavouriteBadge';
import { StoreType } from '../utils/appStorage';

const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
};

export default function SearchPage() {
    const appState = useSelector((state: RootState) => state.app);
    const dispatch: AppDispatch = useDispatch();

    const [staticContentAlert, setStaticContentAlert] = useState<StaticContentAlert[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentApplicationState, setCurrentApplicationState] = useState<StoreType | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<SearchDataResponseItem[]>([]);
    const [currentSearchState, setCurrentSearchState] = useState<EntitySearchCurrentState>('none');

    const filteredSearchResults = searchResults.filter((result) => {
        if (currentSearchState === 'files') {
            return result.matchingEntityType === 'file';
        } else if (currentSearchState === 'directories') {
            return result.matchingEntityType === 'directory';
        } else if (currentSearchState === 'courses') {
            return result.matchingEntityType === 'course';
        } else {
            return true;
        }
    });

    const search = debounce((query: string, year: string | null) => {
        if (window.api) {
            window.api.onSearch(query, year).then((value) => {
                // dispatch(setSearchResults({ searchResults: value }));
                setSearchResults(value);
                setLoading(false);
                console.log('search results', value);
            });
        }
    }, 800);

    const enterQuery = (query: string) => {
        setLoading(true);
        dispatch(setCurrentSearchQuery({ currentSearchQuery: query }));
        search(query, selectedYear);
    };

    useEffect(() => {
        const fetchApplicationState = async () => {
            if (window.api) {
                window.api.getStaticContent().then((value) => {
                    setStaticContentAlert(value);
                    console.log('fetched static content', value);
                });
                window.api.getApplicationState().then((value) => {
                    setCurrentApplicationState(value);
                    console.log('fetched application state', value);
                });
            }
        };

        console.log('fetching application state');

        setLoading(true);
        fetchApplicationState();

        const onReload = () => {
            fetchApplicationState();
        };

        window.api.onReload(onReload);

        setLoading(false);

        return () => {
            window.api.removeReloadListener(onReload);
        };
    }, []);

    return (
        <div className="space-y-4">
            {/* {staticContentAlert && staticContentAlert.length > 0 ? (
                <StaticContentAlertSection alerts={staticContentAlert} />
            ) : null} */}
            <div className="flex justify-between items-center py-4">
                <div className="w-full relative">
                    <input
                        type="text"
                        onChange={(e) => enterQuery(e.target.value)}
                        value={appState.currentSearchQuery}
                        placeholder="Search for a Directory, File or Courses"
                        className="w-full text-white p-4 border border-dark-gray bg-dark-gray-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {loading && (
                        <div className="absolute w-6 h-6 min-w-[1.5rem] border-4 border-t-4 border-gray-300 border-t-indigo-500 rounded-full animate-spin right-4 top-4"></div>
                    )}
                </div>
                <EntitySearchOptions currentlySelected={currentSearchState} onChanges={setCurrentSearchState} />
            </div>
            <div className="space-y-2">
                <span className="text-gray-300 text-sm">Search for a specific year:</span>
                <div className="flex justify-start w-full space-x-2 overflow-x-scroll">
                    {currentApplicationState?.selectedYears?.map((year, index) => {
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
                                    'flex justify-center items-center p-3 px-4 bg-dark-gray-2 hover:bg-dark-gray-3 cursor-pointer rounded-md transition border-2 shadow-md',
                                    selected ? 'border-emerald-600' : 'border-dark-gray'
                                )}>
                                <span className="text-gray-300 text-sm">{year}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="flex justify-between items-center sticky top-0 bg-dark-gray rounded-b-md z-10">
                <h2 className="text-gray-100 text-lg font-semibold p-4">
                    Search Results {selectedYear && ` found in ${selectedYear}`}
                </h2>
                <p className="text-gray-300 text-sm p-4">{filteredSearchResults.length} results found</p>
            </div>
            <div className="w-full p-2 space-y-4">
                <Suspense fallback={<div>Loading...</div>}>
                    {filteredSearchResults.map((result, index) => (
                        <SearchResultItem key={index} item={result} />
                    ))}
                </Suspense>
            </div>
        </div>
    );
}

export function SearchResultItem({ item }: { item: SearchDataResponseItem }) {
    return (
        <div className="p-4 bg-dark-gray-2 hover:scale-[100.75%] transition rounded-md w-full flex justify-between items-center cursor-pointer">
            <div className="flex justify-start items-center space-x-2 ">
                <div className="w-10 h-10 p-1">
                    {item.matchingEntityType === 'file' ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6 text-indigo-500">
                            <path
                                fillRule="evenodd"
                                d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
                                clipRule="evenodd"
                            />
                            <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                        </svg>
                    ) : item.matchingEntityType === 'directory' ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6 text-emerald-500">
                            <path d="M19.906 9c.382 0 .749.057 1.094.162V9a3 3 0 0 0-3-3h-3.879a.75.75 0 0 1-.53-.22L11.47 3.66A2.25 2.25 0 0 0 9.879 3H6a3 3 0 0 0-3 3v3.162A3.756 3.756 0 0 1 4.094 9h15.812ZM4.094 10.5a2.25 2.25 0 0 0-2.227 2.568l.857 6A2.25 2.25 0 0 0 4.951 21H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-2.227-2.568H4.094Z" />
                        </svg>
                    ) : item.matchingEntityType === 'course' ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6 text-violet-500">
                            <path
                                fillRule="evenodd"
                                d="M2.25 5.25a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 0 1-.53 1.28h-9a.75.75 0 0 1-.53-1.28l.621-.622a2.25 2.25 0 0 0 .659-1.59V18h-3a3 3 0 0 1-3-3V5.25Zm1.5 0v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    ) : null}
                </div>
                <div>
                    <h3 className="text-white space-x-2 flex justify-start items-center">
                        {item.parentId !== item.courseId && item.parentId != null && (
                            <>
                                <span className="text-gray-300 text-sm">{item.parentName}</span>
                                <span>/</span>
                            </>
                        )}
                        <span>
                            {item.name.length + (item.parentName?.length || 0) > 80
                                ? item.name.slice(0, 80) + '...'
                                : item.name}
                        </span>
                    </h3>
                    {item.matchingEntityType !== 'course' && (
                        <p className="text-gray-400 text-xs space-x-2">
                            <span>In: {item.courseTitle}</span>
                        </p>
                    )}
                </div>
            </div>
            <div className="flex justify-end items-center space-x-3">
                {item.matchingEntityType == 'directory' && <FavouriteBadge item={item} key={item.id} />}
                <div className="text-gray-300 w-10 h-10 p-2 cursor-pointer">
                    {item.matchingEntityType === 'file' ? (
                        <a
                            target="_blank"
                            href={`https://ilias.uni-mannheim.de/goto.php?target=${item.id}&client_id=ILIAS`}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6">
                                <path d="M12 1.5a.75.75 0 0 1 .75.75V7.5h-1.5V2.25A.75.75 0 0 1 12 1.5ZM11.25 7.5v5.69l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V7.5h3.75a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h3.75Z" />
                            </svg>
                        </a>
                    ) : item.matchingEntityType === 'directory' ? (
                        <a
                            target="_blank"
                            href={`https://ilias.uni-mannheim.de/ilias.php?baseClass=ilrepositorygui&cmd=view&ref_id=${item.id?.replace(
                                'd-',
                                ''
                            )}`}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6">
                                <path
                                    fillRule="evenodd"
                                    d="M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L8.03 17.03a.75.75 0 0 1-1.06-1.06L19.19 3.75h-3.44a.75.75 0 0 1 0-1.5Zm-10.5 4.5a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V10.5a.75.75 0 0 1 1.5 0v8.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V8.25a3 3 0 0 1 3-3h8.25a.75.75 0 0 1 0 1.5H5.25Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </a>
                    ) : item.matchingEntityType === 'course' ? (
                        <a
                            target="_blank"
                            href={`https://ilias.uni-mannheim.de/ilias.php?baseClass=ilrepositorygui&cmd=view&ref_id=${item.id?.replace(
                                'c-',
                                ''
                            )}`}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6">
                                <path
                                    fillRule="evenodd"
                                    d="M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L8.03 17.03a.75.75 0 0 1-1.06-1.06L19.19 3.75h-3.44a.75.75 0 0 1 0-1.5Zm-10.5 4.5a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V10.5a.75.75 0 0 1 1.5 0v8.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V8.25a3 3 0 0 1 3-3h8.25a.75.75 0 0 1 0 1.5H5.25Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </a>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

type EntitySearchCurrentState = 'files' | 'directories' | 'courses' | 'none';

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
        <div className="bg-dark-gray-2 border-dark-gray border flex justify-end items-center divide-x-2 divide-dark-gray rounded-r-md font-light text-gray-300 cursor-pointer">
            <button
                onClick={() => changeState('files')}
                className={classNames(
                    'p-4 focus:outline-none focus:ring-0',
                    currentState === 'files' ? 'bg-indigo-600 hover:bg-indigo-700' : ''
                )}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6 w-6 h-6">
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
                    currentState === 'courses' ? 'bg-indigo-600 hover:bg-indigo-700' : ''
                )}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6 w-6 h-6">
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
                    'p-4 focus:outline-none focus:ring-0',
                    currentState === 'directories' ? 'bg-indigo-600 hover:bg-indigo-700' : ''
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
