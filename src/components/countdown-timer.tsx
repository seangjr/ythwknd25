"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  targetDate: Date;
  className?: string;
}

export function CountdownTimer({ targetDate, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      let diff = targetDate.getTime() - now.getTime();
      if (diff < 0) diff = 0;
      // Calculate time units
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    // Initial check
    checkTime();

    // Update every second
    const interval = setInterval(checkTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`grid grid-cols-4 gap-4 text-center ${className}`}
    >
      <div className="bg-[#1a1a1a] p-4 rounded-lg">
        <div className="text-3xl font-rumble">{timeLeft.days}</div>
        <div className="text-sm text-[#BABABA]">Days</div>
      </div>
      <div className="bg-[#1a1a1a] p-4 rounded-lg">
        <div className="text-3xl font-rumble">{timeLeft.hours}</div>
        <div className="text-sm text-[#BABABA]">Hours</div>
      </div>
      <div className="bg-[#1a1a1a] p-4 rounded-lg">
        <div className="text-3xl font-rumble">{timeLeft.minutes}</div>
        <div className="text-sm text-[#BABABA]">Minutes</div>
      </div>
      <div className="bg-[#1a1a1a] p-4 rounded-lg">
        <div className="text-3xl font-rumble">{timeLeft.seconds}</div>
        <div className="text-sm text-[#BABABA]">Seconds</div>
      </div>
    </motion.div>
  );
} 