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
            />
        </>
    )    
}
