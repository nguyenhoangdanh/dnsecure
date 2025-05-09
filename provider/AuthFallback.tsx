"use client"

import React from 'react';

export function AuthFallback() {
    return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Verifying authentication...</p>
            </div>
        </div>
    );
}