export type Gym = {
  id: number;
  name: string;
  slug: string;
  city: string;
  address: string;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  activities: string | null;
  equipmentSummary: string | null;
  status: string;
  ownerId: number;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GymMinimal = {
  id: number;
  name: string;
  slug: string;
  city: string;
  address: string;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  activities: string | null;
};
