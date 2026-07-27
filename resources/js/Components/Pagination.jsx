import { Link } from '@inertiajs/react';

export default function Pagination({ links = [] }) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <div className="flex flex-wrap justify-center gap-1 border-t border-slate-200 px-5 py-4">
            {links.map((link, index) => {
                const classes = `rounded-lg px-3 py-2 text-sm font-medium ${
                    link.active
                        ? 'bg-blue-700 text-white'
                        : link.url
                          ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                          : 'cursor-not-allowed bg-slate-100 text-slate-400'
                }`;

                if (!link.url) {
                    return (
                        <span
                            key={index}
                            className={classes}
                            dangerouslySetInnerHTML={{
                                __html: link.label,
                            }}
                        />
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
                        preserveScroll
                        className={classes}
                        dangerouslySetInnerHTML={{
                            __html: link.label,
                        }}
                    />
                );
            })}
        </div>
    );
}