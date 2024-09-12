import debounce from 'debounce';
import { Suspense, useEffect, useState } from 'react';
import { SearchDataResponseItem, StaticContentAlert } from '../types/objects';
import { StaticContentAlertSection } from '../components/Warnings';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { AppDispatch } from '../app/store';
import { setCurrentSearchQuery, setSearchResults } from '../features/stateSlice';

export default function SearchPage() {
    const appState = useSelector((state: RootState) => state.app);
    const dispatch: AppDispatch = useDispatch();

    const [staticContentAlert, setStaticContentAlert] = useState<StaticContentAlert[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const search = debounce((query: string) => {
        if (window.api) {
            window.api.onSearch(query).then((value) => {
                dispatch(setSearchResults({ searchResults: value }));
                console.log('search results', value);
            });
        }
    }, 500);

    const enterQuery = (query: string) => {
        dispatch(setCurrentSearchQuery({ currentSearchQuery: query }));
        if (query.length === 0) {
            dispatch(setSearchResults({ searchResults: [] }));
        } else {
            search(query);
        }
    };

    useEffect(() => {
        const fetchApplicationState = async () => {
            if (window.api) {
                window.api.getStaticContent().then((value) => {
                    setStaticContentAlert(value);
                    console.log('fetched static content', value);
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
        <div>
            {staticContentAlert && staticContentAlert.length > 0 ? (
                <StaticContentAlertSection alerts={staticContentAlert} />
            ) : null}
            <div className="flex justify-center items-center p-4">
                <div className="w-full max-w-lg">
                    <input
                        type="text"
                        onChange={(e) => enterQuery(e.target.value)}
                        value={appState.currentSearchQuery}
                        placeholder="Search for a Directory, Course or File Names of Files"
                        className="w-full text-white p-4 border border-dark-gray bg-dark-gray-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
            </div>
            <div className="w-full p-2 space-y-4">
                <Suspense fallback={<div>Loading...</div>}>
                    {appState.searchResults.map((result, index) => (
                        <div key={index}>
                            {result.matchingEntityType === 'course' ? (
                                <CourseResultItem item={result} />
                            ) : result.matchingEntityType === 'directory' ? (
                                <DirectoryResultItem item={result} />
                            ) : result.matchingEntityType === 'file' ? (
                                <FileResultItem item={result} />
                            ) : null}
                        </div>
                    ))}
                </Suspense>
            </div>
        </div>
    );
}

export function FileResultItem({ item }: { item: SearchDataResponseItem }) {
    return (
        <div className="p-4 bg-dark-gray-2 hover:scale-[100.75%] transition rounded-mdw-full flex justify-between items-center">
            <div className="flex justify-start items-center space-x-2 ">
                <div className="text-indigo-500 w-10 h-10 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path
                            fillRule="evenodd"
                            d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
                            clipRule="evenodd"
                        />
                        <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-white">
                        {item.fileName}
                        {item.type && `.${item.type}`} ({item.courseYear})
                    </h3>
                    <p className="text-gray-400 text-xs space-x-2">
                        <strong className="font-bold">Found in: {item.dirName}</strong>
                        <span>{item.courseTitle}</span>
                    </p>
                </div>
            </div>
            <div className="text-gray-300 w-10 h-10 p-2 cursor-pointer">
                <a
                    target="_blank"
                    href={`https://ilias.uni-mannheim.de/goto.php?target=${item.fileId}&client_id=ILIAS`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path d="M12 1.5a.75.75 0 0 1 .75.75V7.5h-1.5V2.25A.75.75 0 0 1 12 1.5ZM11.25 7.5v5.69l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V7.5h3.75a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3h3.75Z" />
                    </svg>
                </a>
            </div>
        </div>
    );
}

export function DirectoryResultItem({ item }: { item: SearchDataResponseItem }) {
    return (
        <div className="p-4 bg-dark-gray-2 hover:scale-[100.75%] transition rounded-mdw-full flex justify-between items-center">
            <div className="flex justify-start items-center space-x-2 ">
                <div className="text-emerald-500 w-10 h-10 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path d="M19.906 9c.382 0 .749.057 1.094.162V9a3 3 0 0 0-3-3h-3.879a.75.75 0 0 1-.53-.22L11.47 3.66A2.25 2.25 0 0 0 9.879 3H6a3 3 0 0 0-3 3v3.162A3.756 3.756 0 0 1 4.094 9h15.812ZM4.094 10.5a2.25 2.25 0 0 0-2.227 2.568l.857 6A2.25 2.25 0 0 0 4.951 21H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-2.227-2.568H4.094Z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-white">
                        {item.dirName} / <span className="text-gray-300 font-light">{item.fileName}</span>
                    </h3>
                    <p className="text-gray-400 text-xs">{item.courseTitle}</p>
                </div>
            </div>
            <div className="text-gray-300 w-10 h-10 p-2 cursor-pointer">
                <a
                    target="_blank"
                    href={`https://ilias.uni-mannheim.de/ilias.php?baseClass=ilrepositorygui&cmd=view&ref_id=${item.dirId?.replace(
                        'd-',
                        ''
                    )}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path
                            fillRule="evenodd"
                            d="M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L8.03 17.03a.75.75 0 0 1-1.06-1.06L19.19 3.75h-3.44a.75.75 0 0 1 0-1.5Zm-10.5 4.5a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V10.5a.75.75 0 0 1 1.5 0v8.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V8.25a3 3 0 0 1 3-3h8.25a.75.75 0 0 1 0 1.5H5.25Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </a>
            </div>
        </div>
    );
}

export function CourseResultItem({ item }: { item: SearchDataResponseItem }) {
    return (
        <div className="p-4 bg-dark-gray-2 hover:scale-[100.75%] transition rounded-mdw-full flex justify-between items-center">
            <div className="flex justify-start items-center space-x-2 ">
                <div className="text-violet-500 w-10 h-10 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path
                            fillRule="evenodd"
                            d="M2.25 5.25a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 0 1-.53 1.28h-9a.75.75 0 0 1-.53-1.28l.621-.622a2.25 2.25 0 0 0 .659-1.59V18h-3a3 3 0 0 1-3-3V5.25Zm1.5 0v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                <div>
                    <h3 className="text-white">
                        {item.fileName}
                        {item.type && `.${item.type}`} ({item.courseYear})
                    </h3>
                    <p className="text-gray-400 text-xs">{item.courseTitle}</p>
                </div>
            </div>
            <div className="text-gray-300 w-10 h-10 p-2 cursor-pointer">
                <a
                    target="_blank"
                    href={`https://ilias.uni-mannheim.de/ilias.php?baseClass=ilrepositorygui&cmd=view&ref_id=${item.dirId?.replace(
                        'd-',
                        ''
                    )}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                        <path
                            fillRule="evenodd"
                            d="M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L8.03 17.03a.75.75 0 0 1-1.06-1.06L19.19 3.75h-3.44a.75.75 0 0 1 0-1.5Zm-10.5 4.5a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V10.5a.75.75 0 0 1 1.5 0v8.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V8.25a3 3 0 0 1 3-3h8.25a.75.75 0 0 1 0 1.5H5.25Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </a>
            </div>
        </div>
    );
}
