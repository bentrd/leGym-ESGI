"use client";

import { HeroSection } from "./hero-section";
import { FeaturesCard } from "./features-card";
import { GymsSection } from "./gyms-section";
import { ChallengesSection } from "./challenges-section";
import { CTACard } from "./cta-card";
import { useUser } from "@/contexts/user-context";
import type { GymMinimal } from "@/types/gym";

type ChallengeMinimal = {
  id: number;
  title: string;
  description: string | null;
  difficulty: string;
  duration: number | null;
  gym: {
    name: string;
    city: string;
  } | null;
};

type HomePageContentProps = {
  isAuthed?: boolean;
  gyms: GymMinimal[];
  challenges: ChallengeMinimal[];
};

export function HomePageContent({
  isAuthed: isAuthedProp,
  gyms,
  challenges,
}: HomePageContentProps) {
  const { user } = useUser();
  const isAuthed = isAuthedProp ?? Boolean(user);

  return (
    <div className="space-y-12 sm:space-y-16">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-10">
        <HeroSection isAuthed={isAuthed} />
        <FeaturesCard />
      </section>

      <GymsSection gyms={gyms} isAuthed={isAuthed} surface="background" />

      <ChallengesSection challenges={challenges} surface="background" />

      <CTACard isAuthed={isAuthed} />
    </div>
  );
}
