import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="mb-8"><h1 className="text-2xl font-semibold tracking-tight text-gray-900">Verify your email</h1><p className="mt-2 text-sm leading-6 text-gray-500">We've sent a verification link to your email address. Open it to activate your account.</p></div>

            {status === 'verification-link-sent' && (
                <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-[#1E3A8A]">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <PrimaryButton className="w-full sm:w-auto" disabled={processing}>
                        Resend Verification Email
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-center text-sm font-medium text-[#2563EB] transition hover:text-[#1E3A8A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
                    >
                        Log Out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
