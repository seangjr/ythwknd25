"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CountdownTimer } from "./countdown-timer";

interface TimeRestrictionProps {
  children: React.ReactNode;
}

export function TimeRestriction({ children }: TimeRestrictionProps) {
  const [isAllowed, setIsAllowed] = useState(false);
  const targetDate = new Date(2024, 4, 11, 12, 30, 0); // May 11, 2024, 12:30 PM

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      setIsAllowed(now >= targetDate);
    };

    // Initial check
    checkTime();

    // Update every second
    const interval = setInterval(checkTime, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8"
        >
          <h1 className="text-4xl md:text-6xl font-rumble">Coming Soon</h1>
          <p className="text-[#BABABA] text-lg">
            The registration will be available on May 11, 2024 at 12:30 PM
          </p>
          <CountdownTimer targetDate={targetDate} />
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
} 