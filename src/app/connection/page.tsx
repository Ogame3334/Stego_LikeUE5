'use client'
import { useState, useEffect } from "react";

export default function Main() {
  const [color_v, setColor_v] = useState(0);
  
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
            <div className="text-3xl md:text-6xl lg:text-7xl">
              Enter The Access Key
            </div>
          </div>
        </div>
    </main>
  );
}
