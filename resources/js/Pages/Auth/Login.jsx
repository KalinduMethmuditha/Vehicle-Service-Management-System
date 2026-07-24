import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Welcome back</h1>
                <p className="mt-2 text-sm leading-6 text-gray-500">Sign in to manage your vehicle service operations.</p>
            </div>

            {status && (
                <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-[#1E3A8A]">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-[#2563EB] transition hover:text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
                        >
                            Forgot your password?
                        </Link>
                    )}

                </div>
                <PrimaryButton className="w-full" disabled={processing}>Log in</PrimaryButton>
            </form>
            <p className="mt-6 text-center text-sm text-gray-500">New to Vehicle Service? <Link href={route('register')} className="font-medium text-[#2563EB] hover:text-[#1E3A8A]">Create an account</Link></p>
        </GuestLayout>
    );
}
