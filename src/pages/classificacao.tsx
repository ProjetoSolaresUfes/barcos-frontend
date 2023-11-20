import React, { useEffect, useState } from "react";
import { PilotsCard } from "../components/PilotsCard";
import { getAllInfoCollectionRealTime, saveInfoCollection } from "@/firebase/functions/firestore";
import { AlertAddPilot } from "@/utils/popups";
import ThemeToggle from "@/components/ThemeToggle";

export default function Pilots() {
  const [pilots, setPilots] = useState<any>([]);
  
  useEffect(() => {
    getAllInfoCollectionRealTime('pilots', setPilots);
  }, [])

  return (
    <div className="flex flex-col h-screen w-full items-center justify-center py-2">
      <div>
        <ThemeToggle />
      </div>
      <PilotsCard 
        pilots={pilots}
        addNewPilot={() => AlertAddPilot(saveInfoCollection)}
      />
    </div>
  );
}