"use client";

import { useState } from "react";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { InfrastructureMonitor } from "@/components/admin/InfrastructureMonitor";
import { BotAnalytics } from "@/components/admin/BotAnalytics";
import { GlobalControls } from "@/components/admin/GlobalControls";
import { BugReportViewer } from "@/components/admin/BugReportViewer";
import { FeatureRequestViewer } from "@/components/admin/FeatureRequestViewer";
import { AnnouncementsManager } from "@/components/admin/AnnouncementsManager";
import { AnnouncementHistory } from "@/components/admin/AnnouncementHistory";
import { LayoutDashboard, Users, Activity, Megaphone, Bug, Settings, Lightbulb } from "lucide-react";
import { clsx } from "clsx";

export function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'controls', label: 'Controls', icon: Settings },
        { id: 'communication', label: 'Communication', icon: Megaphone },
        { id: 'support', label: 'Support', icon: Bug },
        { id: 'features', label: 'Features', icon: Lightbulb },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <InfrastructureMonitor />
                            <GlobalControls />
                        </div>
                        <BotAnalytics />
                    </div>
                );
            case 'users':
                return <UserManagementTable />;
            case 'controls':
                return (
                    <div className="space-y-6">
                        <GlobalControls />
                    </div>
                );
            case 'communication':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AnnouncementsManager />
                        <AnnouncementHistory />
                    </div>
                );
            case 'support':
                return <BugReportViewer />;
            case 'features':
                return <FeatureRequestViewer />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Sub-navigation */}
            <div className="flex overflow-x-auto border-b border-border hide-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                            activeTab === tab.id
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="animate-in fade-in duration-300">
                {renderContent()}
            </div>
        </div>
    );
}
