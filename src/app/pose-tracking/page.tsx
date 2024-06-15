'use client'

import { useState, useEffect } from "react";
import PoseNetComponent from "@/components/PoseCamera";
import { Pose } from "@tensorflow-models/posenet";
import RoundedButtonOnClick from "@/components/RoundedButtonOnClick";

export default function Main() {
  const [pose, setPose] = useState<Pose>({ score: 0, keypoints: [] });
  const [changeCamera, setChangeCamera] = useState<Function>(()=>{});
  // useEffect(() => {
  //   console.log(pose);
  // }, [pose]);

  return (
    <main className="w-full h-full">
      <div className="top-container w-full h-full main-container">
          <div className="p-10">
            <div className="p-5 text-center">
              <RoundedButtonOnClick
                onClick={()=>{changeCamera()}}
                >
                Change Camera
              </RoundedButtonOnClick>
            </div>
            <div className="p-1 bg-white rounded-3xl border border-black">
            <PoseNetComponent
              pose={pose}
              setPose={setPose}
              setChangeCamera={setChangeCamera}
              />
              </div>
          </div>
      </div>
    </main>
  )
}
