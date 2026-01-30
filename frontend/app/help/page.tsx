"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import {
    HelpCircle,
    Mail,
    MessageCircle,
    BookOpen,
    ChevronDown,
    ChevronUp,
    ExternalLink
} from "lucide-react";
import { useState } from "react";

export default function HelpPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            question: "How do I start the bot?",
            answer: "Navigate to the 'Live Trading' page. Ensure your Deriv API token is connected. Configure your stake and risk settings in the 'Settings' page, then click the 'Start Bot' button. The bot will automatically analyze the market and place trades based on your strategy."
        },
        {
            question: "What is the recommended minimum deposit?",
            answer: "While you can start with as little as $10, we recommend a minimum balance of $50-$100 to allow for safe risk management. Never trade with money you cannot afford to lose."
        },
        {
            question: "How do I withdraw my profits?",
            answer: "Withdrawals are handled directly through your Deriv account. Log in to Deriv.com, go to Cashier > Withdrawal, and follow their standard process. This bot does not hold your funds."
        },
        {
            question: "Is the bot running when I close the browser?",
            answer: "No. Since this is a client-side bot for security, the tab must remain open for it to trade. If you close the tab or your computer goes to sleep, the bot stops."
        },
        {
            question: "What should I do if the bot stops working?",
            answer: "First, check your internet connection. Second, refresh the page and try again. If the issue persists, check the 'Settings' to ensure your API token is still valid."
        }
    ];

    return (
        <DashboardLayout>
            <div className="p-4 md:p-10 max-w-[1600px] mx-auto w-full space-y-12">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
                    <p className="text-muted-foreground mt-2">
                        Find answers to common questions and get in touch with our team.
                    </p>
                </div>

                {/* Contact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center text-center space-y-4 hover:border-primary/50 transition-colors">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                            <Mail className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Email Support</h3>
                            <p className="text-sm text-muted-foreground mt-1">Get detailed assistance via email</p>
                        </div>
                        <a href="mailto:support@dunam.ai" className="text-sm font-medium text-primary hover:underline">
                            support@dunam.ai
                        </a>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center text-center space-y-4 hover:border-primary/50 transition-colors">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                            <MessageCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Telegram Community</h3>
                            <p className="text-sm text-muted-foreground mt-1">Join other traders for tips</p>
                        </div>
                        <a href="#" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                            Join Channel <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center text-center space-y-4 hover:border-primary/50 transition-colors">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Documentation</h3>
                            <p className="text-sm text-muted-foreground mt-1">Read the full bot manual</p>
                        </div>
                        <a href="#" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                            Read Guide <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-200"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-accent/50 transition-colors"
                                >
                                    {faq.question}
                                    {openFaq === index ? (
                                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </button>
                                {openFaq === index && (
                                    <div className="px-4 pb-4 text-sm text-muted-foreground animate-in slide-in-from-top-2 fade-in duration-200">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Note */}
                <div className="rounded-lg bg-blue-500/10 p-4 border border-blue-500/20 text-sm text-blue-600 dark:text-blue-400">
                    <p className="flex items-start gap-2">
                        <HelpCircle className="h-5 w-5 shrink-0" />
                        <span>
                            <strong>Note:</strong> We are constantly updating Dunam Ai. If you encounter a bug, please report it via email with a screenshot so we can fix it in the next update.
                        </span>
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
