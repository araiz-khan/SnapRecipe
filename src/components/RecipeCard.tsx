"use client";

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RecipeCardProps {
  recipe: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function RecipeCard({ recipe, isFavorite, onToggleFavorite }: RecipeCardProps) {
  const [title, ...descriptionParts] = recipe.split(':');
  const description = descriptionParts.join(':').trim();

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <CardTitle className="font-headline text-lg">{title}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={cn("h-5 w-5", isFavorite && 'fill-red-500 text-red-500')} />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
