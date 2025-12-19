export const ButtonColors = {
  RED: "red",
  ORANGE: "orange",
  PURPLE: "purple",
  GREEN: "green",
  BLUE: "blue",
  PINK: "pink",
  GREY: "grey",
  YELLOW: "yellow",
  AMBER: "amber",
  GOLD: "gold",
  BLACK: "black",
} as const;

export type ButtonColor = (typeof ButtonColors)[keyof typeof ButtonColors];

export type CarouselSurface = "white" | "background" | "gray-100" | "gray-50" | "muted";

export const colorStyles: Record<
  ButtonColor,
  {
    bg: string;
    border: string;
    text: string;
    hover: string;
    tintBg: string;
    tintBorder: string;
    icon: string;
    shadow: string;
    tintHover?: string;
  }
> = {
  red: {
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-600",
    hover: "hover:bg-red-100 hover:text-red-700",
    tintBg: "bg-red-50",
    tintBorder: "border-red-200",
    icon: "text-red-500",
    shadow: "drop-shadow(0 0 6px rgba(248, 113, 113, 0.35))",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-600",
    hover: "hover:bg-orange-100 hover:text-orange-700",
    tintBg: "bg-orange-50",
    tintBorder: "border-orange-200",
    icon: "text-orange-500",
    shadow: "drop-shadow(0 0 6px rgba(249, 115, 22, 0.35))",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-300",
    text: "text-purple-600",
    hover: "hover:bg-purple-100 hover:text-purple-700",
    tintBg: "bg-purple-50",
    tintBorder: "border-purple-200",
    icon: "text-purple-500",
    shadow: "drop-shadow(0 0 6px rgba(192, 132, 252, 0.35))",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-300",
    text: "text-green-600",
    hover: "hover:bg-green-100 hover:text-green-700",
    tintBg: "bg-green-50",
    tintBorder: "border-green-200",
    icon: "text-green-500",
    shadow: "drop-shadow(0 0 6px rgba(74, 222, 128, 0.35))",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-600",
    hover: "hover:bg-blue-100 hover:text-blue-700",
    tintBg: "bg-blue-50",
    tintBorder: "border-blue-200",
    icon: "text-blue-500",
    shadow: "drop-shadow(0 0 6px rgba(96, 165, 250, 0.35))",
  },
  pink: {
    bg: "bg-pink-50",
    border: "border-pink-300",
    text: "text-pink-600",
    hover: "hover:bg-pink-100 hover:text-pink-700",
    tintBg: "bg-pink-50",
    tintBorder: "border-pink-200",
    icon: "text-pink-500",
    shadow: "drop-shadow(0 0 6px rgba(244, 114, 182, 0.35))",
  },
  grey: {
    bg: "bg-gray-50",
    border: "border-border",
    text: "text-foreground",
    hover: "hover:bg-gray-100 hover:text-foreground",
    tintBg: "bg-gray-50",
    tintBorder: "border-border",
    icon: "text-foreground",
    shadow: "drop-shadow(0 0 6px rgba(0, 0, 0, 0.12))",
  },
  yellow: {
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    text: "text-yellow-600",
    hover: "hover:bg-yellow-100 hover:text-yellow-700",
    tintBg: "bg-yellow-50",
    tintBorder: "border-yellow-200",
    icon: "text-yellow-500",
    shadow: "drop-shadow(0 0 6px rgba(234, 179, 8, 0.35))",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-600",
    hover: "hover:bg-amber-100 hover:text-amber-700",
    tintBg: "bg-amber-50",
    tintBorder: "border-amber-200",
    icon: "text-amber-500",
    shadow: "drop-shadow(0 0 6px rgba(245, 158, 11, 0.35))",
  },
  gold: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    hover: "hover:bg-amber-100 hover:text-amber-800",
    tintBg: "bg-amber-50",
    tintBorder: "border-amber-200",
    icon: "text-amber-600",
    shadow: "drop-shadow(0 0 6px rgba(234, 179, 8, 0.35))",
  },
  black: {
    bg: "bg-gray-900",
    border: "border-gray-800",
    text: "text-white",
    hover: "hover:bg-gray-800 hover:text-white",
    tintBg: "bg-gray-50",
    tintBorder: "border-gray-200",
    icon: "text-gray-900",
    shadow: "drop-shadow(0 0 6px rgba(17, 24, 39, 0.28))",
    tintHover: "hover:bg-gray-100 hover:text-gray-900",
  },
};
