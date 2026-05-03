import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'indigo' | 'pink' | 'yellow' | 'slate';
  sub?: string;
}

const colors = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  red: 'bg-red-50 text-red-600',
  orange: 'bg-orange-50 text-orange-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  pink: 'bg-pink-50 text-pink-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  slate: 'bg-slate-50 text-slate-600',
} as const;

export default function StatCard({ label, value, icon: Icon, color, sub }: StatCardProps) {
  const colorClass = colors[color as keyof typeof colors] || colors.blue;
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm flex items-start gap-4">
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
