import DashboardSidebar from '@/components/Dashboard/DashboardSidebar';
import React from 'react';

const DashboardLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen">
            <DashboardSidebar></DashboardSidebar>
            <main className='flex-1'>
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;