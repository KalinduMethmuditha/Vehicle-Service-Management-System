import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-8"><h1 className="text-2xl font-semibold tracking-tight text-gray-900">Reset your password</h1><p className="mt-2 text-sm leading-6 text-gray-500">Enter your email address and we'll send you a link to choose a new password.</p></div>

            {status && (
                <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-[#1E3A8A]">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={(e) => setData('email', e.target.value)}
                />

                <InputError message={errors.email} className="mt-2" />

                <PrimaryButton className="w-full" disabled={processing}>Send reset link</PrimaryButton>
            </form>
            <p className="mt-6 text-center text-sm text-gray-500"><Link href={route('login')} className="font-medium text-[#2563EB] hover:text-[#1E3A8A]">Back to sign in</Link></p>
        </GuestLayout>
    );
}
