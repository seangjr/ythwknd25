"use client";

import { CharacterSelectionScreen } from "@/components/character-selection-screen";
import { MultiStepRegistrationForm } from "@/components/multi-step-registration-form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { LoadingOverlay } from "./loading-overlay";
import { useDatabaseConnection } from "@/hooks/use-database-connection";

// Form schema
const formSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    fullName: z.string().min(2, { message: "Full name is required" }),
    age: z
      .string()
      .refine((val) => ["13", "14", "15", "16", "17"].includes(val), {
        message: "Please select a valid age between 13-17",
      }),
    gender: z.enum(["Male", "Female"], {
      required_error: "Please select your gender",
    }),
    nricPassport: z
      .string()
      .min(5, { message: "NRIC/Passport number is required" }),
    contactNumber: z
      .string()
      .min(8, { message: "Valid contact number is required" }),
    instagramHandle: z.string().optional(),
    schoolName: z.string().min(2, { message: "School name is required" }),
    ymMember: z.enum(["Yes", "No"], {
      required_error: "Please select if you are a YM member",
    }),
    cgLeader: z.string().optional(),
    isChristian: z
      .enum(["attending_other", "not_attending", "no"], {
        required_error: "Please select your religious affiliation",
      })
      .optional(),
    eventSource: z
      .enum(["ym_services", "friend", "social_media", "school", "other"], {
        required_error: "Please select how you heard about this event",
      })
      .optional(),
    otherEventSource: z.string().optional(),
    invitedByFriend: z.string().optional(),
    churchName: z.string().optional(),
    pastorName: z.string().optional(),
    churchRole: z.string().optional(),
    emergencyContactName: z
      .string()
      .min(2, { message: "Emergency contact name is required" }),
    emergencyContactRelationship: z
      .string()
      .min(1, { message: "Please select or specify the relationship" }),
    emergencyContactPhone: z
      .string()
      .min(8, { message: "Valid phone number is required" }),
    emergencyContactEmail: z
      .string()
      .email({ message: "Valid email is required" }),
    // nickname: z.string().min(1, { message: "Nickname is required" }),
    otherRelationship: z.string().optional(),
  })
  .refine(
    (data) => {
      // If user is a YM member, CG leader is required
      if (data.ymMember === "Yes") {
        return !!data.cgLeader;
      }
      // If not a YM member, CG leader is not required
      return true;
    },
    {
      message: "CG Leader is required for YM members",
      path: ["cgLeader"],
    },
  );

type FormValues = z.infer<typeof formSchema>;

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lineNumber: number | null;
  teamId?: number;
  inviteCode?: string;
  preselectedHero?: string;
  onSuccess?: (registration: any) => void;
}

export function RegistrationModal({
  isOpen,
  onClose,
  lineNumber,
  teamId,
  inviteCode,
  preselectedHero,
  onSuccess,
}: RegistrationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHero, setSelectedHero] = useState<string>(
    preselectedHero || "",
  );
  const [showCharacterSelection, setShowCharacterSelection] =
    useState<boolean>(true);
  const [preselectedHeroHandled, setPreselectedHeroHandled] =
    useState<boolean>(false);
  const { isConnecting, connectionError, handleFetchError } = useDatabaseConnection();

  // Set preselected hero when it changes
  useEffect(() => {
    if (preselectedHero && !preselectedHeroHandled) {
      setSelectedHero(preselectedHero);
      setPreselectedHeroHandled(true);
    }
  }, [preselectedHero, preselectedHeroHandled]);

  // Handle character selection
  const handleCharacterConfirm = (heroId: string) => {
    setSelectedHero(heroId);
    setTimeout(() => {
      setShowCharacterSelection(false);
    }, 0);
  };

  // Handle going back to character selection
  const handleBackToCharacterSelection = () => {
    setShowCharacterSelection(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    // Only reset character selection state when the modal is actually closed
    if (isOpen) {
      onClose();
      // Don't reset selectedHero here - wait until the modal is fully closed
    }
  };

  // Reset the state when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      // Only reset when we reopen
      setShowCharacterSelection(true);
      // Don't reset selectedHero if we have a preselectedHero
      if (!preselectedHero) {
        setSelectedHero("");
      }
      setPreselectedHeroHandled(false);
    }
  }, [isOpen, preselectedHero]);

  const handleFormSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Calculate group number from line number
      const groupNumber = Math.ceil(lineNumber! / 5);

      // Set cgLeader to N/A for non-YM members if not already set
      const cgLeader = data.ymMember === "No" ? "N/A" : data.cgLeader;

      // Call the API to register
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lineNumber,
          groupNumber,
          email: data.email,
          fullName: data.fullName,
          nickname: data.fullName,
          age: data.age,
          gender: data.gender,
          nricPassport: data.nricPassport,
          contactNumber: data.contactNumber,
          instagramHandle: data.instagramHandle,
          schoolName: data.schoolName,
          ymMember: data.ymMember === "Yes",
          cgLeader,
          heroId: selectedHero,
          teamId: teamId || Math.ceil(lineNumber! / 5),
          inviteCode,
          emergencyContactName: data.emergencyContactName,
          emergencyContactRelationship: data.emergencyContactRelationship,
          emergencyContactPhone: data.emergencyContactPhone,
          emergencyContactEmail: data.emergencyContactEmail,
          isChristian: data.isChristian,
          eventSource: data.eventSource,
          otherEventSource: data.otherEventSource,
          invitedByFriend: data.invitedByFriend,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle any fetch error
        const recovered = await handleFetchError(errorData);
        if (!recovered) {
          throw new Error(errorData.error || "Registration failed");
        }
        
        // If we recovered, retry the registration
        return handleFormSubmit(data);
      }

      const responseData = await response.json();
      if (onSuccess) {
        onSuccess(responseData);
      }
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Show character selection screen first
  if (showCharacterSelection) {
    return (
      <CharacterSelectionScreen
        isOpen={isOpen}
        onClose={handleModalClose}
        teamId={teamId || Math.ceil(lineNumber! / 5)}
        preselectedHero={selectedHero}
        onConfirm={handleCharacterConfirm}
        lineNumber={lineNumber || 0}
      />
    );
  }

  // Show multi-step registration form
  return (
    <>
      <LoadingOverlay 
        isVisible={isConnecting} 
        message={connectionError || "Connecting to database..."} 
      />
      <MultiStepRegistrationForm
        isOpen={isOpen}
        onClose={handleModalClose}
        lineNumber={lineNumber || 0}
        teamId={teamId || Math.ceil(lineNumber! / 5)}
        inviteCode={inviteCode}
        selectedHero={selectedHero}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        onBackToCharacterSelection={handleBackToCharacterSelection} // New prop for going back
        error={error}
      />
    </>
  );
}
