import React from 'react';
import { Outlet } from 'react-router';

const UserDashboard = () => {
    return (
        <div>
            <Outlet></Outlet>
        </div>
    );
};

export default UserDashboard;