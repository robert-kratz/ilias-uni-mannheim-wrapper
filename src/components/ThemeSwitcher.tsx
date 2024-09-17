import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { setThemeMode } from '../state/stateSlice';

const ThemeSwitcher = () => {
    const dispatch = useDispatch();
    const mode = useSelector((state: RootState) => state.app.themeMode);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setThemeMode({ themeMode: event.target.value as 'light' | 'dark' | 'system' }));
    };

    return (
        <select
            value={mode}
            onChange={handleChange}
            className="bg-light-gray-2 text-light-text-2 w-full rounded-md bg-none p-4 outline-none focus:ring-0 dark:bg-dark-gray-3 dark:text-gray-300">
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
            <option value="system">System preference</option>
        </select>
    );
};

export default ThemeSwitcher;
