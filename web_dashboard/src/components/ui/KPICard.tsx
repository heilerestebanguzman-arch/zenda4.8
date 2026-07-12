interface KPICardProps {
  title: string;
  value: number;
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  red: 'bg-red-50 border-red-200 text-red-700',
};

export const KPICard = ({ title, value, icon, color = 'blue' }: KPICardProps) => {
  return (
    <div className={`rounded-xl border p-6 shadow-sm ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
};
