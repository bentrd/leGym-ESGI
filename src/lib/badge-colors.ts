export const BADGE_COLORS = [
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-pink-100 text-pink-700 border-pink-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-cyan-100 text-cyan-700 border-cyan-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-teal-100 text-teal-700 border-teal-200",
  "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  "bg-orange-100 text-orange-700 border-orange-200",
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-slate-100 text-slate-700 border-slate-200",
  "bg-lime-100 text-lime-700 border-lime-200",
  "bg-sky-100 text-sky-700 border-sky-200",
  "bg-red-100 text-red-700 border-red-200",
];

export const BADGE_COLORS_HOVER = [
  "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200",
  "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
  "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200",
  "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200",
  "bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200",
  "bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200",
  "bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200",
  "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-200",
  "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200",
  "bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200",
  "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200",
  "bg-lime-100 text-lime-700 border-lime-200 hover:bg-lime-200",
  "bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200",
  "bg-red-100 text-red-700 border-red-200 hover:bg-red-200",
];

export const getBadgeColor = (str: string, hover = false): string => {
  const colors = hover ? BADGE_COLORS_HOVER : BADGE_COLORS;
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char + 0x500;
    hash = hash & hash;
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
