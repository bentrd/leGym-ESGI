import Link from "next/link";

type FooterProps = {
  year?: number;
};

export function Footer({ year = new Date().getFullYear() }: FooterProps) {
  return (
    <footer className="border-t border-white bg-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 lg:px-8">
        <div className="text-foreground flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black text-xs font-semibold text-white uppercase sm:h-9 sm:w-9">
            LG
          </div>
          <div className="flex flex-col">
            <span className="font-medium">leGym</span>
            <span className="text-muted-foreground text-xs">
              Accès client à toutes les salles du réseau.
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <Link href="/auth/connexion" className="hover:text-foreground transition-colors">
            Espace client
          </Link>
          <Link href="/auth/inscription" className="hover:text-foreground transition-colors">
            Devenir membre
          </Link>
          <span className="text-muted-foreground text-xs">© {year} leGym</span>
        </div>
      </div>
    </footer>
  );
}
