import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "primary" | "success" | "warning" | "error";
}

const colorClasses = {
  primary: {
    bg: "primary-soft",
    border: "border-primary-soft",
    text: "primary-soft-text",
    valueText: "primary",
    iconBg: "primary-soft",
    iconText: "primary"
  },
  success: {
    bg: "success-soft",
    border: "border-success-soft",
    text: "success",
    valueText: "success",
    iconBg: "success-soft",
    iconText: "success"
  },
  warning: {
    bg: "warning-soft",
    border: "border-warning-soft",
    text: "warning",
    valueText: "warning",
    iconBg: "warning-soft",
    iconText: "warning"
  },
  error: {
    bg: "error-soft",
    border: "border-error-soft",
    text: "error",
    valueText: "error",
    iconBg: "error-soft",
    iconText: "error"
  }
};

export function StatCard({ title, value, icon: Icon, color = "primary" }: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div className={`bg-linear-to-br ${colors.bg} rounded-2xl p-5 border ${colors.border} shadow-xs hover:shadow-sm transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-semibold ${colors.text} mb-1`}>
            {title}
          </p>
          <p className={`text-4xl font-bold ${colors.valueText}`}>
            {value}
          </p>
        </div>
        <div className={`${colors.iconBg} p-3 rounded-xl`}>
          <Icon className={`w-8 h-8 ${colors.iconText}`} />
        </div>
      </div>
    </div>
  );
}