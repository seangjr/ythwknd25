"use client";

import { RegistrationModal } from "@/components/registration-modal";
import { TeamInviteModal } from "@/components/team-invite-modal";
import { Button } from "@/components/ui/button";
import { CONSTANTS } from "@/lib/constants";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Share2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Registration {
  id: number;
  line_number: number;
  group_number: number;
  nickname: string;
  hero_id: string;
  team_id: number;
  full_name: string;
  age: number;
}

interface HeroAvailability {
  heroId: string;
  teamId: number;
  isAvailable: boolean;
}
export default function Registration() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [heroAvailability, setHeroAvailability] = useState<HeroAvailability[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedHero, setSelectedHero] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [inviteTeam, setInviteTeam] = useState<{
    id: number;
    name: string;
    color: string;
  } | null>(null);
  const [availableHeroes, setAvailableHeroes] = useState<number>(0);
  const [totalHeroes, setTotalHeroes] = useState<number>(0);
  const [clickedHeroData, setClickedHeroData] = useState<{
    heroId: string;
    teamId: number;
    lineNumber: number | null;
  } | null>(null);

  // Fetch all registrations and hero availability
  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();

        // Fetch registrations
        const { data: regData, error: regError } = await supabase
          .from("registrations")
          .select("*")
          .order("line_number");

        if (regError) throw regError;

        // Fetch hero availability for all teams
        const { data: heroData, error: heroError } = await supabase
          .from("hero_availability")
          .select("hero_id, team_id, is_available")
          .order("team_id");

        if (heroError) throw heroError;

        setRegistrations((regData as unknown as Registration[]) || []);
        setHeroAvailability(
          (heroData as { hero_id: string; team_id: number; is_available: boolean }[]).map((h) => ({
            heroId: h.hero_id,
            teamId: h.team_id,
            isAvailable: h.is_available,
          })),
        );

        // Calculate available heroes
        const available = (heroData as { is_available: boolean }[]).filter((h) => h.is_available).length;
        setAvailableHeroes(available);
        setTotalHeroes(heroData.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle hero selection
  const handleHeroSelect = (heroId: string, teamId: number) => {
    setSelectedHero(heroId);
    setSelectedTeam(teamId);

    // Find next available line in this team
    const nextLine = getNextAvailableLineForTeam(teamId);
    if (nextLine) {
      setSelectedLine(nextLine);
    }
  };

  // Get next available line for a team
  const getNextAvailableLineForTeam = (teamId: number) => {
    const startLine = (teamId - 1) * 5 + 1;
    const endLine = startLine + 4;

    const takenLines = registrations
      .filter((r) => r.team_id === teamId)
      .map((r) => r.line_number);

    for (let i = startLine; i <= endLine; i++) {
      if (!takenLines.includes(i)) {
        return i;
      }
    }

    return null;
  };

  // Handle register button click
  const handleRegisterClick = (heroId: string, teamId: number) => {
    // Find next available line in this team
    const nextLine = getNextAvailableLineForTeam(teamId);

    if (nextLine) {
      // Store all clicked data together instead of in separate states
      setClickedHeroData({
        heroId,
        teamId,
        lineNumber: nextLine,
      });

      // Open modal after setting the data
      setIsModalOpen(true);
    }
  };
  // Handle invite button click
  const handleInviteClick = (teamId: number) => {
    const team = CONSTANTS.TEAMS.find((t) => t.id === teamId);
    if (team) {
      setInviteTeam({
        id: team.id,
        name: team.name,
        color: team.color,
      });
      setIsInviteModalOpen(true);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    // Clear clicked data when modal is closed
    setClickedHeroData(null);
  };
  // Handle invite modal close
  const handleInviteModalClose = () => {
    setIsInviteModalOpen(false);
    setInviteTeam(null);
  };

  // Handle successful registration
  const handleRegistrationSuccess = (newRegistration: Registration) => {
    // Use data from clickedHeroData instead of state
    const heroId = clickedHeroData?.heroId || "";
    const teamId = clickedHeroData?.teamId || 1;

    // Update registrations list
    setRegistrations([...registrations, newRegistration]);

    // Update hero availability
    setHeroAvailability((prev) =>
      prev.map((h) =>
        h.heroId === heroId && h.teamId === teamId
          ? { ...h, isAvailable: false }
          : h,
      ),
    );

    // Update available heroes count
    setAvailableHeroes((prev) => prev - 1);

    // Close modal
    // handleModalClose();
  };

  // Get team-specific hero availability
  const getTeamHeroAvailability = (teamId: number) => {
    return heroAvailability.filter((h) => h.teamId === teamId);
  };

  // Check if a hero is available for a team
  const isHeroAvailable = (heroId: string, teamId: number) => {
    const hero = heroAvailability.find(
      (h) => h.heroId === heroId && h.teamId === teamId,
    );
    return hero?.isAvailable ?? true;
  };

  // Get team member count
  const getTeamMemberCount = (teamId: number) => {
    return registrations.filter((r) => r.team_id === teamId).length;
  };

  // Get available heroes count for a team
  const getTeamAvailableHeroesCount = (teamId: number) => {
    return heroAvailability.filter((h) => h.teamId === teamId && h.isAvailable)
      .length;
  };

  const getHeroImagePath = (heroId: string, teamId: number) => {
    // Find the hero name from CONSTANTS.HEROES
    const heroObj = CONSTANTS.HEROES.find(h => h.id === heroId);
    if (!heroObj) return "/placeholder.svg";
    const heroName = heroObj.name.split(" ")[0]; // "Alex", "Suzzy", etc.

    const heroImage = CONSTANTS.HERO_IMAGE_PATHS.find(
      h => h.teamId === teamId && h.hero === heroName
    );
    return heroImage?.path || "/placeholder.svg";
  };

  const blocks = [
    "PLEASE READ BEFORE PROCEEDING.",
    "SELECT A HERO FROM THE LIST BELOW. EACH SET OF FIVE HEROES BELONG TO A UNIVERSE THAT YOU WILL PLAY WITH AS A TEAM.",
    "IF YOU ARE REGISTERING ALONE, CHOOSE A HERO AS YOU WISH.",
    "IF YOU ARE REGISTERING WITH A GROUP OF TWO OR MORE FRIENDS, ENSURE THAT THE UNIVERSE HAS ENOUGH SLOTS AVAILABLE FOR YOUR GROUP.",
    "NO RESERVATION OF UNIVERSES ARE ALLOWED. OTHER PARTICIPANTS MAY SECURE THE HEROES MEANT FOR YOUR FRIENDS.",
    "VISIT OUR REGISTRATION COUNTER LOCATED BEHIND L5 AFTER SERVICE IF YOU NEED HELP WITH ANY INQUIRIES, SIGNUPS OR PAYMENTS.",
    "TIME IS TICKING. MYSTERY IS CALLING.",
  ];

  return clickedHeroData ? (
    <RegistrationModal
      isOpen={isModalOpen}
      onClose={handleModalClose}
      lineNumber={clickedHeroData.lineNumber || 0}
      teamId={clickedHeroData.teamId}
      preselectedHero={clickedHeroData.heroId}
      onSuccess={handleRegistrationSuccess}
    />
  ) : (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col justify-center px-4 md:px-8 mt-16 md:mt-32"
    >
      {/* Desc section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 md:gap-6 items-center"
      >
        {/* Small text block */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="uppercase text-center"
        >
          <p className="text-xs md:text-base">Character selection</p>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-4xl md:text-6xl text-center font-rumble"
        >
          Choose your hero
        </motion.h1>
        {blocks.map((block, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
            className="uppercase text-center"
          >
            <p className="text-xs md:text-base">{block}</p>
          </motion.div>
        ))}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center py-10 my-10 border-y-2 border-gray-400"
        >
          <h2 className="text-8xl mb-2 font-rumble">
            <motion.span
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className={cn(
                availableHeroes < totalHeroes
                  ? "text-amber-500"
                  : availableHeroes <= 0
                    ? "text-red-500"
                    : "text-green-500",
              )}
            >
              {availableHeroes}
            </motion.span>
            /<span>{totalHeroes}</span>
          </h2>
          <p className="text-3xl uppercase font-rumble">Heroes Available</p>
        </motion.div>
      </motion.section>
      {loading ? (
        <div className="space-y-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="h-48 bg-[#1a1a1a] rounded-lg animate-pulse"
            ></motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="space-y-12"
        >
          {/* Team Universes */}
          {CONSTANTS.TEAMS.map((team, teamIndex) => {
            const teamHeroAvailability = getTeamHeroAvailability(team.id);
            const availableCount = getTeamAvailableHeroesCount(team.id);
            const memberCount = getTeamMemberCount(team.id);

            return (
              <motion.div 
                key={team.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 + teamIndex * 0.2 }}
                className="mb-8"
              >
                {/* Team Header */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1.6 + teamIndex * 0.2 }}
                  className="flex justify-between items-center mb-4 p-3"
                >
                  <div className="flex items-center">
                    <h3 className="text-xs md:text-base uppercase">
                      {team.code} {team.name}
                    </h3>
                    <div className="ml-3 hidden md:flex items-center">
                      <Users className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        {memberCount}/5
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <span
                      className={cn(
                        availableCount < 5
                          ? "text-amber-500"
                          : "text-green-500",
                        availableCount === 0
                          ? "text-red-500"
                          : "text-green-500",
                        "uppercase md:text-base text-xs",
                      )}
                    >
                      {availableCount !== 0
                        ? `${availableCount}/5 Heroes`
                        : "Unavailable"}
                    </span>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent border-gray-700 text-white hover:bg-gray-800 hover:text-white cursor-pointer"
                        onClick={() => handleInviteClick(team.id)}
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Invite</span>
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Hero Grid */}
                <div className="grid grid-cols-5 gap-2 md:gap-4 w-full">
                  {CONSTANTS.HEROES.map((hero, heroIndex) => {
                    const isAvailable = isHeroAvailable(hero.id, team.id);
                    return (
                      <motion.div
                        key={`team-${team.id}-${hero.id}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: 1.8 + teamIndex * 0.2 + heroIndex * 0.1 
                        }}
                        className="text-center w-full"
                      >
                        <motion.button
                          whileHover={isAvailable ? { scale: 1.05 } : {}}
                          whileTap={isAvailable ? { scale: 0.95 } : {}}
                          onClick={() =>
                            isAvailable && handleRegisterClick(hero.id, team.id)
                          }
                          className={cn(
                            "w-16 h-16 rounded-full sm:rounded-lg sm:w-full sm:h-36 overflow-hidden mx-auto relative",
                            isAvailable
                              ? "cursor-pointer hover:opacity-80 transition-opacity duration-300"
                              : "opacity-50 cursor-not-allowed grayscale",
                          )}
                          disabled={!isAvailable}
                          aria-label={`Select ${hero.name} hero from ${team.name}`}
                        >
                          <img
                            src={getHeroImagePath(hero.id, team.id)}
                            alt={hero.name}
                            className="w-full h-full object-cover"
                          />
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Team Invite Modal */}
      <AnimatePresence>
        {inviteTeam && (
          <TeamInviteModal
            isOpen={isInviteModalOpen}
            onClose={handleInviteModalClose}
            teamId={inviteTeam.id}
            teamName={inviteTeam.name}
            teamColor={inviteTeam.color}
          />
        )}
      </AnimatePresence>
    </motion.main>
  );
}
