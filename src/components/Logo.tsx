import { ChefHat } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="SnapRecipe Home">
      <ChefHat className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-bold text-foreground font-headline tracking-tighter">
        SnapRecipe
      </h1>
    </Link>
  );
}
