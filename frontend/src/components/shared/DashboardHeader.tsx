import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface DashboardHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function DashboardHeader({ icon: Icon, title, subtitle, actions }: DashboardHeaderProps) {
  return (
    <header className="surface-card border-b border-subtle shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="primary-bg p-2.5 rounded-xl shadow-lg">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary dark:text-white">{title}</h1>
              {subtitle && <p className="text-sm text-secondary dark:text-gray-400">{subtitle}</p>}
            </div>
          </div>
          {actions}
        </div>
      </div>
    </header>
  );
}