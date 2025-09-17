"use client";

import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'snaprecipe-favorites';

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

  const addFavorite = useCallback((recipe: string) => {
    if (!favorites.includes(recipe)) {
      saveFavorites([...favorites, recipe]);
    }
  }, [favorites, saveFavorites]);

  const removeFavorite = useCallback((recipe: string) => {
    saveFavorites(favorites.filter((fav) => fav !== recipe));
  }, [favorites, saveFavorites]);

  const isFavorite = useCallback((recipe: string) => {
    return favorites.includes(recipe);
  }, [favorites]);

  return { favorites, addFavorite, removeFavorite, isFavorite, isLoaded };
};
