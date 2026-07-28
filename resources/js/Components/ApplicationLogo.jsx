export default function ApplicationLogo(props) {
    return (
        <span
            {...props}
            className={`inline-flex items-center justify-center rounded-xl bg-blue-700 font-bold text-white shadow-sm ${
                props.className || 'h-10 w-10 text-base'
            }`}
        >
            VS
        </span>
    );
}
