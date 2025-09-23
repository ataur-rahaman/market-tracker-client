import React from 'react';
import { Outlet } from 'react-router';

const VendorDashboard = () => {
    return (
        <div>
            <Outlet></Outlet>
        </div>
    );
};

export default VendorDashboard;