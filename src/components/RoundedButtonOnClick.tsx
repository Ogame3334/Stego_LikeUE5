'use client'

import { ReactNode } from "react";

export default function RoundedButtonOnClick({onClick, children}: {onClick: Function, children: ReactNode}) {
    return (<button
    className="round-button w-auto rounded-full px-4 py-2 border border-black bg-white" 
    onClick={()=>{onClick()}}
    role="button"
    >
    {children}
    </button>
    )
}
