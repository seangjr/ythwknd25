"use client";

import { createClient } from "@/lib/supabase";
import { useEffect } from "react";

interface TeamMembersSubscriptionProps {
  teamId: number;
  onNewMember: () => void;
}

export function TeamMembersSubscription({
  teamId,
  onNewMember,
}: TeamMembersSubscriptionProps) {
  useEffect(() => {
    const supabase = createClient();

    // Subscribe to changes in the registrations table for this team
    const subscription = supabase
      .channel("registrations-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "registrations",
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          console.log("New team member registered:", payload);
          onNewMember();
        },
      )
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [teamId, onNewMember]);

  // This component doesn't render anything
  return null;
}
