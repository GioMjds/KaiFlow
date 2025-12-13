'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLogout } from '@/hooks/useUserAuth';
import { useUIStore } from '@/stores/UIStores';
import kaiflow from "@/../public/kaiflow.svg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

export default function Sidebar() {
	const { isSidebarOpen, setIsSidebarOpen } = useUIStore();

	// Replace this with actual chat history data as needed
	const chatHistory = [
		{
			section: 'Today',
			chats: ['Sidebar Design with Motion/Re...'],
		},
		{
			section: '7 Days',
			chats: ['Redesign Page with Dark, Refle...'],
		},
		{
			section: '30 Days',
			chats: [
				'KeyboardAvoidingView and Mo...',
				'Custom Modal Component wit...',
				'Custom Dialog Component wit...',
				'Enhancing Inventory Screen UI...',
				'Custom Modal with NativeWind...',
			],
		},
		{
			section: '2025-10',
			chats: ['Integrate Down Payment in Roo...'],
		},
	];

	return (
		<motion.aside
			initial={{ width: 280 }}
			animate={{ width: isSidebarOpen ? 80 : 280 }}
			transition={{ duration: 0.3, ease: 'easeInOut' }}
			className="fixed left-0 top-0 h-screen bg-[#151515] border-r border-[#2a2a2a] flex flex-col overflow-hidden z-50"
		>
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b border-[#2a2a2a] min-h-[68px]">
				{!isSidebarOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="flex items-center gap-2"
					>
						<Image src={kaiflow} alt="kaiflow Logo" width={90} height={90} />
					</motion.div>
				)}

				<button
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors shrink-0"
					aria-label={
						isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'
					}
				>
					<FontAwesomeIcon icon={faBars} size='lg' />
				</button>
			</div>

			{/* New Chat Button */}
			{!isSidebarOpen && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}
					className="p-4"
				>
					<button className="w-full bg-[#404040] hover:bg-[#4a4a4a] text-foreground py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<circle cx="12" cy="12" r="10" />
							<line x1="12" y1="8" x2="12" y2="16" />
							<line x1="8" y1="12" x2="16" y2="12" />
						</svg>
						New chat
					</button>
				</motion.div>
			)}

			{/* Chat History */}
			{!isSidebarOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3, delay: 0.2 }}
					className="flex-1 overflow-y-auto px-4 pb-4"
					style={{
						scrollbarWidth: 'thin',
						scrollbarColor: '#404040 transparent',
					}}
				>
					{chatHistory.map((section, idx) => (
						<div key={idx} className="mb-6">
							<h3 className="text-muted text-sm font-medium mb-2 px-2">
								{section.section}
							</h3>
							<div className="space-y-1">
								{section.chats.map((chat, chatIdx) => (
									<motion.button
										key={chatIdx}
										whileHover={{
											backgroundColor: '#2a2a2a',
										}}
										whileTap={{ scale: 0.98 }}
										className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
											section.section === 'Today' &&
											chatIdx === 0
												? 'bg-[#2a2a2a] text-foreground'
												: section.section === '2025-10'
												? 'text-accent'
												: 'text-foreground hover:bg-[#2a2a2a]'
										}`}
									>
										<span className="text-sm line-clamp-1">
											{chat}
										</span>
									</motion.button>
								))}
							</div>
						</div>
					))}
				</motion.div>
			)}

			{/* User Profile */}
			{!isSidebarOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3, delay: 0.3 }}
					className="border-t border-[#2a2a2a] p-4"
				>
					<button className="w-full flex items-center gap-3 hover:bg-[#2a2a2a] p-2 rounded-lg transition-colors">
						<div className="w-10 h-10 rounded-full bg-linear-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-medium">
							GM
						</div>
						<span className="text-foreground font-medium flex-1 text-left">
							Gio Majadas
						</span>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-muted"
						>
							<circle cx="12" cy="12" r="1" />
							<circle cx="12" cy="5" r="1" />
							<circle cx="12" cy="19" r="1" />
						</svg>
					</button>
				</motion.div>
			)}

			{/* Collapsed State Icon */}
			{isSidebarOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
					className="flex-1 flex flex-col items-center gap-4 p-4"
				>
					<button
						className="p-3 bg-[#404040] hover:bg-[#4a4a4a] rounded-lg transition-colors"
						aria-label="New chat"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<circle cx="12" cy="12" r="10" />
							<line x1="12" y1="8" x2="12" y2="16" />
							<line x1="8" y1="12" x2="16" y2="12" />
						</svg>
					</button>
				</motion.div>
			)}

			{/* User Profile - Collapsed State */}
			{isSidebarOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3, delay: 0.1 }}
					className="border-t border-[#2a2a2a] p-4"
				>
					{/* Replace with the actual profile details */}
					<button
						className="w-full flex items-center justify-center hover:bg-[#2a2a2a] p-2 rounded-lg transition-colors"
						aria-label="User menu"
					>
						<div className="w-8 h-8 rounded-full bg-linear-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-medium">
							GM
						</div>
					</button>
				</motion.div>
			)}
		</motion.aside>
	);
}
