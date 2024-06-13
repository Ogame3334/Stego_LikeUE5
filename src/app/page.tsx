'use client'
import Image from "next/image";
import RoundedButton from "../components/RoundedButton";
import { useEffect } from "react";
import Router from "next/router";

export default function Home() {
  let color_v = 0;
  // useEffect(()=>{})
  if (typeof document !== 'undefined') {
    setInterval(()=>{
      document.body.style.setProperty('--color-v', String(color_v));
      color_v += 1;
    }, 100);
  }

  return (
    <main className="w-full h-full">
      <div className="top-container w-full h-full main-container">
          <div className="w-full h-full flex flex-col justify-center items-center">
            <div className="text-9xl">
              PosaMagica
            </div>
            <RoundedButton
              href="/connection">
                <div className="text-3xl p-3">
                  Connect
                </div>
            </RoundedButton>
          </div>
        </div>
    </main>
  );
}
