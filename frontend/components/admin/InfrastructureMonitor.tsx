"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Activity, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface ServiceHealth {
    service: string;
    status: "healthy" | "degraded" | "unhealthy" | "unknown";
    latency: number | null;
    url: string;
    error?: string;
}

export function InfrastructureMonitor() {
    const { data, isValidating } = useSWR(
        '/admin/infrastructure/health',
        fetcher,
        { refreshInterval: 5000 } // Refresh every 5 seconds
    );

    const services: ServiceHealth[] = data?.services || [];
    const overallStatus = data?.overall_status || 'unknown';

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'degraded':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'unhealthy':
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            default:
                return <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'border-green-500/50 bg-green-500/10';
            case 'degraded':
                return 'border-yellow-500/50 bg-yellow-500/10';
            case 'unhealthy':
                return 'border-red-500/50 bg-red-500/10';
            default:
                return 'border-gray-500/50 bg-gray-500/10';
        }
    };

    return (
        <div className="border border-[#00F2FF]/30 rounded-lg bg-[#252525]/50 backdrop-blur">
            {/* Header */}
            <div className="p-6 border-b border-[#00F2FF]/20">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#00F2FF]">Infrastructure Health</h2>
                    <div className="flex items-center gap-2">
                        {isValidating && <Loader2 className="h-4 w-4 text-[#00F2FF] animate-spin" />}
                        <span className="text-xs text-gray-400 font-mono">
                            Last updated: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '--:--:--'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Service Cards */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                    <div
                        key={service.service}
                        className={`p-4 rounded-lg border ${getStatusColor(service.status)} transition-all`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                {getStatusIcon(service.status)}
                                <div>
                                    <h3 className="font-bold text-white">{service.service}</h3>
                                    <p className="text-xs text-gray-400 font-mono">{service.url}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${service.status === 'healthy' ? 'bg-green-500/20 text-green-400' :
                                    service.status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
                                        service.status === 'unhealthy' ? 'bg-red-500/20 text-red-400' :
                                            'bg-gray-500/20 text-gray-400'
                                }`}>
                                {service.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-400">Latency</span>
                                <p className="text-white font-mono font-bold">
                                    {service.latency !== null ? `${service.latency}ms` : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-400">Memory</span>
                                <p className="text-white font-mono font-bold">
                                    N/A {/* TODO: Integrate Cloud Monitoring */}
                                </p>
                            </div>
                        </div>

                        {service.error && (
                            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded">
                                <p className="text-xs text-red-400 font-mono">{service.error}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Overall Status */}
            <div className="p-4 border-t border-[#00F2FF]/20 flex items-center justify-between">
                <span className="text-sm text-gray-400">Overall System Status</span>
                <span className={`px-3 py-1 rounded font-bold text-sm uppercase ${overallStatus === 'healthy' ? 'bg-green-500/20 text-green-400' :
                        'bg-yellow-500/20 text-yellow-400'
                    }`}>
                    {overallStatus}
                </span>
            </div>
        </div>
    );
}
