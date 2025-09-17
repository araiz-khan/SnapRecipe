
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { recognizeIngredientsFromPhoto } from "@/ai/flows/recognize-ingredients-from-photo";
import { generateRecipesFromIngredients, GenerateRecipesFromIngredientsOutput } from "@/ai/flows/generate-recipes-from-ingredients";
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
import { UploadCloud, Salad, Sparkles, ChefHat, Loader2, Camera, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const dietaryOptions = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "vegan", label: "Vegan" },
  { id: "dairy-free", label: "Dairy-Free" },
];

type Recipe = GenerateRecipesFromIngredientsOutput['recipes'][0];

export default function PageClient() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const { toast } = useToast();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!showCamera) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
        setShowCamera(false);
      }
    };

    getCameraPermission();
    
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [showCamera, toast]);


  const processImage = async (dataUri: string) => {
    setImageUrl(dataUri);
    setIsLoadingIngredients(true);
    setHasUploaded(true);
    setIngredients([]);
    setRecipes([]);
    setError(null);
    try {
      const { ingredients: recognizedIngredients } = await recognizeIngredientsFromPhoto({ photoDataUri: dataUri });
      setIngredients(recognizedIngredients);
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
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        processImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError("Failed to process image. Please try again.");
      toast({
        variant: "destructive",
        title: "Image Processing Failed",
        description: errorMessage,
      });
      setIsLoadingIngredients(false);
    }
  };

   const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        processImage(dataUri);
      }
      setShowCamera(false);
    }
  };


  const handleGenerateRecipes = async () => {
    if (ingredients.length === 0) {
      toast({
        variant: "destructive",
        title: "No Ingredients",
        description: "Please upload or capture a photo to identify ingredients first.",
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
  
  const openCamera = () => {
    setImageUrl(null);
    setIngredients([]);
    setRecipes([]);
    setError(null);
    setHasUploaded(false);
    setShowCamera(true);
  }

  return (
    <div className="container mx-auto p-4 md:p-8 flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between font-headline text-2xl">
                 <div className="flex items-center gap-2">
                    <UploadCloud className="h-6 w-6 text-primary" />
                    1. Get Your Ingredients
                 </div>
                 <div className="flex gap-2">
                   <Button variant="outline" size="icon" onClick={openCamera} aria-label="Open Camera">
                      <Camera className="h-5 w-5" />
                   </Button>
                 </div>
              </CardTitle>
              <CardDescription>Upload a photo or use your camera to snap a pic of your ingredients.</CardDescription>
            </CardHeader>
            <CardContent>
             {showCamera ? (
                <div className="space-y-4">
                  <div className="relative">
                    <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted playsInline />
                     <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-black/50 hover:bg-black/75 text-white" onClick={() => setShowCamera(false)}>
                        <X className="h-5 w-5"/>
                     </Button>
                  </div>
                  {hasCameraPermission === false && (
                    <Alert variant="destructive">
                      <AlertTitle>Camera Access Denied</AlertTitle>
                      <AlertDescription>
                        Please enable camera permissions in your browser settings to use this feature.
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button onClick={handleCapture} disabled={hasCameraPermission !== true} className="w-full">
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Photo
                  </Button>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : (
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
              )}
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
                  <p className="text-sm text-muted-foreground">
                    {hasUploaded ? 'No ingredients recognized. Try another photo.' : 'Upload an image to see ingredients here.'}
                  </p>
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
              <div className="grid grid-cols-1 gap-4">
                {recipes.map((recipe, index) => (
                  <RecipeCard
                    key={index}
                    recipe={recipe}
                    isFavorite={isFavorite(recipe.title)}
                    onToggleFavorite={() => isFavorite(recipe.title) ? removeFavorite(recipe.title) : addFavorite(recipe.title)}
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

    