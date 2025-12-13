'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useLogin } from '@/hooks/useUserAuth';
import { Canvas } from '@react-three/fiber';
import { ThreeDScene } from '@/components/three/3DScene';
import { LoginUserDto } from '@/types/dto/login-user.dto';
import GoogleButton from '@/components/ui/GoogleButton';
import GitHubButton from '@/components/ui/GitHubButton';
import kaiflow from "@/../public/kaiflow.svg";
import Image from 'next/image';

export default function Login() {
	const [showPassword, setShowPassword] = useState<boolean>(false);

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<LoginUserDto>({
		mode: 'onSubmit',
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const loginMutation = useLogin();

	const onSubmit = async (data: LoginUserDto) => {
		try {
			await loginMutation.mutateAsync({
				email: data.email,
				password: data.password,
			});
		} catch (err: any) {
			if (err?.fieldErrors && typeof err.fieldErrors === 'object') {
				Object.entries(err.fieldErrors).forEach(([field, message]) => {
					setError(field as keyof LoginUserDto, { type: 'server', message: String(message) });
				});
			} else {
				const msg = err?.message || 'Login failed';
				setError('root' as any, { type: 'server', message: String(msg) });
			}
		}
	};

	return (
		<div className="min-h-screen flex bg-[#151515]">
			{/* Left Side - Login Form */}
			<motion.div
				initial={{ opacity: 0, x: -50 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.6 }}
				className="w-full lg:w-1/2 flex items-center justify-center p-8"
			>
				<div className="w-full max-w-md">
					{/* Logo and Header */}
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.5 }}
						className="mb-8"
					>
						<div className="flex items-center gap-3">
							<Image 
								src={kaiflow}
								alt='kaiflow Logo'
								width={170}
								height={170}
							/>
						</div>

						<h2 className="text-3xl font-semibold text-foreground mb-2">
							Welcome Back Creative!
						</h2>
						<p className="text-muted text-sm">
							We Are Happy To See You Again
						</p>
					</motion.div>

					{/* Form */}
					<motion.form
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4, duration: 0.5 }}
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-5"
					>
						{/* Email Input */}
						<div>
							<div className="relative">
								<input
									{...register('email', {
										required: 'Email is required',
										pattern: {
											value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
											message: 'Invalid email address',
										},
									})}
									type="email"
									placeholder="Enter your email"
									className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:border-[#4a7fff] transition-colors pr-12"
								/>
								<div className="absolute right-4 top-1/2 -translate-y-1/2">
									<FontAwesomeIcon icon={faEnvelope} size="lg" />
								</div>
							</div>
							{errors.email && (
								<motion.p
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									className="text-red-500 text-xs mt-1 ml-1"
								>
									{errors.email.message}
								</motion.p>
							)}
						</div>

						{/* Password Input */}
						<div>
							<div className="relative">
								<input
									{...register('password', {
										required: 'Password is required',
										minLength: {
											value: 6,
											message:
												'Password must be at least 6 characters',
										},
									})}
									type={showPassword ? 'text' : 'password'}
									placeholder="Enter your password"
									className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:border-[#4a7fff] transition-colors pr-12"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 text-foreground"
								>
									<FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size='lg' />
								</button>
							</div>
							{errors.password && (
								<motion.p
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									className="text-red-500 text-xs mt-1 ml-1"
								>
									{errors.password.message}
								</motion.p>
							)}
						</div>

						{/* Remember Me & Forgot Password */}
						<div className="flex items-center justify-end">
							<Link
								href="/forgot"
								className="text-sm text-[#4a7fff] hover:underline"
							>
								Forgot Password?
							</Link>
						</div>

						{/* Login Button */}
						<motion.button
							type="submit"
							disabled={loginMutation.isPending}
							whileHover={{ scale: 1.01 }}
							whileTap={{ scale: 0.99 }}
							className="w-full py-3 bg-[#4a7fff] hover:bg-[#3d6ae6] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loginMutation.isPending
								? 'Signing in...'
								: 'Login'}
						</motion.button>

						{(errors as any)['root']?.message && (
							<p className="mt-2 text-sm text-red-500 text-center">{(errors as any)['root']?.message}</p>
						)}

						{/* Divider */}
						<div className="flex items-center mt-2">
							<div className="flex-1 border-t border-border" />
							<span className="px-4 text-sm text-muted">OR</span>
							<div className="flex-1 border-t border-border" />
						</div>

						{/* Social Login Buttons */}
						<div className="space-y-3">
							<GitHubButton />
							<GoogleButton />
						</div>

						{/* Signup Link */}
						<div className="text-center mt-6">
							<p className="text-sm text-muted">
								Don't have an account?{' '}
								<Link
									href="/signup"
									className="text-[#4a7fff] hover:underline font-medium"
								>
									Sign up
								</Link>
							</p>
						</div>
					</motion.form>
				</div>
			</motion.div>

			{/* Right Side - 3D Geometric Shapes */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1 }}
				className="hidden lg:block lg:w-2/4 relative overflow-hidden"
			>
				<Canvas
					camera={{ position: [0, 0, 8], fov: 50 }}
					style={{ background: 'transparent' }}
				>
					<ThreeDScene single corner="bottom-right" />
				</Canvas>
			</motion.div>
		</div>
	);
}
