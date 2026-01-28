interface ConfigureModalProps {
    showConfig: boolean;
    setShowConfig: (show: boolean) => void;
    initialConfig?: {
        riskPerTrade: number;
        maxDailyTrades: number;
        vixPairs: string[];
    };
}
export default function ConfigureModal({ showConfig, setShowConfig, initialConfig }: ConfigureModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=ConfigureModal.d.ts.map