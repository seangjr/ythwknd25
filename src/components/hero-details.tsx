"use client";

import { CONSTANTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface HeroDetailsProps {
  heroId: string | null;
  className?: string;
  teamId: number;
}

const getHeroImagePath = (heroId: string | null, teamId: number) => {
  if (!heroId) return "/placeholder.svg";
  const heroObj = CONSTANTS.HEROES.find(h => h.id === heroId);
  if (!heroObj) return "/placeholder.svg";
  const heroName = heroObj.name.split(" ")[0];
  const heroImage = CONSTANTS.HERO_IMAGE_PATHS.find(
    h => h.teamId === teamId && h.hero === heroName
  );
  return heroImage?.path || "/placeholder.svg";
};

export function HeroDetails({ heroId, className, teamId }: HeroDetailsProps) {
  const heroDetails = useMemo(() => {
    if (!heroId) return null;
    return CONSTANTS.HEROES.find((h) => h.id === heroId);
  }, [heroId]);

  if (!heroDetails) {
    return (
      <div className={cn("bg-[#1a1a1a] rounded-2xl p-8 text-center", className)}>
        <p className="text-gray-400">Select a hero to see details</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-[#18181b] rounded-2xl overflow-hidden shadow-lg border border-gray-800", className)}>
      <div className="relative w-full h-56 bg-black flex items-center justify-center">
        <img
          src={getHeroImagePath(heroId, teamId)}
          alt={heroDetails.name}
          className="w-full h-full object-cover"
          style={{ maxWidth: '100%' }}
        />
        <div className="pointer-events-none absolute inset-0" style={{background: 'linear-gradient(to bottom, rgba(24,24,27,0) 60%, rgba(24,24,27,1) 100%)'}} />
      </div>
      <div className="p-6 flex flex-col gap-2">
        <h2 className="text-[#bababa] text-3xl font-rumble mb-1">{heroDetails.name}</h2>
        {heroDetails.class && (
          <div className="mb-2">
            <h3 className="font-rumble text-xl uppercase text-[#bababa] mb-1">Class</h3>
            <p className="text-[#bababa] text-sm uppercase">{heroDetails.class}</p>
          </div>
        )}
        {heroDetails.perk && (
          <div className="mb-2">
            <h3 className="font-rumble text-xl uppercase text-[#bababa] mb-1">Perk</h3>
            <p className="text-[#bababa] text-sm">{heroDetails.perk}</p>
          </div>
        )}
        {heroDetails.description && (
          <div>
            <h3 className="font-rumble text-xl uppercase text-[#bababa] mb-1">Description</h3>
            <p className="text-[#bababa] text-sm uppercase">{heroDetails.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
