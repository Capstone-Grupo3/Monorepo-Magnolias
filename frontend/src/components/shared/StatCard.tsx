import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "orange" | "blue" | "green" | "purple" | "yellow";
}

const colorClasses = {
  orange: {
    bg: "from-orange-50 to-orange-100",
    border: "border-orange-200",
    text: "text-orange-700",
    valueText: "text-orange-900",
    iconBg: "bg-orange-500/20",
    iconText: "text-orange-600"
  },
  blue: {
    bg: "from-blue-50 to-blue-100",
    border: "border-blue-200",
    text: "text-blue-700",
    valueText: "text-blue-900",
    iconBg: "bg-blue-500/20",
    iconText: "text-blue-600"
  },
  green: {
    bg: "from-green-50 to-green-100",
    border: "border-green-200",
    text: "text-green-700",
    valueText: "text-green-900",
    iconBg: "bg-green-500/20",
    iconText: "text-green-600"
  },
  purple: {
    bg: "from-purple-50 to-purple-100",
    border: "border-purple-200",
    text: "text-purple-700",
    valueText: "text-purple-900",
    iconBg: "bg-purple-500/20",
    iconText: "text-purple-600"
  },
  yellow: {
    bg: "from-yellow-50 to-yellow-100",
    border: "border-yellow-200",
    text: "text-yellow-700",
    valueText: "text-yellow-900",
    iconBg: "bg-yellow-500/20",
    iconText: "text-yellow-600"
  }
};

export function StatCard({ title, value, icon: Icon, color = "orange" }: StatCardProps) {
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
