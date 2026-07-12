interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: {
    label: 'Pendiente',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
  },
  IN_PROGRESS: {
    label: 'En Curso',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
  },
  COMPLETED: {
    label: 'Completado',
    bg: 'bg-green-100',
    text: 'text-green-800',
  },
  CANCELLED: {
    label: 'Cancelado',
    bg: 'bg-red-100',
    text: 'text-red-800',
  },
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.PENDING;
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};
