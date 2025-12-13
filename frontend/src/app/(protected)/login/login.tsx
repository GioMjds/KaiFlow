'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useLogin } from '@/hooks/useUserAuth';
import { Canvas } from '@react-three/fiber';
import { ThreeDScene } from '@/components/three/3DScene';
import Link from 'next/link';
import { LoginUserDto } from '@/types/dto/login-user.dto';

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
						<div className="flex items-center gap-3 mb-6">
							<div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									className="text-primary"
								>
									<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
								</svg>
							</div>
							<h1 className="text-2xl font-semibold text-foreground">
								kaiflow
							</h1>
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
									<svg
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										className="text-muted"
									>
										<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
										<polyline points="22,6 12,13 2,6" />
									</svg>
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
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
								>
									{showPassword ? (
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										>
											<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
											<line
												x1="1"
												y1="1"
												x2="23"
												y2="23"
											/>
										</svg>
									) : (
										<svg
											width="20"
											height="20"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										>
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
											<circle cx="12" cy="12" r="3" />
										</svg>
									)}
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
							<motion.button
								type="button"
								whileHover={{ scale: 1.01 }}
								whileTap={{ scale: 0.99 }}
								className="w-full py-3 bg-black hover:bg-background text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
								</svg>
								Log in with GitHub
							</motion.button>

							<motion.button
								type="button"
								whileHover={{ scale: 1.01 }}
								whileTap={{ scale: 0.99 }}
								className="w-full py-3 bg-white hover:bg-gray-100 text-black font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
							>
								<svg width="20" height="20" viewBox="0 0 24 24">
									<path
										fill="#4285F4"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									/>
									<path
										fill="#34A853"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="#FBBC05"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									/>
									<path
										fill="#EA4335"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									/>
								</svg>
								Log in with Google
							</motion.button>
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
				className="hidden lg:block lg:w-3/4 relative overflow-hidden"
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
