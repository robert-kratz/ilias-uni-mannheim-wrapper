import React from 'react';
import { Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import Home from './app/pages/Home';
import Tutorial from './app/pages/Tutorial';

const AppRoutes: React.FC = () => {
    if (process.env.NODE_ENV === 'development') {
        console.log('Development Mode');
    }

    return (
        <>
            <HashRouter basename="/">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </HashRouter>
        </>
    );
};

export default AppRoutes;
