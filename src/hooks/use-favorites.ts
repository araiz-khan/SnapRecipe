"use client";

import { useState, useEffect, useCallback } from 'react';
import type { GenerateRecipesFromIngredientsOutput } from '@/ai/flows/generate-recipes-from-ingredients';

const FAVORITES_KEY = 'snaprecipe-favorites';
type Recipe = GenerateRecipesFromIngredientsOutput['recipes'][0];


export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedFavorites = window.localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  const saveFavorites = (newFavorites: string[]) => {
    try {
      setFavorites(newFavorites);
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Failed to save favorites to localStorage', error);
    }
  };

  const addFavorite = useCallback((recipe: Recipe | string) => {
    const recipeString = typeof recipe === 'string' ? recipe : JSON.stringify(recipe);
    if (!favorites.includes(recipeString)) {
      saveFavorites([...favorites, recipeString]);
    }
  }, [favorites]);

  const removeFavorite = useCallback((recipe: Recipe | string) => {
     const recipeString = typeof recipe === 'string' ? recipe : JSON.stringify(recipe);
    saveFavorites(favorites.filter((fav) => fav !== recipeString));
  }, [favorites]);

  const isFavorite = useCallback((recipe: Recipe | string) => {
    const recipeString = typeof recipe === 'string' ? recipe : JSON.stringify(recipe);
    return favorites.includes(recipeString);
  }, [favorites]);

  return { favorites, addFavorite, removeFavorite, isFavorite, isLoaded };
};
