"use client";

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { GenerateRecipesFromIngredientsOutput } from '@/ai/flows/generate-recipes-from-ingredients';


type Recipe = GenerateRecipesFromIngredientsOutput['recipes'][0];

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function RecipeCard({ recipe, isFavorite, onToggleFavorite }: RecipeCardProps) {

  // Fallback for old string format for backwards compatibility
  if (typeof recipe === 'string') {
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
    )
  }

  const { title, ingredients, instructions } = recipe;

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
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="ingredients">
                <AccordionTrigger>Ingredients</AccordionTrigger>
                <AccordionContent>
                    <ul className="list-disc pl-5 text-muted-foreground">
                        {ingredients.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="instructions">
                <AccordionTrigger>Instructions</AccordionTrigger>
                <AccordionContent>
                    <ol className="list-decimal pl-5 text-muted-foreground space-y-2">
                         {instructions.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
