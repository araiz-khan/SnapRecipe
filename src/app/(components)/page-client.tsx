"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { recognizeIngredientsFromPhoto } from "@/ai/flows/recognize-ingredients-from-photo";
import { generateRecipesFromIngredients } from "@/ai/flows/generate-recipes-from-ingredients";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RecipeCard } from "@/components/RecipeCard";
import { useFavorites } from "@/hooks/use-favorites";
import { UploadCloud, Salad, Sparkles, ChefHat, Loader2 } from "lucide-react";

const dietaryOptions = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "vegan", label: "Vegan" },
  { id: "dairy-free", label: "Dairy-Free" },
];

export default function PageClient() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<string[]>([]);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);

  const { toast } = useToast();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state for new upload
    setImageUrl(null);
    setIngredients([]);
    setRecipes([]);
    setError(null);
    setIsLoadingIngredients(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUri = reader.result as string;
        setImageUrl(dataUri);
        const { ingredients: recognizedIngredients } = await recognizeIngredientsFromPhoto({ photoDataUri: dataUri });
        setIngredients(recognizedIngredients);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError("Failed to recognize ingredients. Please try another photo.");
      toast({
        variant: "destructive",
        title: "Recognition Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoadingIngredients(false);
    }
  };

  const handleGenerateRecipes = async () => {
    if (ingredients.length === 0) {
      toast({
        variant: "destructive",
        title: "No Ingredients",
        description: "Please upload a photo to identify ingredients first.",
      });
      return;
    }
    setIsLoadingRecipes(true);
    setRecipes([]);
    setError(null);

    try {
      const { recipes: generatedRecipes } = await generateRecipesFromIngredients({
        ingredients: ingredients.join(", "),
        dietaryRestrictions: dietaryRestrictions.join(", "),
      });
      setRecipes(generatedRecipes);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError("Failed to generate recipes. Please try again.");
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  const handleDietaryChange = (id: string, checked: boolean | "indeterminate") => {
    setDietaryRestrictions(prev =>
      checked ? [...prev, id] : prev.filter(item => item !== id)
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8 flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                <UploadCloud className="h-6 w-6 text-primary" />
                1. Upload Your Ingredients
              </CardTitle>
              <CardDescription>Take a photo of your ingredients and we'll do the rest.</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imageUrl ? (
                  <Image src={imageUrl} alt="Uploaded Ingredients" layout="fill" objectFit="contain" className="rounded-lg p-2" />
                ) : (
                  <div className="text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
                <Input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                <Salad className="h-6 w-6 text-primary" />
                2. Recognized Ingredients
              </CardTitle>
              <CardDescription>Here's what we found in your photo.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[6rem]">
              {isLoadingIngredients ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : ingredients.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient) => (
                    <Badge key={ingredient} variant="secondary" className="text-base px-4 py-1">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">Upload an image to see ingredients here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                <Sparkles className="h-6 w-6 text-primary" />
                3. Generate Recipes
              </CardTitle>
              <CardDescription>Filter by dietary needs and find your next meal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Dietary Restrictions</h4>
                <div className="grid grid-cols-2 gap-4">
                  {dietaryOptions.map(option => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox id={option.id} onCheckedChange={(checked) => handleDietaryChange(option.id, checked)} />
                      <Label htmlFor={option.id} className="cursor-pointer">{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleGenerateRecipes} disabled={isLoadingRecipes || ingredients.length === 0} className="w-full">
                {isLoadingRecipes ? "Generating..." : "Generate Recipes"}
              </Button>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
             <h2 className="flex items-center gap-2 font-headline text-2xl">
              <ChefHat className="h-6 w-6 text-primary" />
              Your Recipe Suggestions
            </h2>
            {isLoadingRecipes ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader>
                    <CardContent><Skeleton className="h-16 w-full" /></CardContent>
                  </Card>
                ))}
              </div>
            ) : recipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipes.map((recipe, index) => (
                  <RecipeCard
                    key={index}
                    recipe={recipe}
                    isFavorite={isFavorite(recipe)}
                    onToggleFavorite={() => isFavorite(recipe) ? removeFavorite(recipe) : addFavorite(recipe)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Your recipes will appear here after generation.</p>
              </div>
            )}
            {error && <p className="text-destructive text-center">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
