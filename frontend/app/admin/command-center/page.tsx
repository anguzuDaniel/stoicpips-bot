"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminCommandCenter() {
    return (
        <AdminLayout>
            <h1 className="text-2xl font-black tracking-tighter mb-6">Command Center</h1>
            <AdminDashboard />
        </AdminLayout>
    );
}
