'use client'

import { useState, useEffect } from "react";
import PoseNetComponent from "@/components/PoseCamera";
import { Pose } from "@tensorflow-models/posenet";
import RoundedButtonOnClick from "@/components/RoundedButtonOnClick";

export default function Main() {
  const [pose, setPose] = useState<Pose>({ score: 0, keypoints: [] });
  const [color_v, setColor_v] = useState(0);
  // useEffect(() => {
  //   console.log(pose);
  // }, [pose]);

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
        <PoseNetComponent
          pose={pose}
          setPose={setPose}
        />
      </div>
    </main>
  )
}
