'use client'

import PoseNetComponent from "@/components/PoseCamera";
import { Pose } from "@tensorflow-models/posenet";
import { useEffect, useState } from "react";

export default function Main(){
    const [pose, setPose] = useState<Pose>({score: 0, keypoints: []});
    useEffect(()=>{
        console.log(pose);
    }, [pose]);
    return (
        <>
            <PoseNetComponent 
                pose={pose}    
                setPose={setPose}
                setNowLoding={()=>{}}
                poseBodyInfo={{
                    bodyCenter: { x: -1, y: -1 },
                    groundPosY: -1,
                    kneePosY: -1,
                    hipPosY: -1,
                    rightShoulderPosX: -1,
                    leftShoulderPosX: -1,
                    rightShoulderPosXOffset: -1,
                    leftShoulderPosXOffset: -1,
                    shoulderPosY: -1
                  }}
            />
        </>
    )    
}
