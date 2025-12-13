'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faEye, faEyeSlash, faLock, faStar } from '@fortawesome/free-solid-svg-icons';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ThreeDScene } from '@/components/three/3DScene';
import { useSignup } from '@/hooks/useUserAuth';
import { SignupUserDto } from '@/types/dto/signup-user.dto';
import GitHubButton from '@/components/ui/GitHubButton';
import GoogleButton from '@/components/ui/GoogleButton';
import Image from 'next/image';
import kaiflow from "@/../public/kaiflow.svg";

export default function Signup() {
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

	const {
		register,
		handleSubmit,
		setError,
		watch,
		formState: { errors },
	} = useForm<SignupUserDto>({
		mode: 'onSubmit',
		defaultValues: {
			first_name: '',
			last_name: '',
			email: '',
			password: '',
			confirm_password: '',
		},
	});

	const password = watch('password');

	const signupMutation = useSignup();

	const onSubmit = async (data: SignupUserDto) => {
		try {
			await signupMutation.mutateAsync({
				first_name: data.first_name,
				last_name: data.last_name,
				email: data.email,
				password: data.password,
				confirm_password: data.confirm_password,
			});
		} catch (err: any) {
			if (err?.fieldErrors && typeof err.fieldErrors === 'object') {
				Object.entries(err.fieldErrors).forEach(([field, message]) => {
					setError(field as keyof SignupUserDto, { type: 'server', message: String(message) });
				});
			} else {
				const msg = err?.message || 'Signup failed';
				setError('root' as any, { type: 'server', message: String(msg) });
			}
		}
	};

	return (
		<div className="min-h-screen flex bg-[#151515] overflow-x-hidden">
			{/* Left Side - 3D Geometric Shapes */}
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
					<ThreeDScene single corner="top-left" />
				</Canvas>
			</motion.div>

			{/* Right Side - Signup Form */}
			<motion.div
				initial={{ opacity: 0, x: 50 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.6 }}
				className="w-full lg:w-1/2 flex items-center justify-center p-8 max-h-screen overflow-y-auto scrollbar-hide"
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
							Join Kaiflow Today
						</h2>
						<p className="text-muted text-sm">
							Create Your Account and Start Your Creative Journey
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
						{/* Name Inputs */}
						<div className="grid grid-cols-2 gap-4">
							{/* First Name */}
							<div>
								<input
									{...register('first_name', {
										required: 'First name is required',
										minLength: {
											value: 2,
											message: 'Name must be at least 2 characters',
										},
									})}
									type="text"
									placeholder="First name"
									className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:border-[#4a7fff] transition-colors"
								/>
								{errors.first_name && (
									<motion.p
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										className="text-red-500 text-xs mt-1 ml-1"
									>
										{errors.first_name.message}
									</motion.p>
								)}
							</div>

							{/* Last Name */}
							<div>
								<input
									{...register('last_name', {
										required: 'Last name is required',
										minLength: {
											value: 2,
											message: 'Name must be at least 2 characters',
										},
									})}
									type="text"
									placeholder="Last name"
									className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:border-[#4a7fff] transition-colors"
								/>
								{errors.last_name && (
									<motion.p
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										className="text-red-500 text-xs mt-1 ml-1"
									>
										{errors.last_name.message}
									</motion.p>
								)}
							</div>
						</div>

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
											message: 'Password must be at least 6 characters',
										},
									})}
									type={showPassword ? 'text' : 'password'}
									placeholder="Create password"
									className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:border-[#4a7fff] transition-colors pr-12"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
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

						{/* Confirm Password Input */}
						<div>
							<div className="relative">
								<input
									{...register('confirm_password', {
										required: 'Please confirm your password',
										validate: (value) =>
											value === password || 'Passwords do not match',
									})}
									type={showConfirmPassword ? 'text' : 'password'}
									placeholder="Confirm password"
									className="w-full px-4 py-3 bg-primary border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:border-[#4a7fff] transition-colors pr-12"
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword((prev) => !prev)}
									className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
								>
									<FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} size='lg' />
								</button>
							</div>
							{errors.confirm_password && (
								<motion.p
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									className="text-red-500 text-xs mt-1 ml-1"
								>
									{errors.confirm_password.message}
								</motion.p>
							)}
						</div>

						{/* Signup Button */}
						<motion.button
							type="submit"
							whileHover={{ scale: 1.01 }}
							whileTap={{ scale: 0.99 }}
							className="w-full py-3 bg-[#4a7fff] hover:bg-[#3d6ae6] cursor-pointer text-white font-semibold rounded-xl transition-colors"
						>
							Create Account
						</motion.button>

						{(errors as any)['root']?.message && (
							<p className="mt-2 text-sm text-red-500 text-center">{(errors as any)['root']?.message}</p>
						)}

						{/* Divider */}
						<div className="flex items-center mt-1">
							<div className="flex-1 border-t border-border" />
							<span className="px-4 text-sm text-muted">OR</span>
							<div className="flex-1 border-t border-border" />
						</div>

						{/* Social Signup Buttons */}
						<div className="space-y-3">
							<GitHubButton />
							<GoogleButton />
						</div>

						{/* Login Link */}
						<div className="text-center mt-6">
							<p className="text-sm text-muted">
								Already have an account?{' '}
								<Link href="/login" className="text-[#4a7fff] hover:underline font-medium">
									Log in
								</Link>
							</p>
						</div>
					</motion.form>
				</div>
			</motion.div>
		</div>
	);
}