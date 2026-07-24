import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'block min-h-11 rounded-lg border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-[#2563EB] focus:ring-[#2563EB] ' +
                className
            }
            ref={localRef}
        />
    );
});
