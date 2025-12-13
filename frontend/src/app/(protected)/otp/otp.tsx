'use client';

import { motion } from 'motion/react';
import { useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useVerifyUser, useResendOtp } from '@/hooks/useUserAuth';
import { useRouter, useSearchParams } from 'next/navigation';

type OtpFormData = {
	otp: string[];
};

export default function Otp() {
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
	const { mutateAsync: verifyUserMutateAsync, mutate: verifyUser, isPending } = useVerifyUser();
	const searchParams = useSearchParams();
	const router = useRouter();
	const email = searchParams.get('email') || '';

	const { control, handleSubmit, setValue, watch, setError, clearErrors, formState: { errors } } = useForm<OtpFormData>({
		defaultValues: {
			otp: ['', '', '', '', '', ''],
		},
	});

	const otp = watch('otp');

	const handleChange = (index: number, value: string) => {
		if (!/^\d*$/.test(value)) return;

		const newOtp = [...otp];
		newOtp[index] = value.slice(-1);
		setValue('otp', newOtp);
		// clear form-level errors
		clearErrors('root' as any);

		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}

		if (newOtp.every((digit) => digit !== '') && index === 5) {
			handleSubmit(onSubmit)();
		}
	};

	const handleKeyDown = (
		index: number,
		e: KeyboardEvent<HTMLInputElement>
	) => {
		if (e.key === 'Backspace' && !otp[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData('text').slice(0, 6);

		if (!/^\d+$/.test(pastedData)) return;

		const newOtp = [...otp];
		pastedData.split('').forEach((char, i) => {
			if (i < 6) newOtp[i] = char;
		});
		setValue('otp', newOtp);

		const lastFilledIndex = Math.min(pastedData.length - 1, 5);
		inputRefs.current[lastFilledIndex]?.focus();

		if (pastedData.length === 6) {
			handleSubmit(onSubmit)();
		}
	};

	const onSubmit = async (data: OtpFormData) => {
		const code = data.otp.join('');

		if (code.length !== 6) {
			setError('root' as any, { type: 'server', message: 'Please enter all 6 digits' });
			return;
		}

		try {
			await verifyUserMutateAsync({ email, otp: code } as any);
		} catch (err: any) {
			if (err?.fieldErrors && typeof err.fieldErrors === 'object') {
				Object.entries(err.fieldErrors).forEach(([field, message]) => {
					setError(field as any, { type: 'server', message: String(message) });
				});
			} else {
				setError('root' as any, { type: 'server', message: 'Invalid OTP. Please try again.' });
			}
			setValue('otp', ['', '', '', '', '', '']);
			inputRefs.current[0]?.focus();
		}
	};

	const resendOtpMutation = useResendOtp();

	const handleResend = async () => {
		try {
			await resendOtpMutation.mutateAsync(email);
			clearErrors('root' as any);
		} catch (err: any) {
			const msg = err?.message || 'Unable to resend OTP';
			setError('root' as any, { type: 'server', message: String(msg) });
		}
	};

	const containerVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 10 },
		visible: { opacity: 1, y: 0 },
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4 bg-primary">
			<motion.div
				className="w-full max-w-md"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				<motion.div
					variants={itemVariants}
					className="text-center mb-8"
				>
					<h1 className="text-3xl font-bold text-foreground mb-2">
						Verify Your Email
					</h1>
					<p className="text-muted text-sm">
						We've sent a 6-digit code to
					</p>
					<p className="text-foreground font-medium mt-1">{email}</p>
				</motion.div>

				<motion.form
					onSubmit={handleSubmit(onSubmit)}
					variants={itemVariants}
					className="bg-background rounded-2xl p-8 shadow-2xl border border-border"
				>
					<div className="flex justify-center gap-3 mb-6">
						{otp.map((digit, index) => (
							<Controller
								key={index}
								name={`otp.${index}` as const}
								control={control}
								render={({ field }) => (
									<motion.input
										{...field}
										ref={(el) => {
											inputRefs.current[index] = el;
										}}
										type="text"
										inputMode="numeric"
										maxLength={1}
										onChange={(e) =>
											handleChange(index, e.target.value)
										}
										onKeyDown={(e) =>
											handleKeyDown(index, e)
										}
										onPaste={handlePaste}
										disabled={isPending}
										className="w-12 h-14 text-center text-2xl font-bold bg-button text-foreground rounded-lg border-2 border-border focus:border-foreground focus:outline-none transition-all duration-200 disabled:opacity-50"
										initial={{ scale: 0.8, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{ delay: index * 0.05 }}
										whileFocus={{ scale: 1.05 }}
									/>
								)}
							/>
						))}
					</div>

					{(errors as any)['root']?.message && (
						<motion.p
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="text-red-500 text-sm text-center mb-4"
						>
							{(errors as any)['root']?.message}
						</motion.p>
					)}

					{isPending && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="flex justify-center items-center gap-2 text-muted text-sm"
						>
							<motion.div
								className="w-2 h-2 bg-foreground rounded-full"
								animate={{ scale: [1, 1.5, 1] }}
								transition={{ repeat: Infinity, duration: 1 }}
							/>
							<span>Verifying...</span>
						</motion.div>
					)}

					<motion.div
						variants={itemVariants}
						className="mt-6 text-center"
					>
						<p className="text-muted text-sm">
							Didn't receive the code?{' '}
							<button
								type="button"
								onClick={handleResend}
								className="text-foreground font-medium hover:underline focus:outline-none disabled:opacity-50"
								disabled={isPending}
							>
								Resend
							</button>
						</p>
					</motion.div>
				</motion.form>

				<motion.button
					variants={itemVariants}
					onClick={() => router.push('/signup')}
					className="mt-6 w-full text-muted text-sm hover:text-foreground transition-colors"
				>
					← Back to signup
				</motion.button>
			</motion.div>
		</div>
	);
}
