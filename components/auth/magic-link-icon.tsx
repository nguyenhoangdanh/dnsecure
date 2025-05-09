"use client"

import { motion, type SVGMotionProps } from "framer-motion"

export const MagicLinkIcon = (props: SVGMotionProps<SVGSVGElement>) => {
    return (
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

            {/* Sparkles */}
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
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    repeatDelay: 2,
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
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    repeatDelay: 2.5,
                }}
            />
        </motion.svg>
    )
}
