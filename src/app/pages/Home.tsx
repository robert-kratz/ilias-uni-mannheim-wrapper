import React, { Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { logout } from '../../features/userSlice';

import { SaveCredentialsWarning } from '../../components/Warnings';

const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
};

export default function Home(): React.ReactElement {
    const user = useSelector((state: RootState) => state.user);
    const dispatch: AppDispatch = useDispatch();

    const [currentPage, setCurrentPage] = React.useState(0);
    const [currentUsername, setCurrentUsername] = React.useState('');

    const [hasCredsSaved, setHasCredsSaved] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    const routes = [
        {
            text: 'Search',
            component: <p>Search</p>,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path
                        fillRule="evenodd"
                        d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                        clipRule="evenodd"
                    />
                </svg>
            ),
            iconSelected: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path
                        fillRule="evenodd"
                        d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                        clipRule="evenodd"
                    />
                </svg>
            ),
        },
        {
            text: 'Home',
            component: <p>Home</p>,
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"
                    />
                </svg>
            ),
            iconSelected: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
                </svg>
            ),
        },
        {
            text: 'Ilias',
            component: <p>Ilias</p>,
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
                    />
                </svg>
            ),
            iconSelected: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path d="M5.625 3.75a2.625 2.625 0 1 0 0 5.25h12.75a2.625 2.625 0 0 0 0-5.25H5.625ZM3.75 11.25a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5H3.75ZM3 15.75a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75ZM3.75 18.75a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5H3.75Z" />
                </svg>
            ),
        },
        {
            text: 'Settings',
            component: <p>Settings</p>,
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6 hover:animate-spin">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
            ),
            iconSelected: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path
                        fillRule="evenodd"
                        d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.243.243a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c.071-.157.137-.316.198-.478.1-.267.327-.47.608-.517l.55-.091a1.875 1.875 0 0 0 1.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.243-.243a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.091-.55a1.875 1.875 0 0 0-1.85-1.566h-.344ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
                        clipRule="evenodd"
                    />
                </svg>
            ),
        },
    ];

    useEffect(() => {
        const fetchApplicationState = async () => {
            if (window.api) {
                window.api.getStoreValue('username').then((value) => {
                    setCurrentUsername(value);
                    console.log('Fetching application state', value);
                });

                window.api.getStoreValue('credentialsSaved').then((value) => {
                    setHasCredsSaved(value);
                });
            }
        };

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

    const pageIcons = React.useMemo(() => {
        return routes.map((route, index) => {
            if (route.text === 'Settings') {
                return null;
            }

            return (
                <NavigationListItem
                    key={index}
                    icon={route.icon}
                    selectedIcon={route.iconSelected}
                    text={route.text}
                    onClick={() => goToPage(index)}
                    selcted={currentPage === index}
                />
            );
        });
    }, [currentPage]);

    const pageComponents = React.useMemo(() => {
        return routes.map((route, index) => {
            return (
                <div key={index} className={classNames(currentPage === index ? 'block' : 'hidden')}>
                    {route.component}
                </div>
            );
        });
    }, [currentPage]);

    const goToPage = (index: number) => {
        setCurrentPage(index);
    };

    return (
        <div className="flex justify-between">
            <div className="h-screen fixed w-[5.5rem] bg-[#1e1f22] flex flex-col justify-between overflow-y-scroll">
                <div className="flex flex-col items-center divide-y-2 divide-[#313338] space-y-4">
                    <div className="mt-6 w-14 h-14 transition cursor-pointer flex justify-center items-center p-2">
                        <svg
                            width="466"
                            height="466"
                            viewBox="0 0 466 466"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M279.152 44.4249C279.955 40.659 279.492 36.7334 277.834 33.2581C276.176 29.7829 273.417 26.9526 269.984 25.2073C266.552 23.462 262.639 22.8993 258.855 23.6068C255.07 24.3143 251.624 26.2523 249.054 29.1196L51.0409 250.429C48.7924 252.943 47.3196 256.054 46.8002 259.386C46.2808 262.719 46.7371 266.13 48.114 269.209C49.4909 272.288 51.7295 274.903 54.5597 276.737C57.3898 278.572 60.6904 279.548 64.0632 279.548H217.163L186.762 421.489C185.959 425.255 186.422 429.181 188.08 432.656C189.738 436.131 192.498 438.961 195.93 440.707C199.362 442.452 203.275 443.015 207.06 442.307C210.844 441.6 214.29 439.662 216.86 436.794L414.873 215.485C417.122 212.971 418.594 209.86 419.114 206.528C419.633 203.195 419.177 199.784 417.8 196.705C416.423 193.626 414.184 191.011 411.354 189.177C408.524 187.342 405.224 186.366 401.851 186.366H248.752L279.152 44.4249Z"
                                fill="url(#paint0_linear_213_174)"
                            />
                            <defs>
                                <linearGradient
                                    id="paint0_linear_213_174"
                                    x1="232.957"
                                    y1="23.3093"
                                    x2="419"
                                    y2="704"
                                    gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#73A1FB" />
                                    <stop offset="1" stop-color="#033392" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className="py-4 text-white">{pageIcons}</div>
                </div>
                <div className="flex justify-center items-center text-white">
                    {routes.map((route, index) => {
                        if (route.text !== 'Settings') return null;

                        return (
                            <NavigationListItem
                                key={index}
                                icon={route.icon}
                                text={route.text}
                                onClick={() => goToPage(index)}
                                selcted={false}
                            />
                        );
                    })}
                </div>
            </div>
            <div className="w-full min-h-screen bg-[#313338] ml-[5.5rem] p-8">
                <SaveCredentialsWarning show={!hasCredsSaved} />
                {currentUsername && <h1 className="text-white text-2xl font-bold py-4">Welcome, {currentUsername}</h1>}
                <Suspense fallback={<div>Loading...</div>}>{pageComponents}</Suspense>
            </div>
        </div>
    );
}

type NavigationListItemProps = {
    icon: React.ReactNode;
    selectedIcon?: React.ReactNode;
    text: string;
    selcted?: boolean;
    onClick: () => void;
};

const NavigationListItem = ({
    icon,
    selectedIcon,
    text,
    onClick,
    selcted,
}: NavigationListItemProps): React.ReactElement => {
    return (
        <div
            onClick={onClick}
            className={classNames(
                'w-14 h-14 flex justify-center items-center p-4 m-4 transition cursor-pointer hover:rounded-[1.5rem] shadow-sm hover:shadow-md',
                selcted
                    ? 'bg-[#313338] hover:bg-[#2b2d31] rounded-[1.2rem]'
                    : 'bg-[#2b2d31] hover:bg-[#313338] rounded-[2rem]'
            )}>
            {selectedIcon && selcted ? selectedIcon : icon}
            <span className="sr-only">{text}</span>
        </div>
    );
};
