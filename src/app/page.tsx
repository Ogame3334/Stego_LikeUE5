'use client'
import RoundedButton from "../components/RoundedButton";
import { useState, useEffect } from "react";

export default function Home() {
  const [color_v, setColor_v] = useState(0);
  
  // if (typeof document !== 'undefined') {
  //   setInterval(()=>{
  //     document.body.style.setProperty('--color-v', String(color_v));
  //     color_v += 1;
  //   }, 100);
  // }
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (typeof document !== 'undefined') {
        document.body.style.setProperty('--color-v', String(color_v));
        setColor_v((prev) => prev + 1);
      }
    }, 100);

    return () => clearInterval(intervalId); // Clean up the interval on component unmount
  }, [color_v]);

  return (
    <main className="w-full h-full">
      <div className="top-container w-full h-full main-container">
          <div className="w-full h-full flex flex-col justify-center items-center">
            <div className="text-5xl md:text-8xl lg:text-9xl">
              PosaMagica
            </div>
            <RoundedButton
              href="/connection">
                <div className="text-xl md:text-3xl p-3">
                  Connect
                </div>
            </RoundedButton>
          </div>
        </div>
    </main>
  );
}
