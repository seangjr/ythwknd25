"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CONSTANTS } from "@/lib/constants";
import { Check, Copy, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Registration {
  id: number;
  lineNumber: number;
  groupNumber: number;
  fullName: string;
  nickname: string;
  hero: string;
  age: number;
  teamId: number;
}

interface TeamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  groupNumber: number | null;
  registrations: Registration[];
}

export function TeamDrawer({
  isOpen,
  onClose,
  groupNumber,
  registrations,
}: TeamDrawerProps) {
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  // Find next available line in this group
  const getNextAvailableLine = () => {
    if (!groupNumber) return null;

    const startLine = (groupNumber - 1) * 5 + 1;
    const endLine = startLine + 4;

    const takenLines = registrations.map((r) => r.lineNumber);

    for (let i = startLine; i <= endLine; i++) {
      if (!takenLines.includes(i)) {
        return i;
      }
    }

    return null;
  };

  const nextAvailableLine = getNextAvailableLine();

  // Get team name based on registrations
  const getTeamName = () => {
    if (registrations.length === 0) return "Unknown Team";

    const teamId = registrations[0].teamId;
    const team = CONSTANTS.TEAMS.find((t) => t.id === teamId);

    return team?.name || "Unknown Team";
  };

  // Handle join team click
  const handleJoinTeam = () => {
    if (!nextAvailableLine) return;

    // This would open the registration modal with the line pre-selected
    // For now, we'll just close the drawer
    onClose();
  };

  // Add function to generate invite link
  const generateInviteLink = async () => {
    if (!registrations.length) return;

    setIsGeneratingLink(true);
    try {
      const teamId = registrations[0].teamId;
      const response = await fetch("/api/team-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teamId }),
      });

      if (response.ok) {
        const data = await response.json();
        setInviteLink(data.inviteUrl);
      }
    } catch (error) {
      console.error("Error generating invite link:", error);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // Add copy link function
  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Share invite link (for mobile)
  const shareInviteLink = async () => {
    if (inviteLink && navigator.share) {
      try {
        await navigator.share({
          title: `Join ${getTeamName()} in YTHWKND`,
          text: `Join my team "${getTeamName()}" for YTHWKND! Click the link to register:`,
          url: inviteLink,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      copyInviteLink();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-xl">Team: {getTeamName()}</SheetTitle>
          <SheetDescription>
            Group {groupNumber} - {registrations.length}/5 members
          </SheetDescription>
        </SheetHeader>

        <div className="py-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Team Members
          </h3>

          <div className="space-y-3">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-shrink-0 mr-3">
                  <img
                    src={
                      CONSTANTS.HEROES.find((h) => h.id === reg.hero)?.icon ||
                      "/placeholder.svg?height=40&width=40"
                    }
                    alt={reg.hero}
                    className="w-10 h-10 rounded-full"
                  />
                </div>

                <div className="flex-1">
                  <p className="font-medium">{reg.nickname}</p>
                  <p className="text-xs text-gray-500">Line {reg.lineNumber}</p>
                </div>
              </div>
            ))}

            {Array.from({ length: 5 - registrations.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center p-3 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg"
              >
                <p className="text-sm text-gray-500 w-full text-center">
                  Empty Slot
                </p>
              </div>
            ))}
          </div>
        </div>

        <SheetFooter className="flex flex-col space-y-2">
          {inviteLink ? (
            <div className="flex flex-col space-y-2 w-full">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 p-2 text-sm border rounded bg-gray-50 dark:bg-gray-800"
                />
                <Button onClick={copyInviteLink} variant="outline" size="sm">
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button onClick={shareInviteLink} className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Share Link
              </Button>
              <Button
                onClick={() => setInviteLink(null)}
                variant="outline"
                className="w-full"
              >
                Generate New Link
              </Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 w-full">
              <Button
                onClick={generateInviteLink}
                disabled={isGeneratingLink || registrations.length === 0}
                className="w-full"
              >
                {isGeneratingLink ? "Generating..." : "Generate Invite Link"}
              </Button>
              <Button
                onClick={handleJoinTeam}
                disabled={!nextAvailableLine}
                className="w-full"
              >
                {nextAvailableLine
                  ? `Join Team (Line ${nextAvailableLine})`
                  : "Team is Full"}
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
