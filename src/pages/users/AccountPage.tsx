import { Outlet } from "react-router-dom";
import AccountSideNav from "../../components/client/AccountSideNav";
import React from "react";

// Dùng container giống homepage
const Container: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
                                                                                  className = "",
                                                                                  children,
                                                                              }) => (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
        {children}
    </div>
);

export default function AccountPage() {
    return (
        // flex-1 để footer luôn đẩy xuống cuối
        <div className="flex-1 bg-gray-50">
            <Container className="py-4">
                <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-4">
                    <AccountSideNav />
                    <div className="min-h-0">
                        <Outlet />
                    </div>
                </div>
            </Container>
        </div>
    );
}
