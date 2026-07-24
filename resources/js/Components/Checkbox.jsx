export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'h-4 w-4 rounded border-gray-300 text-[#2563EB] shadow-sm focus:ring-[#2563EB] ' +
                className
            }
        />
    );
}
