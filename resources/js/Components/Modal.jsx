const widths = {
    md: 'max-w-md',
    lg: 'max-w-2xl',
};

export default function Modal({
    open,
    title,
    children,
    onClose,
    width = 'md',
}) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                className="absolute inset-0 bg-slate-950/50"
                onClick={onClose}
                aria-label="Close modal"
            />

            <div
                className={`relative w-full rounded-xl bg-white shadow-xl ${
                    widths[width] ?? widths.md
                }`}
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    >
                        ✕
                    </button>
                </div>

                <div className="max-h-[80vh] overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}