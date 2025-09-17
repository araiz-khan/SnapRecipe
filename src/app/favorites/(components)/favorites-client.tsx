"use client";

import { useFavorites } from "@/hooks/use-favorites";
import { RecipeCard } from "@/components/RecipeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";

export default function FavoritesClient() {
  const { favorites, isLoaded, addFavorite, removeFavorite, isFavorite } = useFavorites();

  return (
    <div className="container mx-auto p-4 md:p-8 flex-1">
      <h1 className="text-3xl font-bold mb-8 font-headline">My Favorite Recipes</h1>
      
      {!isLoaded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-20 w-full" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {isLoaded && favorites.length === 0 && (
        <div className="text-center py-20 px-4 border-2 border-dashed rounded-lg flex flex-col items-center">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">No Favorites Yet</h2>
            <p className="text-muted-foreground mt-2">Your favorite recipes will be saved here.</p>
        </div>
      )}

      {isLoaded && favorites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((recipe, index) => (
            <RecipeCard
              key={index}
              recipe={recipe}
              isFavorite={isFavorite(recipe)}
              onToggleFavorite={() => isFavorite(recipe) ? removeFavorite(recipe) : addFavorite(recipe)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
