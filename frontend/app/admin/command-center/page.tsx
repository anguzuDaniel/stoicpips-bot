"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { InfrastructureMonitor } from "@/components/admin/InfrastructureMonitor";
import { BotAnalytics } from "@/components/admin/BotAnalytics";
import { GlobalControls } from "@/components/admin/GlobalControls";

export default function AdminCommandCenter() {
    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Top Row: Infrastructure & Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <InfrastructureMonitor />
                    </div>
                    <div>
                        <GlobalControls />
                    </div>
                </div>

                {/* Bot Analytics */}
                <BotAnalytics />

                {/* User Management */}
                <UserManagementTable />
            </div>
        </AdminLayout>
    );
}
