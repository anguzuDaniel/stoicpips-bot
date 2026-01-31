import Link from 'next/link';
import { ArrowRight, Book, Cpu, Activity, Layout } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="space-y-6">
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
          Complete Technical Manual
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl leading-relaxed">
          The central source of truth for the Stoicpips ecosystem. Understand the architecture, APIs, and the philosophy behind the automated trading engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          href="/user-guide"
          title="User Guide"
          description="Step-by-step instructions on setting up your bot and managing your account."
          icon={<Book className="w-6 h-6 text-blue-400" />}
        />
        <Card
          href="/stoic-strategy"
          title="Stoic Strategy"
          description="Deep dive into Supply & Demand zones and the mathematical logic of the bot."
          icon={<Activity className="w-6 h-6 text-cyan-400" />}
        />
        <Card
          href="/api-reference"
          title="API Reference"
          description="Endpoints for the Node.js backend and Python AI engine microservices."
          icon={<Book className="w-6 h-6 text-purple-400" />}
        />
        <Card
          href="/system-architecture"
          title="System Architecture"
          description="High-level overview of the components and data flow."
          icon={<Cpu className="w-6 h-6 text-emerald-400" />}
        />
        <Card
          href="/ui-ux"
          title="UI/UX System"
          description="Design guidelines for the Stoic Dark aesthetic."
          icon={<Layout className="w-6 h-6 text-pink-400" />}
        />
      </div>
    </div>
  );
}

function Card({ href, title, description, icon }: { href: string, title: string, description: string, icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-6 hover:border-slate-700 hover:bg-slate-900 transition-all duration-300"
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 border border-slate-800 group-hover:border-slate-700 transition-colors">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
        {title}
      </h3>
      <p className="mb-4 text-sm text-slate-400 leading-relaxed">
        {description}
      </p>
      <div className="flex items-center text-sm font-medium text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
        Read Documentation <ArrowRight className="ml-2 w-4 h-4" />
      </div>
    </Link>
  );
}
