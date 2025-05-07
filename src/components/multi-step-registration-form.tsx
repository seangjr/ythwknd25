"use client";

import { TeamMembersSubscription } from "@/components/team-members-subscription";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CONSTANTS } from "@/lib/constants";
import { getRelativeTimeString } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  Facebook,
  Globe,
  Instagram,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Navbar from "./navbar";
import { toast } from "sonner";
import { Footer } from "./footer";
import { motion } from "framer-motion";

// Form schema
const formSchema = z
  .object({
    // Personal Details
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
    instagramHandle: z
      .string()
      .optional()
      .refine((val) => !val || val.startsWith("@"), {
        message: "Instagram handle must start with '@'",
      }),
    schoolName: z.string().min(2, { message: "School name is required" }),
    ymMember: z.enum(["Yes", "No"], {
      required_error: "Please select if you are a YM member",
    }),

    // CG Details
    cgLeader: z.string().optional(),

    // More Details (Religious Affiliation)
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

    // Church Details (for Christians attending other churches)
    // churchName: z.string().optional(),
    // pastorName: z.string().optional(),
    // churchRole: z.string().optional(),

    // Emergency Contact
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
  )
  .refine(
    (data) => {
      // If event source is "other", otherEventSource is required
      if (data.eventSource === "other") {
        return !!data.otherEventSource;
      }
      return true;
    },
    {
      message: "Please specify how you heard about this event",
      path: ["otherEventSource"],
    },
  );
// .refine(
//   (data) => {
//     // If user is a Christian attending another church, church details are required
//     if (data.isChristian === "attending_other") {
//       return !!data.churchName && !!data.pastorName && !!data.churchRole;
//     }
//     return true;
//   },
//   {
//     message: "Church details are required",
//     path: ["churchName"],
//   },
// );

type FormValues = z.infer<typeof formSchema>;

// Hero status types
type HeroStatus = "available" | "selected" | "taken";

// Hero with status information
type Hero = (typeof CONSTANTS.HEROES)[0];
interface HeroWithStatus extends Hero {
  status: HeroStatus;
  takenBy?: string;
  lineNumber?: number;
}

interface MultiStepRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  lineNumber: number;
  teamId: number;
  inviteCode?: string;
  selectedHero: string;
  onSubmit: (data: FormValues) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  onBackToCharacterSelection: () => void; // New prop
}

export function MultiStepRegistrationForm({
  isOpen,
  onClose,
  lineNumber,
  teamId,
  inviteCode,
  selectedHero,
  onSubmit,
  isSubmitting,
  error,
  onBackToCharacterSelection,
}: MultiStepRegistrationFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteLinkLoading, setInviteLinkLoading] = useState(false);
  const [inviteLinkError, setInviteLinkError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [otherRelationship, setOtherRelationship] = useState(false);
  const [otherEventSourceSelected, setOtherEventSourceSelected] =
    useState(false);
  const [registrationUnavailable, setRegistrationUnavailable] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [heroesRefreshing, setHeroesRefreshing] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "",
      age: "",
      gender: undefined,
      nricPassport: "",
      contactNumber: "",
      instagramHandle: "",
      schoolName: "",
      ymMember: undefined,
      cgLeader: "",
      isChristian: undefined,
      eventSource: undefined,
      otherEventSource: "",
      invitedByFriend: "",
      // churchName: "",
      // pastorName: "",
      // churchRole: "",
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactPhone: "",
      emergencyContactEmail: "",
      // nickname: fullName.,
      otherRelationship: "",
    },
  });

  const watchYmMember = form.watch("ymMember");
  const watchGender = form.watch("gender");
  const watchRelationship = form.watch("emergencyContactRelationship");
  const watchIsChristian = form.watch("isChristian");
  const watchEventSource = form.watch("eventSource");

  // Fetch team members when component mounts
  useEffect(() => {
    if (isOpen && teamId) {
      fetchTeamMembers();
    }
  }, [isOpen, teamId]);

  // Handle YM Member changes
  useEffect(() => {
    if (watchYmMember === "No") {
      form.setValue("cgLeader", "N/A");
    } else if (watchYmMember === "Yes") {
      // Only reset if the current value is N/A
      if (form.getValues("cgLeader") === "N/A") {
        form.setValue("cgLeader", "");
      }
    }
  }, [watchYmMember, form]);

  useEffect(() => {
    // Force re-render of the RadioGroup when on step 2
    if (step === 2) {
      const currentValue = form.getValues("cgLeader");
      // This will trigger a re-render of the RadioGroup
      form.setValue("cgLeader", currentValue, { shouldValidate: false });
    }
  }, [step, form]);

  // Handle event source changes
  useEffect(() => {
    setOtherEventSourceSelected(watchEventSource === "other");
  }, [watchEventSource]);

  // Get hero details
  const getHeroDetails = () => {
    return CONSTANTS.HEROES.find((h) => h.id === selectedHero);
  };

  const heroDetails = getHeroDetails();
  const team = CONSTANTS.TEAMS.find((t) => t.id === teamId);

  // Generate team invite link
  const generateTeamInviteLink = async () => {
    setInviteLinkLoading(true);
    setInviteLinkError(null);

    try {
      const response = await fetch("/api/team-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId: teamId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate invite link");
      }

      const data = await response.json();
      const baseUrl = window.location.origin;
      const fullInviteUrl = `${baseUrl}/invite/${data.inviteCode}`;
      setInviteLink(fullInviteUrl);
    } catch (error) {
      console.error("Error generating team invite link:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate invite link";
      setInviteLinkError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setInviteLinkLoading(false);
    }
  };

  // Fetch team members
  const fetchTeamMembers = async () => {
    setTeamMembersLoading(true);
    try {
      const response = await fetch(`/api/team-members?teamId=${teamId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch team members");
      }

      const data = await response.json();
      setTeamMembers(data.members || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch team members");
    } finally {
      setTeamMembersLoading(false);
    }
  };

  // Refresh heroes data
  const refreshHeroesData = async () => {
    setHeroesRefreshing(true);
    try {
      await fetchTeamMembers();
    } finally {
      setHeroesRefreshing(false);
      // Show a brief animation even if the data loads quickly
      setTimeout(() => {
        setHeroesRefreshing(false);
      }, 500);
    }
  };

  // Process heroes with status information
  const heroesWithStatus = useMemo((): HeroWithStatus[] => {
    if (teamMembersLoading) return [];

    return CONSTANTS.HEROES.map((hero) => {
      // Find if this hero is taken by any team member
      const takenBy = teamMembers.find((member) => member.hero_id === hero.id);

      let status: HeroStatus = "available";

      if (takenBy) {
        // If this is the current user's hero
        if (takenBy.line_number === lineNumber) {
          status = "selected";
        } else {
          status = "taken";
        }
      }

      return {
        ...hero,
        status,
        takenBy: takenBy?.nickname,
        lineNumber: takenBy?.line_number,
      };
    });
  }, [teamMembers, teamMembersLoading, lineNumber]);

  // Sort heroes by status: selected first, then available, then taken
  const sortedHeroes = useMemo(() => {
    return [...heroesWithStatus].sort((a, b) => {
      // Custom sort order: selected, available, taken
      const statusOrder = { selected: 0, available: 1, taken: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [heroesWithStatus]);

  // Get available heroes count
  const availableHeroesCount = useMemo(() => {
    return heroesWithStatus.filter((hero) => hero.status === "available")
      .length;
  }, [heroesWithStatus]);

  // Handle form submission
  const handleFormSubmit = async (data: FormValues) => {
    // For YM members, set default values for fields they skip
    if (data.ymMember === "Yes") {
      // YM members are already known to be Christians attending YM
      data.isChristian = "attending_other";
      data.eventSource = "ym_services";
    }

    // Check if registration should be blocked
    if (data.ymMember === "No" && data.isChristian === "attending_other") {
      setRegistrationUnavailable(true);
      return;
    }

    try {
      await onSubmit(data);
      // Only proceed with success flow if onSubmit succeeds
      setRegistrationComplete(true);
      generateTeamInviteLink();
      fetchTeamMembers();
    } catch (error) {
      setStep(1);
      setRegistrationComplete(false); // Ensure we don't show success page
      console.error("Form submission error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit registration. Please try again.");
    }
  };

  // Handle next step
  const handleNext = async () => {
    let isValid = false;

    if (step === 1) {
      isValid = await form.trigger([
        "email",
        "fullName",
        "age",
        "gender",
        "nricPassport",
        "contactNumber",
        "instagramHandle",
        "schoolName",
        "ymMember",
        // "nickname",
      ]);

      if (isValid) {
        // If user is a YM member, go to CG Details
        // If not a YM member, go to More Details
        setStep(watchYmMember === "Yes" ? 2 : 3);
      }
    } else if (step === 2) {
      isValid = await form.trigger(["cgLeader"]);

      if (isValid) {
        // If user is a YM member, skip directly to Emergency Contact (step 5)
        setStep(5);
      }
    } else if (step === 3 && watchYmMember === "No") {
      isValid = await form.trigger([
        "isChristian",
        "eventSource",
        "otherEventSource",
        "invitedByFriend",
      ]);

      // If the user is a Christian attending another church, show church details step
      if (isValid && watchIsChristian === "attending_other") {
        setRegistrationUnavailable(true);
        return;
      }

      if (isValid) {
        setStep(5); // Go to Emergency Contact
      }
    } else if (step === 4) {
      if (isValid) {
        setStep(5); // Go to Emergency Contact
      }
    }
  };

  // Handle back
  const handleBack = () => {
    if (registrationComplete) {
      onClose();
      return;
    }

    if (step > 1) {
      // If we're on step 5 (Emergency Contact) and user is a YM member
      if (step === 5 && watchYmMember === "Yes") {
        setStep(2); // Go back to CG Details, skipping More Details
      }
      // If we're on step 5 (Emergency Contact) and user is not a YM member and is a Christian attending another church
      else if (
        step === 5 &&
        watchYmMember === "No" &&
        watchIsChristian === "attending_other"
      ) {
        setRegistrationUnavailable(true);
      }
      // If we're on step 5 (Emergency Contact) and user is not a YM member
      else if (step === 5 && watchYmMember === "No") {
        setStep(3); // Go back to More Details
      }
      // If we're on step 3 (More Details) and user is not a YM member
      else if (step === 3 && watchYmMember === "No") {
        setStep(1); // Go back to Personal Details
      } else {
        setStep(step - 1);
      }
    } else {
      onClose();
    }
  };

  // Handle relationship change
  const handleRelationshipChange = (value: string) => {
    if (value === "Other") {
      setOtherRelationship(true);
      form.setValue("emergencyContactRelationship", "");
    } else {
      setOtherRelationship(false);
      form.setValue("emergencyContactRelationship", value);
    }
  };

  // Copy invite link
  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Regenerate invite link
  const handleRegenerateInviteLink = () => {
    generateTeamInviteLink();
  };

  // Return to main page
  const handleReturnToMain = () => {
    router.push("/");
    onClose();
  };

  const takenByHeroId = new Map(
    teamMembers.map((member) => [member.hero_id, member]),
  );

  if (!isOpen) return null;

  // Registration Unavailable Screen
  if (registrationUnavailable) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-auto">
        {/* Header */}
        <Navbar />

        {/* Back button */}
        <div className="p-4">
          <button
            onClick={handleBack}
            className="cursor-pointer flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>BACK</span>
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 px-4 pb-4 flex flex-col items-center max-w-md mx-auto w-full">
          <div className="text-center mb-6 flex flex-col gap-4">
            <h3 className="text-gray-400 uppercase text-sm">
              REGISTRATION UNAVAILABLE
            </h3>
            <h2 className="text-6xl font-rumble">We&apos;re Sorry</h2>

            <p className="text-[#BABABA] mb-2">
              THANK YOU FOR YOUR INTEREST IN JOINING OUR EVENT.
            </p>

            <p className="text-[#BABABA] mb-2">
              WE REGRET TO INFORM YOU THAT WE&apos;RE UNABLE TO PROCEED WITH
              YOUR SUBMISSION BECAUSE THIS IS AN EVANGELISTIC CAMP AND
              WE&apos;RE ENCOURAGING OUR YMFGAKL MEMBERS TO REACH OUT TO THEIR
              FRIENDS WHO ARE NOT YET CHRISTIANS OR ARE NOT ATTENDING ANY CHURCH
              TO HAVE THE CHANCE TO ENCOUNTER CHRIST.
            </p>

            <p className="text-[#BABABA] mb-2">
              PLEASE REACH OUT TO YOUR FRIEND FROM YMFGAKL IF THERE&apos;S ANY
              CONFIRMATION REQUIRED OR CONTACT US THROUGH OUR SOCIAL MEDIA.
            </p>

            <p className="text-[#BABABA] mb-2">
              THANK YOU FOR YOUR UNDERSTANDING.
            </p>

            <Button
              onClick={handleReturnToMain}
              className="w-full bg-white text-black hover:bg-gray-200 rounded-full py-6 text-xl font-rumble"
            >
              RETURN TO MAIN PAGE
            </Button>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-auto py-6">
      {/* Header */}
      <Navbar />

      {/* Back button */}
      <div className="p-4">
        <button
          onClick={handleBack}
          className="cursor-pointer flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>BACK</span>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 pb-4 flex flex-col items-center max-w-md mx-auto w-full">
        {!registrationComplete ? (
          <>
            <div className="text-center mb-6 flex flex-col gap-4">
              <h3 className="text-gray-400 uppercase text-sm">
                REGISTRATION FORM
              </h3>
              {step === 1 && (
                <h2 className="text-6xl font-rumble">PERSONAL DETAILS</h2>
              )}
              {step === 2 && (
                <h2 className="text-6xl font-rumble">CG DETAILS</h2>
              )}
              {step === 3 && (
                <h2 className="text-6xl font-rumble">MORE DETAILS</h2>
              )}
              {step === 4 && (
                <h2 className="text-6xl font-rumble">CHURCH DETAILS</h2>
              )}
              {step === 5 && (
                <h2 className="text-6xl font-rumble">EMERGENCY CONTACT</h2>
              )}{" "}
            </div>

            {/* {error && (
              <Alert className="bg-red-900 border-red-800 mb-4 w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )} */}

            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="w-full space-y-6"
            >
              {/* Step 1: Personal Details */}
              {step === 1 && (
                <div className="space-y-6 w-full">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-2xl uppercase font-rumble"
                    >
                      Email<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your answer"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="fullName"
                      className="text-2xl uppercase font-rumble"
                    >
                      Full Name (as per IC/Passport)
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Your answer"
                      {...form.register("fullName")}
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="age"
                      className="text-2xl uppercase font-rumble"
                    >
                      Age (as of 2025)<span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-gray-400">
                      This camp is only open for ages 13 to 17. If you're above
                      18, do stay tuned for our campus camp!
                    </p>
                    <select
                      id="age"
                      {...form.register("age")}
                      className="w-full bg-transparent border-b border-gray-700 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-gray-400 text-white"
                    >
                      <option
                        value=""
                        disabled
                        selected
                        className="bg-gray-900"
                      >
                        Choose answer
                      </option>
                      <option value="13" className="bg-gray-900">
                        13
                      </option>
                      <option value="14" className="bg-gray-900">
                        14
                      </option>
                      <option value="15" className="bg-gray-900">
                        15
                      </option>
                      <option value="16" className="bg-gray-900">
                        16
                      </option>
                      <option value="17" className="bg-gray-900">
                        17
                      </option>
                    </select>{" "}
                    {form.formState.errors.age && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.age.message}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label className="text-2xl uppercase font-rumble">
                      Gender<span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={watchGender}
                      onValueChange={(value) =>
                        form.setValue("gender", value as "Male" | "Female")
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Male"
                          id="gender-male"
                          className="border-white"
                        />
                        <Label htmlFor="gender-male" className="text-[#bababa]">
                          Male
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Female"
                          id="gender-female"
                          className="border-white"
                        />
                        <Label htmlFor="gender-female" className="text-[#bababa]">
                          Female
                        </Label>
                      </div>
                    </RadioGroup>
                    {form.formState.errors.gender && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.gender.message}
                      </p>
                    )}
                  </div>

                  {/* NRIC/Passport */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="nricPassport"
                      className="text-2xl uppercase font-rumble"
                    >
                      NRIC/Passport Number
                      <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-gray-400">e.g. 123456-78-9000</p>
                    <Input
                      id="nricPassport"
                      type="text"
                      placeholder="Your answer"
                      {...form.register("nricPassport")}
                    />
                    {form.formState.errors.nricPassport && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.nricPassport.message}
                      </p>
                    )}
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="contactNumber"
                      className="text-2xl uppercase font-rumble"
                    >
                      Contact Number<span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-gray-400">e.g. 60123456789</p>
                    <Input
                      id="contactNumber"
                      type="text"
                      placeholder="Your answer"
                      {...form.register("contactNumber")}
                    />
                    {form.formState.errors.contactNumber && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.contactNumber.message}
                      </p>
                    )}
                  </div>

                  {/* Instagram Handle */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="instagramHandle"
                      className="text-2xl uppercase font-rumble"
                    >
                      Instagram Handle
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="instagramHandle"
                      type="text"
                      placeholder="Your answer"
                      {...form.register("instagramHandle")}
                    />
                    {form.formState.errors.instagramHandle && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.instagramHandle.message}
                      </p>
                    )}
                  </div>

                  {/* School Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="schoolName"
                      className="text-2xl uppercase font-rumble"
                    >
                      School Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="schoolName"
                      type="text"
                      placeholder="Your answer"
                      {...form.register("schoolName")}
                    />
                    {form.formState.errors.schoolName && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.schoolName.message}
                      </p>
                    )}
                  </div>

                  {/* YM Member */}
                  <div className="space-y-2">
                    <Label className="text-2xl uppercase font-rumble">
                      Are you a YM Member?
                      <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={watchYmMember}
                      onValueChange={(value) =>
                        form.setValue("ymMember", value as "Yes" | "No")
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Yes"
                          id="ym-yes"
                          className="border-white !accent-white"
                        />
                        <Label htmlFor="ym-yes" className="text-[#bababa]">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="No"
                          id="ym-no"
                          className="border-white !accent-white"
                        />
                        <Label htmlFor="ym-no" className="text-[#bababa]">
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                    {form.formState.errors.ymMember && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.ymMember.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="cursor-pointer w-full bg-white text-black hover:bg-gray-200 rounded-full py-6 text-xl font-rumble"
                  >
                    NEXT
                  </Button>
                </div>
              )}

              {/* Step 2: CG Details */}
              {step === 2 && (
                <div className="space-y-6 w-full">
                  {/* CG Leader */}
                  <div className="space-y-2">
                    <Label className="text-2xl uppercase font-rumble">
                      Select your CG Leader
                      <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-[#BABABA] pb-2">
                      If you're not sure who your CG leader is, kindly select
                      "Not sure"
                    </p>

                    <RadioGroup
                      value={form.getValues("cgLeader")}
                      onValueChange={(value) => {
                        form.setValue("cgLeader", value, {
                          shouldValidate: true,
                        });
                        console.log("CG Leader selected:", value); // Add logging to debug
                      }}
                      disabled={watchYmMember === "No"}
                    >
                      {watchYmMember === "No" ? (
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="N/A"
                            id="cg-na"
                            className="border-gray-600"
                            checked
                          />
                          <Label htmlFor="cg-na" className="text-[#BABABA]">
                            N/A
                          </Label>
                        </div>
                      ) : (
                        <>
                          {CONSTANTS.CG_LEADERS.map((leader) => (
                            <div
                              key={leader}
                              className="flex items-center space-x-2"
                              onClick={() => {
                                if (watchYmMember === "Yes") {
                                  form.setValue("cgLeader", leader, {
                                    shouldValidate: true,
                                  });
                                }
                              }}
                            >
                              {" "}
                              <RadioGroupItem
                                value={leader}
                                id={`cg-${leader.replace(/\s+/g, "-").toLowerCase()}`}
                                className="border-gray-600"
                              />
                              <Label
                                htmlFor={`cg-${leader.replace(/\s+/g, "-").toLowerCase()}`}
                                className="text-[#BABABA] cursor-pointer"
                              >
                                {" "}
                                {leader}
                              </Label>
                            </div>
                          ))}
                          <div
                            className="flex items-center space-x-2"
                            onClick={() => {
                              if (watchYmMember === "Yes") {
                                form.setValue("cgLeader", "Not Sure", {
                                  shouldValidate: true,
                                });
                              }
                            }}
                          >
                            <RadioGroupItem
                              value="Not Sure"
                              id="cg-not-sure"
                              className="border-gray-600"
                            />
                            <Label
                              htmlFor="cg-not-sure"
                              className="text-[#bababa] cursor-pointer"
                            >
                              Not sure
                            </Label>
                          </div>
                        </>
                      )}
                    </RadioGroup>
                    {form.formState.errors.cgLeader && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.cgLeader.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="cursor-pointer w-full bg-white text-black hover:bg-gray-200 rounded-full py-6 text-xl font-rumble"
                  >
                    NEXT
                  </Button>
                </div>
              )}

              {/* Step 3: Emergency Contact */}
              {step === 3 && (
                <div className="space-y-6 w-full">
                  {/* Religious Affiliation */}
                  <div className="space-y-2">
                    <Label className="text-2xl uppercase font-rumble">
                      Are you a Christian?
                      <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={watchIsChristian}
                      onValueChange={(value) =>
                        form.setValue(
                          "isChristian",
                          value as "attending_other" | "not_attending" | "no",
                        )
                      }
                      className="space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="attending_other"
                          id="christian-attending"
                          className="border-gray-600"
                        />
                        <Label
                          htmlFor="christian-attending"
                          className="text-[#bababa]"
                        >
                          Yes, I'm actively attending another church
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="not_attending"
                          id="christian-not-attending"
                          className="border-gray-600"
                        />
                        <Label
                          htmlFor="christian-not-attending"
                          className="text-[#bababa]"
                        >
                          Yes, but I'm not attending any church
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="no"
                          id="not-christian"
                          className="border-gray-600"
                        />
                        <Label
                          htmlFor="not-christian"
                          className="text-[#bababa]"
                        >
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                    {form.formState.errors.isChristian && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.isChristian.message}
                      </p>
                    )}
                  </div>

                  {/* Event Source */}
                  <div className="space-y-2">
                    <Label className="text-2xl uppercase font-rumble">
                      Where did you hear about this event?
                      <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={watchEventSource}
                      onValueChange={(value) =>
                        form.setValue(
                          "eventSource",
                          value as
                            | "ym_services"
                            | "friend"
                            | "social_media"
                            | "school"
                            | "other",
                        )
                      }
                      className="space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="ym_services"
                          id="source-ym"
                          className="border-gray-600"
                        />
                        <Label htmlFor="source-ym" className="text-[#bababa]">
                          YM Sunday Services
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="friend"
                          id="source-friend"
                          className="border-gray-600"
                        />
                        <Label
                          htmlFor="source-friend"
                          className="text-[#bababa]"
                        >
                          A friend who attends YMFGAKL
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="social_media"
                          id="source-social"
                          className="border-gray-600"
                        />
                        <Label
                          htmlFor="source-social"
                          className="text-[#bababa]"
                        >
                          Social media (e.g. Instagram, Facebook)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="school"
                          id="source-school"
                          className="border-gray-600"
                        />
                        <Label
                          htmlFor="source-school"
                          className="text-[#bababa]"
                        >
                          Announcements at school event/chapel/CF
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="other"
                          id="source-other"
                          className="border-gray-600"
                        />
                        <Label
                          htmlFor="source-other"
                          className="text-[#bababa]"
                        >
                          Other:
                        </Label>
                      </div>
                    </RadioGroup>
                    {otherEventSourceSelected && (
                      <Input
                        id="otherEventSource"
                        type="text"
                        placeholder="Your answer"
                        {...form.register("otherEventSource")}
                        className="bg-transparent border-b border-gray-700 rounded-none px-0 h-10 focus-visible:ring-0 focus-visible:border-gray-400 mt-2"
                      />
                    )}
                    {form.formState.errors.eventSource && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.eventSource.message}
                      </p>
                    )}
                    {form.formState.errors.otherEventSource && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.otherEventSource.message}
                      </p>
                    )}
                  </div>

                  {/* Friend who invited */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="invitedByFriend"
                      className="text-2xl uppercase font-rumble"
                    >
                      Name of the friend who invited you
                      <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-gray-400">
                      If not applicable, put "N/A"
                    </p>
                    <Input
                      id="invitedByFriend"
                      type="text"
                      placeholder="Your answer"
                      {...form.register("invitedByFriend")}
                    />
                    {form.formState.errors.invitedByFriend && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.invitedByFriend.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-white text-black hover:bg-gray-200 rounded-full py-6 text-xl font-rumble"
                  >
                    NEXT
                  </Button>
                </div>
              )}

              {/* Step 4: Church Details (for Christians attending other churches) */}
              {step === 4 && (
                <div className="space-y-6 w-full">
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-white text-black hover:bg-gray-200 rounded-full py-6 text-lg font-bold"
                  >
                    NEXT
                  </Button>
                </div>
              )}

              {/* Step 5: Emergency Contact */}
              {step === 5 && (
                <div className="space-y-6 w-full">
                  {/* Emergency Contact Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="emergencyContactName"
                      className="text-2xl uppercase font-rumble"
                    >
                      Emergency Contact's Name
                      <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-sm text-gray-400">
                      In the event of any emergencies (touch wood), this is who
                      we will be contacting.
                    </p>
                    <Input
                      id="emergencyContactName"
                      type="text"
                      placeholder="Your answer"
                      {...form.register("emergencyContactName")}
                    />
                    {form.formState.errors.emergencyContactName && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.emergencyContactName.message}
                      </p>
                    )}
                  </div>

                  {/* Emergency Contact Relationship */}
                  <div className="space-y-2">
                    <Label className="text-2xl uppercase font-rumble">
                      Relationship with Emergency Contact
                      <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={watchRelationship}
                      onValueChange={handleRelationshipChange}
                      className="space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Father"
                          id="rel-father"
                          className="border-gray-600"
                        />
                        <Label htmlFor="rel-father" className="text-[#bababa]">
                          Father
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Mother"
                          id="rel-mother"
                          className="border-gray-600"
                        />
                        <Label htmlFor="rel-mother" className="text-[#bababa]">
                          Mother
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Legal Guardian"
                          id="rel-guardian"
                          className="border-gray-600"
                        />
                        <Label htmlFor="rel-guardian" className="text-[#bababa]">
                          Legal Guardian
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Other"
                          id="rel-other"
                          className="border-gray-600"
                        />
                        <Label htmlFor="rel-other" className="text-[#bababa]">
                          Other:
                        </Label>
                      </div>
                    </RadioGroup>

                    {otherRelationship && (
                      <Input
                        id="otherRelationship"
                        type="text"
                        placeholder="Your answer"
                        {...form.register("otherRelationship")}
                        onChange={(e) =>
                          form.setValue(
                            "emergencyContactRelationship",
                            e.target.value,
                          )
                        }
                      />
                    )}

                    {form.formState.errors.emergencyContactRelationship && (
                      <p className="text-red-500 text-sm">
                        {
                          form.formState.errors.emergencyContactRelationship
                            .message
                        }
                      </p>
                    )}
                  </div>

                  {/* Emergency Contact Number */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="emergencyContactPhone"
                      className="text-2xl uppercase font-rumble"
                    >
                      Emergency Contact Number
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="emergencyContactPhone"
                      type="text"
                      placeholder="Your answer"
                      {...form.register("emergencyContactPhone")}
                    />
                    {form.formState.errors.emergencyContactPhone && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.emergencyContactPhone.message}
                      </p>
                    )}
                  </div>

                  {/* Emergency Contact Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="emergencyContactEmail"
                      className="text-2xl uppercase font-rumble"
                    >
                      Emergency Contact Email
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="emergencyContactEmail"
                      type="email"
                      placeholder="Your answer"
                      {...form.register("emergencyContactEmail")}
                    />
                    {form.formState.errors.emergencyContactEmail && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.emergencyContactEmail.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="cursor-pointer w-full bg-white text-black hover:bg-gray-200 rounded-full py-6 text-xl font-rumble"
                  >
                    {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
                  </Button>
                </div>
              )}
            </form>
          </>
        ) : (
          // Registration Complete Screen
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full space-y-8"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-gray-400 uppercase text-sm pb-4"
              >
                REGISTRATION COMPLETE
              </motion.h3>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="text-6xl font-rumble text-[#BABABA] mb-6"
              >
                See You At Camp
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="text-[#BABABA] mb-6"
              >
                PLEASE KEEP AN EYE ON YOUR INBOX — WE&apos;LL BE SENDING YOU THE
                PAYMENT DETAILS AND THE PARENTAL CONSENT FORM TO SECURE YOUR
                SPOT IN CAMP.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="text-[#BABABA] mb-8"
              >
                IN THE MEANTIME, STAY CONNECTED WITH US THROUGH OUR SOCIALS FOR
                THE LATEST UPDATES!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="w-full bg-white text-black hover:bg-gray-200 rounded-full py-6 text-2xl font-rumble mb-8 cursor-pointer">
                  Payment &amp; Parental Consent Form
                </Button>
              </motion.div>
            </motion.div>

            {/* Hero and Team Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-[#1A1A1A] rounded-lg p-6 mb-6"
            >
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.9 }}
                className="text-2xl font-rumble text-[#BABABA] mb-4"
              >
                Your Hero
              </motion.h3>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1 }}
                className="flex items-center mb-6"
              >
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.1 }}
                  className="w-12 h-12 rounded-full overflow-hidden mr-3"
                >
                  <img
                    src={heroDetails?.icon || "/placeholder.svg"}
                    alt={heroDetails?.name || "Hero"}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <span className="text-[#BABABA] font-medium">
                  {heroDetails?.name}
                </span>
              </motion.div>

              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 1.2 }}
                className="text-2xl font-rumble text-[#BABABA] mb-4"
              >
                Current Team
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 1.3 }}
                className="text-gray-300 mb-4"
              >
                {team?.code} {team?.name}
              </motion.p>

              {teamMembersLoading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex justify-center py-4"
                >
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                  <span className="ml-2 text-gray-300">
                    Loading team members...
                  </span>
                </motion.div>
              ) : teamMembers.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1.4 }}
                  className="space-y-3"
                >
                  {CONSTANTS.HEROES.map((hero, index) => {
                    const member = takenByHeroId.get(hero.id);
                    const isTaken = Boolean(member);
                    const isCurrentUser = member?.line_number === lineNumber;

                    return (
                      <motion.div
                        key={hero.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 1.5 + index * 0.1 }}
                        className={`flex items-center p-2 ${
                          isTaken ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <motion.div 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 1.6 + index * 0.1 }}
                          className="w-10 h-10 rounded-full overflow-hidden mr-3"
                        >
                          <img
                            src={hero.icon || "/placeholder.svg"}
                            alt={hero.name}
                            className={`w-full h-full object-cover ${
                              isTaken ? "grayscale" : ""
                            }`}
                          />
                        </motion.div>

                        <div className="flex-1">
                          <p className="font-medium text-gray-200">
                            {hero.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-amber-500 text-xs">
                                (You)
                              </span>
                            )}
                          </p>

                          <p
                            className={cn(
                              "text-xs uppercase",
                              isTaken ? "text-[#bababa]" : "text-green-500",
                            )}
                          >
                            {isTaken
                              ? isCurrentUser 
                                ? "Your Selection"
                                : (member?.instagram_handle ?? "Taken")
                              : "Available"}
                          </p>

                          {isTaken && (
                            <p className="text-xs text-gray-500">
                              Joined {getRelativeTimeString(member!.created_at)}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1.4 }}
                  className="text-center py-4 text-gray-400"
                >
                  <p>No team members found. Be the first to join!</p>
                </motion.div>
              )}

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 2 }}
                className="mt-4 flex w-full"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Button
                    onClick={fetchTeamMembers}
                    variant="outline"
                    className="w-full self-center bg-white text-black hover:bg-gray-200 rounded-full py-6 text-2xl font-rumble cursor-pointer"
                  >
                    Refresh Team Members
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Team Invite Link */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 2.1 }}
              className="bg-[#1a1a1a] rounded-lg p-6 flex flex-col"
            >
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 2.2 }}
                className="text-2xl font-rumble text-[#bababa] mb-4"
              >
                Team Invite Link
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 2.3 }}
                className="text-[#bababa] mb-4"
              >
                Share your team invite link to your friends so they can join
                your group. Five participants per team.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 2.4 }}
                className="relative mb-4"
              >
                {inviteLinkLoading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center justify-center py-4"
                  >
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    <span className="ml-2 text-gray-300">
                      Generating invite link...
                    </span>
                  </motion.div>
                ) : inviteLinkError ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="bg-red-900 border-red-800 mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{inviteLinkError}</AlertDescription>
                    </Alert>
                  </motion.div>
                ) : (
                  <Input value={inviteLink || ""} readOnly />
                )}
              </motion.div>

              {inviteLinkError ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 2.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleRegenerateInviteLink}
                    className="w-fit self-center bg-white text-black hover:bg-gray-200 rounded-full py-6 text-2xl font-rumble"
                  >
                    Try Again
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 2.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={copyInviteLink}
                    disabled={!inviteLink || inviteLinkLoading}
                    className="w-fit self-center bg-white text-black hover:bg-gray-200 rounded-full py-6 text-2xl font-rumble"
                  >
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                </motion.div>
              )}
            </motion.div>
            {registrationComplete && (
              <TeamMembersSubscription
                teamId={teamId}
                onNewMember={fetchTeamMembers}
              />
            )}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
