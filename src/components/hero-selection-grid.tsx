"use client";

import { CONSTANTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";

interface HeroSelectionGridProps {
  teamMembers: any[];
  onSelectHero: (heroId: string) => void;
  selectedHero?: string | null;
  className?: string;
  teamId: number;
}

// Add this helper function before the HeroSelectionGrid component
const getHeroImagePath = (heroId: string, teamId: number) => {
  const heroObj = CONSTANTS.HEROES.find(h => h.id === heroId);
  if (!heroObj) return "/placeholder.svg";
  const heroName = heroObj.name.split(" ")[0];
  const heroImage = CONSTANTS.HERO_IMAGE_PATHS.find(
    h => h.teamId === teamId && h.hero === heroName
  );
  return heroImage?.path || "/placeholder.svg";
};

export function HeroSelectionGrid({
  teamMembers,
  onSelectHero,
  selectedHero,
  className,
  teamId,
}: HeroSelectionGridProps) {
  const [hoveredHero, setHoveredHero] = useState<string | null>(null);

  // Check if a hero is available
  const isHeroAvailable = (heroId: string) => {
    return !teamMembers.some((member) => member.hero_id === heroId);
  };

  return (
    <div className={cn("grid grid-cols-3 md:grid-cols-1 gap-3", className)}>
      {CONSTANTS.HEROES.map((hero) => {
        const member = teamMembers.find((m) => m.hero_id === hero.id);
        const isAvailable = !member;
        const isHovered = hoveredHero === hero.id;
        const isSelected = selectedHero === hero.id;

        return (
          <div
            key={hero.id}
            className="text-center"
            onMouseEnter={() => setHoveredHero(hero.id)}
            onMouseLeave={() => setHoveredHero(null)}
            onClick={() => isAvailable && onSelectHero(hero.id)}
          >
            <div
              className={cn(
                "w-20 h-20 sm:w-full sm:h-24 rounded-full sm:rounded-lg overflow-hidden mx-auto relative transition-all duration-200",
                isAvailable
                  ? isHovered
                    ? "opacity-80 scale-102 cursor-pointer"
                    : "opacity-100 hover:ring-2 hover:ring-green-500/50 hover:scale-105 cursor-pointer"
                  : "opacity-50 cursor-not-allowed grayscale",
              )}
            >
              <Image
                src={getHeroImagePath(hero.id, teamId)}
                alt={hero.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
                loading="lazy"
              />
            </div>
            {/* <p
              className={cn(
                "mt-2 text-xs font-medium",
                isSelected ? "text-amber-500" : "text-gray-300",
              )}
            >
              {hero.name}
            </p> */}
            {/* {!isAvailable && member.nickname && (
              <p className="text-xs text-gray-500">
                @{member.nickname.toLowerCase().replace(/\s+/g, "_")}
              </p>
            )} */}
          </div>
        );
      })}
    </div>
  );
}
