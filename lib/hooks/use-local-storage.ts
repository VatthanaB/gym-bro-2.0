"use client"

import { useState, useEffect, useCallback } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
    }
    setIsLoaded(true)
  }, [key])

  // Save to localStorage whenever storedValue changes (after initial load)
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue, isLoaded])

  // Wrapped setter that also updates localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue((prev) => {
      const valueToStore = value instanceof Function ? value(prev) : value
      return valueToStore
    })
  }, [])

  return [storedValue, setValue, isLoaded] as const
}

// Hook for managing workout logs
export function useWorkoutLogs() {
  const [logs, setLogs, isLoaded] = useLocalStorage<
    import("@/lib/types").WorkoutLog[]
  >("gym-bro-workout-logs", [])

  const addLog = useCallback(
    (log: import("@/lib/types").WorkoutLog) => {
      setLogs((prev) => [...prev, log])
    },
    [setLogs]
  )

  const updateLog = useCallback(
    (id: string, updates: Partial<import("@/lib/types").WorkoutLog>) => {
      setLogs((prev) =>
        prev.map((log) => (log.id === id ? { ...log, ...updates } : log))
      )
    },
    [setLogs]
  )

  const getLogsByDateRange = useCallback(
    (startDate: string, endDate: string) => {
      return logs.filter((log) => log.date >= startDate && log.date <= endDate)
    },
    [logs]
  )

  const getTodayLog = useCallback(() => {
    const today = new Date().toISOString().split("T")[0]
    return logs.find((log) => log.date === today)
  }, [logs])

  return {
    logs,
    setLogs,
    addLog,
    updateLog,
    getLogsByDateRange,
    getTodayLog,
    isLoaded,
  }
}

// Hook for weight tracking
export function useWeightHistory() {
  const [weights, setWeights, isLoaded] = useLocalStorage<
    import("@/lib/types").WeightEntry[]
  >("gym-bro-weight-history", [])

  const addWeight = useCallback(
    (entry: import("@/lib/types").WeightEntry) => {
      setWeights((prev) => {
        // Replace if same date exists
        const filtered = prev.filter((w) => w.date !== entry.date)
        return [...filtered, entry].sort((a, b) =>
          a.date.localeCompare(b.date)
        )
      })
    },
    [setWeights]
  )

  const getLatestWeight = useCallback(() => {
    if (weights.length === 0) return null
    return weights[weights.length - 1]
  }, [weights])

  return { weights, addWeight, getLatestWeight, isLoaded }
}

// Hook for user profile
export function useUserProfile() {
  const [profile, setProfile, isLoaded] = useLocalStorage<
    import("@/lib/types").UserProfile
  >("gym-bro-profile", {
    name: "Vatthana",
    currentWeight: 118,
    targetWeight: 80,
    height: 175,
    startDate: new Date().toISOString().split("T")[0],
    weekNumber: 1,
  })

  return { profile, setProfile, isLoaded }
}

// Hook for user meal preferences
export function useUserMeals() {
  const [customMeals, setCustomMeals, isLoaded] = useLocalStorage<
    import("@/lib/types").UserMealPreferences
  >("gym-bro-meals", {
    customMeals: {
      breakfast: [],
      snack1: [],
      lunch: [],
      snack2: [],
      dinner: [],
    },
  })

  const updateMealFoods = useCallback(
    (slot: import("@/lib/types").MealSlot, foods: import("@/lib/types").Food[]) => {
      setCustomMeals((prev) => ({
        ...prev,
        customMeals: {
          ...prev.customMeals,
          [slot]: foods,
        },
      }))
    },
    [setCustomMeals]
  )

  const addFoodToMeal = useCallback(
    (slot: import("@/lib/types").MealSlot, food: import("@/lib/types").Food) => {
      setCustomMeals((prev) => ({
        ...prev,
        customMeals: {
          ...prev.customMeals,
          [slot]: [...prev.customMeals[slot], food],
        },
      }))
    },
    [setCustomMeals]
  )

  const removeFoodFromMeal = useCallback(
    (slot: import("@/lib/types").MealSlot, foodId: string) => {
      setCustomMeals((prev) => ({
        ...prev,
        customMeals: {
          ...prev.customMeals,
          [slot]: prev.customMeals[slot].filter((f) => f.id !== foodId),
        },
      }))
    },
    [setCustomMeals]
  )

  const resetMeal = useCallback(
    (slot: import("@/lib/types").MealSlot) => {
      setCustomMeals((prev) => ({
        ...prev,
        customMeals: {
          ...prev.customMeals,
          [slot]: [],
        },
      }))
    },
    [setCustomMeals]
  )

  const resetAllMeals = useCallback(() => {
    setCustomMeals({
      customMeals: {
        breakfast: [],
        snack1: [],
        lunch: [],
        snack2: [],
        dinner: [],
      },
    })
  }, [setCustomMeals])

  return {
    customMeals: customMeals.customMeals,
    updateMealFoods,
    addFoodToMeal,
    removeFoodFromMeal,
    resetMeal,
    resetAllMeals,
    isLoaded,
  }
}

