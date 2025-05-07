"use client";

import { Button } from "@/components/ui/button";
import { CONSTANTS } from "@/lib/constants";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { ArrowLeft, Facebook, Globe, Instagram } from "lucide-react";
import { useEffect, useState } from "react";
import Navbar from "./navbar";
import { motion, AnimatePresence } from "framer-motion";

interface CharacterSelectionScreenProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: number;
  preselectedHero?: string;
  onConfirm: (heroId: string) => void;
  lineNumber: number;
}

interface TeamMember {
  instagram_handle?: string;
  hero_id: string;
  line_number: number;
}

const getHeroImagePath = (heroId: string, teamId: number) => {
  const heroObj = CONSTANTS.HEROES.find(h => h.id === heroId);
  if (!heroObj) return "/placeholder.svg";
  const heroName = heroObj.name.split(" ")[0];
  const heroImage = CONSTANTS.HERO_IMAGE_PATHS.find(
    h => h.teamId === teamId && h.hero === heroName
  );
  return heroImage?.path || "/placeholder.svg";
};

export function CharacterSelectionScreen({
  isOpen,
  onClose,
  teamId,
  preselectedHero,
  onConfirm,
  lineNumber,
}: CharacterSelectionScreenProps) {
  const [selectedHero, setSelectedHero] = useState<string>(
    preselectedHero || "",
  );
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Get team details
  const team =
    CONSTANTS.TEAMS.find((t) => t.id === teamId) || CONSTANTS.TEAMS[0];

  // Fetch team members
  useEffect(() => {
    async function fetchTeamMembers() {
      if (!teamId) return;

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("registrations")
          .select("instagram_handle, hero_id, line_number")
          .eq("team_id", teamId)
          .order("line_number");

        if (error) throw error;
        setTeamMembers(data || []);
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      fetchTeamMembers();
    }
  }, [teamId, isOpen]);

  // Get hero details
  const getHeroDetails = (heroId: string) => {
    return CONSTANTS.HEROES.find((h) => h.id === heroId);
  };

  // Check if a hero is taken
  const isHeroTaken = (heroId: string) => {
    return teamMembers.some((member) => member.hero_id === heroId);
  };

  // Get hero status text
  const getHeroStatus = (heroId: string) => {
    if (heroId === selectedHero) return "YOUR SELECTION";

    const member = teamMembers.find((m) => m.hero_id === heroId);
    if (member)
      return member.instagram_handle ? `${member.instagram_handle}` : "TAKEN";

    return "HERO AVAILABLE";
  };

  // Get hero status color
  const getHeroStatusColor = (heroId: string) => {
    if (heroId === selectedHero) return "text-amber-500";

    const member = teamMembers.find((m) => m.hero_id === heroId);
    if (member) return "text-gray-400";

    return "text-green-500";
  };

  // Update local state when preselectedHero changes
  useEffect(() => {
    if (preselectedHero) {
      setSelectedHero(preselectedHero);
    }
  }, [preselectedHero]);

  // Handle hero selection
  const handleHeroSelect = (heroId: string) => {
    if (isHeroTaken(heroId) && heroId !== selectedHero) return;
    setSelectedHero(heroId);
  };

  // Handle confirm button click
  const handleConfirm = () => {
    if (!selectedHero) return;
    onConfirm(selectedHero);
  };

  // Get selected hero details
  const selectedHeroDetails = getHeroDetails(selectedHero);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col overflow-auto"
    >
      {/* Header */}
      <Navbar />

      {/* Back button */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="p-4"
      >
        <button
          onClick={onClose}
          className="flex cursor-pointer items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>BACK</span>
        </button>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 px-4 pb-4 flex flex-col items-center !text-[#BABABA]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 flex flex-col gap-4"
        >
          <h3 className="text-gray-400 uppercase text-sm">
            CHARACTER SELECTION
          </h3>
          <h2 className="text-6xl font-rumble">CONFIRM HERO</h2>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedHeroDetails && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md bg-[#1A1A1A] rounded-lg p-6 mb-6"
            >
              <div className="flex flex-col items-center">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-gray-700"
                >
                  <img
                    src={getHeroImagePath(selectedHero, teamId)}
                    alt={selectedHeroDetails.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="text-4xl font-rumble mb-6"
                >
                  {selectedHeroDetails.name}
                </motion.h3>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="grid grid-cols-2 gap-8 w-full mb-6"
                >
                  <div>
                    <h4 className="text-2xl font-rumble mb-2">CLASS</h4>
                    <p className="text-sm">{selectedHeroDetails.class}</p>
                  </div>
                  <div>
                    <h4 className="text-2xl font-rumble mb-2">PERK</h4>
                    <p className="text-sm">{selectedHeroDetails.perk} - {selectedHeroDetails.description.toUpperCase()}</p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="w-full"
                >
                  <h4 className="text-xl font-rumble mb-2">CURRENT TEAM</h4>
                  <p className="text-sm mb-4 uppercase">
                    {team.code} {team.name}
                  </p>

                  <div className="space-y-3">
                    {CONSTANTS.HEROES.map((hero, index) => {
                      const isSelected = hero.id === selectedHero;
                      const isTaken = isHeroTaken(hero.id);
                      const statusText = getHeroStatus(hero.id);
                      const statusColor = getHeroStatusColor(hero.id);

                      return (
                        <motion.div
                          key={hero.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                          whileHover={!isTaken || isSelected ? { scale: 1.02 } : {}}
                          className={cn(
                            "cursor-pointer flex items-center p-2 rounded-lg transition-all",
                            isSelected ? "bg-black/50" : "hover:bg-black/50",
                            isTaken && !isSelected && "opacity-70 cursor-not-allowed",
                          )}
                          onClick={() => handleHeroSelect(hero.id)}
                        >
                          <div className="w-6 mr-3 text-gray-400">
                            {index + 1}
                          </div>
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                            <img
                              src={getHeroImagePath(hero.id, teamId)}
                              alt={hero.name}
                              className={cn(
                                "w-full h-full object-cover",
                                isTaken && !isSelected && "grayscale",
                              )}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium uppercase">{hero.name}</p>
                            <p className={cn("text-sm", statusColor)}>
                              {statusText}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleConfirm}
            disabled={!selectedHero}
            className="w-full cursor-pointer max-w-md bg-white text-black hover:bg-gray-200 rounded-full py-6 text-2xl font-rumble"
          >
            Confirm Hero
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="p-4 text-center text-gray-500"
      >
        <div className="flex justify-center space-x-4 mb-2">
          <motion.a 
            whileHover={{ scale: 1.1 }}
            href="#" 
            className="text-gray-500 hover:text-white"
          >
            <Globe className="w-5 h-5" />
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.1 }}
            href="#" 
            className="text-gray-500 hover:text-white"
          >
            <Instagram className="w-5 h-5" />
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.1 }}
            href="#" 
            className="text-gray-500 hover:text-white"
          >
            <Facebook className="w-5 h-5" />
          </motion.a>
        </div>
        <p className="text-sm">{CONSTANTS.SITE_DESCRIPTION}</p>
      </motion.footer>
    </motion.div>
  );
}
