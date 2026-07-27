const toneClasses = {
    blue: 'border-blue-500 bg-blue-50 text-blue-700',
    green: 'border-emerald-500 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-500 bg-amber-50 text-amber-700',
    red: 'border-red-500 bg-red-50 text-red-700',
};

export default function StatCard({
    title,
    value,
    tone = 'blue',
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div
                className={`inline-flex rounded-lg border-l-4 px-3 py-1.5 text-xs font-semibold ${
                    toneClasses[tone] ?? toneClasses.blue
                }`}
            >
                {title}
            </div>

            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                {value ?? 0}
            </p>
        </div>
    );
}