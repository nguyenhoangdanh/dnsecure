"use client"

import { motion, type SVGMotionProps } from "framer-motion"

// Base props interface for all animated icons
interface AnimatedIconProps extends SVGMotionProps<SVGSVGElement> {
    isHovered?: boolean
}

export const AnimatedIcons = {
    google: ({ isHovered = false, ...props }: AnimatedIconProps) => (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            {...props}
            className={`w-5 h-5 ${props.className || ""}`}
            initial={{ rotate: 0 }}
            animate={isHovered ? { rotate: [0, -5, 0, 5, 0] } : {}}
            transition={{ duration: 0.6, ease: "easeInOut" }}
        >
            <motion.path
                fill="#EA4335"
                d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
                initial={{ opacity: 1 }}
                animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.4 }}
            />
            <motion.path
                fill="#34A853"
                d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"
                initial={{ opacity: 1 }}
                animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.4, delay: 0.1 }}
            />
            <motion.path
                fill="#4A90E2"
                d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"
                initial={{ opacity: 1 }}
                animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.4, delay: 0.2 }}
            />
            <motion.path
                fill="#FBBC05"
                d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"
                initial={{ opacity: 1 }}
                animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.4, delay: 0.3 }}
            />
        </motion.svg>
    ),

    facebook: ({ isHovered = false, ...props }: AnimatedIconProps) => (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            {...props}
            className={`w-5 h-5 ${props.className || ""}`}
            initial={{ scale: 1 }}
            animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
        >
            <motion.path
                fill="#1877F2"
                d="M24 12.073c0-5.8-4.2-10.9-10-11.9v.1c-5.8-.1-10.9 4.2-11.9 10v.1c-.1 5.8 4.2 10.9 10 11.9h.1c5.8.1 10.9-4.2 11.9-10v-.1c-.1-.1-.1-.1-.1-.1z"
                initial={{ opacity: 1 }}
                animate={
                    isHovered
                        ? {
                            opacity: [1, 0.8, 1],
                            scale: [1, 0.95, 1],
                        }
                        : {}
                }
                transition={{ duration: 0.5 }}
            />
            <motion.path
                fill="#FFFFFF"
                d="M16.4 15.1h-2.6v-6h1.3l.2-2.1h-1.5V5.9c0-.6.3-.8.8-.8h.8V3.2c-.4 0-.9-.1-1.3-.1-1.3 0-2.2.8-2.2 2.2v1.7h-1.5V9h1.5v6h-5C5.3 15 4 13.7 4 12s1.3-3 3-3h.1c1.7 0 3 1.3 3 3v6h6.3z"
                initial={{ y: 0 }}
                animate={isHovered ? { y: [0, -1, 0, 1, 0] } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
            />
        </motion.svg>
    ),

    github: ({ isHovered = false, ...props }: AnimatedIconProps) => (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            {...props}
            className={`w-5 h-5 ${props.className || ""}`}
            initial={{ rotate: 0 }}
            animate={isHovered ? { rotate: [0, 360] } : {}}
            transition={{ duration: 0.8, ease: "easeInOut" }}
        >
            <motion.path
                fill="currentColor"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"
                initial={{ pathLength: 0 }}
                animate={isHovered ? { pathLength: [0.3, 1, 0.3] } : { pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            />

            {isHovered && (
                <>
                    <motion.circle
                        cx="8"
                        cy="10"
                        r="0.5"
                        fill="currentColor"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.8] }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    />
                    <motion.circle
                        cx="16"
                        cy="10"
                        r="0.5"
                        fill="currentColor"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.8] }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                    />
                </>
            )}
        </motion.svg>
    ),

    magic: ({ isHovered = false, ...props }: AnimatedIconProps) => (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
            className={`w-5 h-5 text-purple-600 ${props.className || ""}`}
        >
            {/* Main chain link */}
            <motion.path
                d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            />
            <motion.path
                d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
            />

            {/* Sparkles - only show when hovered or always for magic icon */}
            <motion.circle
                cx="18"
                cy="6"
                r="1"
                fill="currentColor"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: [0, 1.5, 1],
                    opacity: [0, 1, 0.8],
                }}
                transition={{
                    duration: 0.5,
                    delay: 0.8,
                    repeat: isHovered ? 1 : Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    repeatDelay: isHovered ? 0 : 2,
                }}
            />

            <motion.circle
                cx="6"
                cy="18"
                r="0.5"
                fill="currentColor"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: [0, 1.5, 1],
                    opacity: [0, 1, 0.8],
                }}
                transition={{
                    duration: 0.5,
                    delay: 1.2,
                    repeat: isHovered ? 1 : Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    repeatDelay: isHovered ? 0 : 2.5,
                }}
            />
        </motion.svg>
    ),
}
