import Link from "next/link";
import { ReactNode } from "react";

export default function RoundedButton({href, children}: {href: string, children: ReactNode}) {
    return (<Link
    className="round-button w-auto rounded-full px-4 py-2 border border-black bg-white bg-opacity-10 hover:bg-opacity-30 active:bg-opacity-40 my-20 mx-10 float-button" 
    // onClick={()=>{onClick()}}
    // role="button"
    href={href}
    >
    {children}
    </Link>
    )
}
