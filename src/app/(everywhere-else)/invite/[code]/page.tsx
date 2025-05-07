"use client";

import { Footer } from "@/components/footer";
import { HeroDetails } from "@/components/hero-details";
import { HeroSelectionGrid } from "@/components/hero-selection-grid";
import { RegistrationModal } from "@/components/registration-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CONSTANTS } from "@/lib/constants";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Facebook,
  Globe,
  Instagram,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TeamInvite {
  teamId: number;
  teamName: string;
  teamColor: string;
  expiresAt: string;
}

interface HeroAvailability {
  heroId: string;
  isAvailable: boolean;
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

export default function TeamInvitePage() {
  const params = useParams();
  const router = useRouter();
  const [invite, setInvite] = useState<TeamInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableLines, setAvailableLines] = useState<number[]>([]);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [availableHeroes, setAvailableHeroes] = useState<HeroAvailability[]>(
    [],
  );
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedHero, setSelectedHero] = useState<string | null>(null);
  const [totalHeroes, setTotalHeroes] = useState(0);
  const [availableHeroCount, setAvailableHeroCount] = useState(0);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [isHeroesLoaded, setIsHeroesLoaded] = useState(false);

  const inviteCode = params.code as string;

  // Fetch invite details
  useEffect(() => {
    async function fetchInvite() {
      try {
        const response = await fetch(`/api/team-invite?code=${inviteCode}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Invalid invite code");
        }

        const data = await response.json();
        setInvite(data);
      } catch (error) {
        console.error("Error fetching invite:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load invite",
        );
      } finally {
        setLoading(false);
      }
    }

    if (inviteCode) {
      fetchInvite();
    }
  }, [inviteCode]);

  // Fetch available lines and heroes for this team
  useEffect(() => {
    async function fetchAvailableData() {
      if (!invite) return;

      try {
        setIsHeroesLoaded(false);
        const supabase = createClient();

        // Get all registrations for this team
        const { data: registrations } = await supabase
          .from("registrations")
          .select("line_number, nickname, hero_id, instagram_handle")
          .eq("team_id", invite.teamId);

        setTeamMembers(registrations || []);

        // Calculate which lines are taken
        const takenLines = registrations?.map((r) => r.line_number) || [];

        // Calculate available lines (5 lines per team)
        const teamIndex = invite.teamId - 1;
        const startLine = teamIndex * 5 + 1;
        const availLines = Array.from(
          { length: 5 },
          (_, i) => startLine + i,
        ).filter((line) => !takenLines.includes(line));

        setAvailableLines(availLines);

        // Get hero availability
        const { data: heroData } = await supabase
          .from("hero_availability")
          .select("hero_id, is_available")
          .eq("team_id", invite.teamId);

        const availableHeroes = heroData?.map((h) => ({
          heroId: h.hero_id as string,
          isAvailable: h.is_available as boolean,
        })) || [];

        setAvailableHeroes(availableHeroes);

        // Set the first available hero as default
        const firstAvailableHero = CONSTANTS.HEROES.find(hero => 
          !registrations?.some(r => r.hero_id === hero.id)
        );
        setSelectedHero(firstAvailableHero?.id || null);

        // Get total hero count and available hero count
        const { data: allHeroData } = await supabase
          .from("hero_availability")
          .select("hero_id, is_available");

        if (allHeroData) {
          setTotalHeroes(allHeroData.length);
          setAvailableHeroCount(
            allHeroData.filter((h) => h.is_available).length,
          );
        }
      } catch (error) {
        console.error("Error fetching available data:", error);
      } finally {
        setIsHeroesLoaded(true);
      }
    }

    fetchAvailableData();
  }, [invite]);

  // Handle hero selection
  const handleHeroSelect = (heroId: string) => {
    // Clear any previous errors
    setSelectionError(null);

    // Check if hero is available
    const isHeroTaken = teamMembers.some((member) => member.hero_id === heroId);

    if (isHeroTaken) {
      setSelectionError(
        "This hero has already been selected by another team member.",
      );
      return;
    }

    setSelectedHero(heroId);
  };

  // Handle registration button click
  const handleRegister = () => {
    if (availableLines.length === 0) return;
    if (!selectedHero || !isHeroAvailable(selectedHero)) {
      setSelectionError("Please select an available hero before registering.");
      return;
    }

    setSelectedLine(availableLines[0]);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedLine(null);
  };

  // Handle successful registration
  const handleRegistrationSuccess = (registration: any) => {
    // Redirect to success page with hero and team info
  };

  // Check if a hero is available
  const isHeroAvailable = (heroId: string) => {
    return !teamMembers.some((member) => member.hero_id === heroId);
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex flex-col">
        {/* Header */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full space-y-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-4"
            >
              <Skeleton className="h-12 w-2/3 mx-auto rounded-lg bg-[#1a1a1a]" />
              <Skeleton className="h-8 w-1/3 mx-auto rounded-lg bg-[#1a1a1a]" />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-2xl bg-[#1a1a1a]" />
                <Skeleton className="h-16 w-full rounded-full bg-[#1a1a1a]" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/2 rounded-lg bg-[#1a1a1a]" />
                <Skeleton className="h-48 w-full rounded-2xl bg-[#1a1a1a]" />
                <Skeleton className="h-24 w-full rounded-lg bg-[#1a1a1a]" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* Header */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full space-y-8 text-center"
          >
            <div className="mt-12">
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-2xl font-bold text-red-500"
              >
                Invalid Invite
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-gray-400 mt-2"
              >
                {error || "This invite link is invalid or has expired."}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => router.push("/")}
                  className="mt-6 bg-white text-black hover:bg-gray-200 rounded-full py-6 px-8 text-lg font-bold"
                >
                  RETURN TO HOME
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

      </div>
    );
  }

  // Get team details
  const team =
    CONSTANTS.TEAMS.find((t) => t.id === invite.teamId) || CONSTANTS.TEAMS[0];
  const availableHeroesCount = CONSTANTS.HEROES.filter((hero) =>
    isHeroAvailable(hero.id),
  ).length;

  const blocks = [
    "PLEASE READ BEFORE PROCEEDING.",
    "SELECT A HERO FROM THE LIST BELOW. EACH SET OF FIVE HEROES BELONG TO A UNIVERSE THAT YOU WILL PLAY WITH AS A TEAM.",
    "IF YOU ARE REGISTERING ALONE, CHOOSE A HERO AS YOU WISH.",
    "IF YOU ARE REGISTERING WITH A GROUP OF TWO OR MORE FRIENDS, ENSURE THAT THE UNIVERSE HAS ENOUGH SLOTS AVAILABLE FOR YOUR GROUP.",
    "NO RESERVATION OF UNIVERSES ARE ALLOWED. OTHER PARTICIPANTS MAY SECURE THE HEROES MEANT FOR YOUR FRIENDS.",
    "VISIT OUR REGISTRATION COUNTER LOCATED BEHIND L5 AFTER SERVICE IF YOU NEED HELP WITH ANY INQUIRIES, SIGNUPS OR PAYMENTS.",
    "TIME IS TICKING. MYSTERY IS CALLING.",
  ];

  return (
    <>
      {/* Registration Modal */}
      <AnimatePresence>
        {selectedLine && (
          <RegistrationModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            lineNumber={selectedLine}
            teamId={invite.teamId}
            inviteCode={inviteCode}
            preselectedHero={selectedHero || undefined}
            onSuccess={handleRegistrationSuccess}
          />
        )}
      </AnimatePresence>

      {!selectedLine && (
        <div className="min-h-screen bg-black text-white flex flex-col">
          {/* Back button */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="p-4"
          >
            <button
              onClick={() => router.push("/register")}
              className="cursor-pointer flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>BACK</span>
            </button>
          </motion.div>

          <main className="flex-1 container mx-auto px-4 py-4 flex flex-col items-center text-[#bababa]">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-6"
            >
              <div className="uppercase text-center">
                <p className="text-xs md:text-base">Character selection</p>
              </div>
              <h1 className="text-4xl md:text-6xl text-center font-rumble mt-4">
                Choose your hero
              </h1>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid gap-4"
            >
              {blocks.map((block, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="uppercase text-center"
                >
                  <p className="text-xs md:text-base">{block}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Hero count */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center py-10 my-10 border-y-2 border-gray-400"
            >
              <h2 className="text-8xl mb-2 font-rumble">
                <span className="text-amber-500">{availableHeroesCount}</span>/
                <span>{CONSTANTS.HEROES.length}</span>
              </h2>
              <p className="text-3xl uppercase font-rumble">Heroes Available</p>
            </motion.div>

            {/* Selection Error */}
            <AnimatePresence>
              {selectionError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="bg-red-900/50 border-red-800 text-white mb-4 max-w-2xl">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{selectionError}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Team Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="w-full max-w-2xl bg-[#1a1a1a] rounded-lg mb-8"
            >
              <div className="p-6">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  className="flex justify-between items-center mb-4"
                >
                  <h3 className="text-xs sm:text-base">
                    {team.code} {team.name}
                  </h3>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hero Selection */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 }}
                  >
                    <h4 className="text-2xl font-rumble text-[#bababa] mb-3">
                      Select Your Hero
                    </h4>
                    <HeroSelectionGrid
                      teamMembers={teamMembers}
                      onSelectHero={handleHeroSelect}
                      selectedHero={selectedHero}
                      teamId={team.id}
                    />
                  </motion.div>

                  {/* Hero Details */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1 }}
                  >
                    <h4 className="text-2xl font-rumble text-[#bababa] mb-3">
                      Hero Details
                    </h4>
                    <HeroDetails heroId={selectedHero} teamId={team.id} />
                  </motion.div>
                </div>

                {/* Join Button */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.1 }}
                  className="mt-6"
                >
                  {availableLines.length > 0 ? (
                      <Button
                        onClick={handleRegister}
                        disabled={!isHeroesLoaded || (isHeroesLoaded && (!selectedHero || !isHeroAvailable(selectedHero)))}
                        className={cn(
                          "cursor-pointer w-full bg-white text-black hover:bg-gray-200 rounded-full py-6 text-xl font-rumble",
                        )}
                      >
                        {!isHeroesLoaded 
                          ? "Loading Heroes..."
                          : !selectedHero || !isHeroAvailable(selectedHero)
                            ? "Select A Hero To Continue"
                            : "Register With Selected Hero"}
                      </Button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert className="bg-red-900/50 border-red-800 !text-white">
                        <AlertCircle className="!size-5"/>
                        <AlertDescription className="text-white font-rumble text-lg">
                          ALL HEROES FOR THIS TEAM ARE TAKEN!
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Team Members */}
            <AnimatePresence>
              {teamMembers.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="w-full max-w-2xl bg-[#1a1a1a] rounded-lg overflow-hidden mb-8 p-6"
                >
                  <h4 className="text-2xl font-rumble text-[#bababa] mb-4">
                    Current Team Members
                  </h4>
                  <div className="space-y-3">
                    {teamMembers.map((member, index) => {
                      const hero = CONSTANTS.HEROES.find(
                        (h) => h.id === member.hero_id,
                      );

                      return (
                        <motion.div
                          key={member.line_number}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 1.3 + index * 0.1 }}
                          className="flex items-center"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                            <img
                              src={getHeroImagePath(hero!.id, invite.teamId)}
                              alt={hero?.name || "Hero"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-200">
                              {hero?.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {member.instagram_handle || "Unknown Hero"}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* No Team Members */}
              {teamMembers.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="w-full max-w-2xl bg-[#1a1a1a] rounded-lg overflow-hidden mb-8 p-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.3 }}
                  >
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  </motion.div>
                  <h4 className="text-2xl font-rumble text-[#bababa] mb-2">
                    No Team Members Yet
                  </h4>
                  <p className="text-[#bababa] text-sm">Be the first to join this team!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      )}
    </>
  );
}
