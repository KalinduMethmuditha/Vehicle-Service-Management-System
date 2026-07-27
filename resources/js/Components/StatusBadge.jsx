const statusClasses = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-indigo-100 text-indigo-700',
    pending: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    paid: 'bg-emerald-100 text-emerald-700',
    low: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ status }) {
    const label = String(status ?? 'unknown')
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                statusClasses[status] ??
                'bg-slate-100 text-slate-700'
            }`}
        >
            {label}
        </span>
    );
}