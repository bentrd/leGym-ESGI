"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import type { GymMinimal } from "@/types/gym";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false });

type GymMapProps = {
  gyms: GymMinimal[];
};

type GymLocation = GymMinimal & {
  lat: number;
  lng: number;
  locationAccuracy: "high" | "medium" | "low";
  distance?: number;
};

export function GymMap({ gyms }: GymMapProps) {
  const [gymsWithLocations, setGymsWithLocations] = useState<GymLocation[]>([]);
  const [failedGyms, setFailedGyms] = useState<GymMinimal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nearestMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [gymIcon, setGymIcon] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [nearestGymIcon, setNearestGymIcon] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userIcon, setUserIcon] = useState<any>(null);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    setIsRequestingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setUserLocation([userLat, userLng]);
        setIsRequestingLocation(false);

        const gymsWithDistances = gymsWithLocations
          .map((gym) => ({
            ...gym,
            distance: calculateDistance(userLat, userLng, gym.lat, gym.lng),
          }))
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));

        setGymsWithLocations(gymsWithDistances);

        if (gymsWithDistances.length > 0 && mapRef.current) {
          const nearest = gymsWithDistances[0];

          import("leaflet").then((L) => {
            const bounds = L.latLngBounds([
              [userLat, userLng],
              [nearest.lat, nearest.lng],
            ]);

            mapRef.current.fitBounds(bounds, {
              padding: [80, 80],
              maxZoom: 14,
              animate: true,
              duration: 1,
            });
          });

          setTimeout(() => {
            if (nearestMarkerRef.current) {
              nearestMarkerRef.current.openPopup();
            }
          }, 500);
        }
      },
      (error) => {
        setIsRequestingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Autorisation de localisation refusée");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Position non disponible");
            break;
          case error.TIMEOUT:
            setLocationError("Délai de localisation dépassé");
            break;
          default:
            setLocationError("Erreur de géolocalisation");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  useEffect(() => {
    if (!isMounted || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      const redIcon = L.divIcon({
        className: "custom-gym-marker",
        html: `
          <div style="
            background: white;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid #e5e7eb;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              font-size: 18px;
            ">💪</div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const blueIcon = L.divIcon({
        className: "custom-gym-marker",
        html: `
          <div style="
            background: white;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid #3b82f6;
            box-shadow: 0 4px 12px rgba(59,130,246,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              font-size: 18px;
            ">💪</div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const userLocationIcon = L.divIcon({
        className: "custom-user-marker",
        html: `
          <div style="
            background: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 2px solid #3b82f6;
            box-shadow: 0 4px 12px rgba(59,130,246,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              font-size: 16px;
            ">😊</div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      setGymIcon(redIcon);
      setNearestGymIcon(blueIcon);
      setUserIcon(userLocationIcon);
    });
  }, [isMounted]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    async function geocodeGyms() {
      const located: GymLocation[] = [];
      const failed: GymMinimal[] = [];

      for (const gym of gyms) {
        try {
          if (gym.latitude && gym.longitude) {
            located.push({
              ...gym,
              lat: gym.latitude,
              lng: gym.longitude,
              locationAccuracy: "high",
            });
            continue;
          }

          const query = encodeURIComponent(`${gym.address}, ${gym.city}, France`);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
            {
              headers: {
                "User-Agent": "LeGym/1.0",
              },
            },
          );

          if (response.ok) {
            const data = await response.json();
            if (data[0]) {
              let accuracy: "high" | "medium" | "low" = "low";
              const result = data[0];
              const importance = parseFloat(result.importance || "0");
              const resultType = result.type;
              const resultClass = result.class;

              if (
                (resultClass === "building" ||
                  resultType === "house" ||
                  resultType === "building") &&
                importance > 0.3
              ) {
                accuracy = "high";
              } else if (
                (resultClass === "highway" || resultType === "road" || resultType === "street") &&
                importance > 0.2
              ) {
                accuracy = "medium";
              } else {
                accuracy = "low";
              }

              located.push({
                ...gym,
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon),
                locationAccuracy: accuracy,
              });
            } else {
              failed.push(gym);
            }
          } else {
            failed.push(gym);
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to geocode ${gym.name}:`, error);
          failed.push(gym);
        }
      }

      setGymsWithLocations(located);
      setFailedGyms(failed);
      setIsLoading(false);
    }

    geocodeGyms();
  }, [gyms, isMounted]);

  if (!isMounted || isLoading) {
    return (
      <div className="bg-muted/50 flex h-125 items-center justify-center rounded-lg border">
        <p className="text-muted-foreground">Chargement de la carte...</p>
      </div>
    );
  }

  if (gymsWithLocations.length === 0) {
    return (
      <div className="bg-muted/50 flex h-125 items-center justify-center rounded-lg border">
        <p className="text-muted-foreground">Aucune salle localisée</p>
      </div>
    );
  }

  const centerLat = gymsWithLocations.reduce((sum, g) => sum + g.lat, 0) / gymsWithLocations.length;
  const centerLng = gymsWithLocations.reduce((sum, g) => sum + g.lng, 0) / gymsWithLocations.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          onClick={requestLocation}
          disabled={isRequestingLocation || !!userLocation}
          color={userLocation ? "blue" : undefined}
          size="sm"
          startIcon={
            userLocation ? <MapPin className="h-4 w-4" /> : <Navigation className="h-4 w-4" />
          }
        >
          {isRequestingLocation
            ? "Localisation en cours..."
            : userLocation
              ? "Position activée"
              : "Voir les salles près de moi"}
        </Button>
        {locationError && <p className="text-sm text-red-600">{locationError}</p>}
        {userLocation && gymsWithLocations.length > 0 && gymsWithLocations[0]?.distance && (
          <p className="text-muted-foreground text-sm">
            Salle la plus proche : <span className="font-medium">{gymsWithLocations[0].name}</span>{" "}
            à <span className="font-medium">{gymsWithLocations[0].distance.toFixed(1)} km</span>
          </p>
        )}
      </div>

      {failedGyms.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">
            ⚠️ {failedGyms.length} salle{failedGyms.length > 1 ? "s" : ""} n&apos;
            {failedGyms.length > 1 ? "ont" : "a"} pas pu être localisée
            {failedGyms.length > 1 ? "s" : ""} sur la carte :
          </p>
          <ul className="mt-2 space-y-1">
            {failedGyms.slice(0, 3).map((gym) => (
              <li key={gym.id} className="text-xs text-amber-800">
                • {gym.name} ({gym.address}, {gym.city})
              </li>
            ))}
            {failedGyms.length > 3 && (
              <li className="text-xs text-amber-800">• et {failedGyms.length - 3} autres...</li>
            )}
          </ul>
        </div>
      )}

      <div className="h-125 w-full overflow-hidden rounded-lg border">
        {typeof window !== "undefined" && (
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={6}
            scrollWheelZoom={true}
            className="h-full w-full"
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={20}
            />

            {userLocation && userIcon && (
              <>
                <Marker position={userLocation} icon={userIcon}>
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">Votre position</h3>
                      <p className="text-muted-foreground text-sm">Vous êtes ici</p>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={userLocation}
                  radius={1000}
                  pathOptions={{
                    color: "#3b82f6",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.15,
                  }}
                />
              </>
            )}

            {gymIcon &&
              nearestGymIcon &&
              gymsWithLocations.map((gym, index) => {
                const isNearest = index === 0 && userLocation && gym.distance;
                return (
                  <Marker
                    key={gym.id}
                    position={[gym.lat, gym.lng]}
                    ref={isNearest ? nearestMarkerRef : null}
                    icon={isNearest ? nearestGymIcon : gymIcon}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold">{gym.name}</h3>
                        <p className="text-muted-foreground text-sm">{gym.city}</p>
                        <p className="text-muted-foreground text-xs">{gym.address}</p>
                        {gym.distance && (
                          <p className="mt-1 text-sm font-medium text-blue-600">
                            📍 À {gym.distance.toFixed(1)} km de vous
                          </p>
                        )}
                        <Link
                          href={`/salles/${gym.slug}`}
                          className="text-primary mt-2 inline-block text-sm underline"
                        >
                          Voir les détails
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
