import React from 'react';
import { Outlet } from 'react-router';

const AdminDashboard = () => {
    return (
        <div>
            <Outlet></Outlet>
        </div>
    );
};

export default AdminDashboard;