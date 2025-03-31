"use client"

import { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Create the context
const CurrencyContext = createContext(null)

const API_KEY = "d8783844f409cd245e8278ec"

// Fallback rates in case API is not available
const FALLBACK_RATES = {
  JPY: {
    USD: 0.0067,
    PEN: 0.025,
    MXN: 0.12,
    EUR: 0.0062,
    GBP: 0.0053,
    CAD: 0.0091,
    AUD: 0.01,
  },
  USD: {
    JPY: 149.5,
    PEN: 3.72,
    MXN: 17.95,
    EUR: 0.92,
    GBP: 0.79,
    CAD: 1.36,
    AUD: 1.52,
  },
}

export const CurrencyProvider = ({ children }) => {
  const [baseCurrency, setBaseCurrency] = useState("JPY")
  const [targetCurrencies, setTargetCurrencies] = useState(["USD", "PEN", "MXN"])
  const [conversionRates, setConversionRates] = useState({})
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load saved preferences and cached rates
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [savedBase, savedTargets, savedLastUpdated, savedRates] = await Promise.all([
          AsyncStorage.getItem("baseCurrency"),
          AsyncStorage.getItem("targetCurrencies"),
          AsyncStorage.getItem("lastUpdated"),
          AsyncStorage.getItem("cachedRates")
        ])

        if (savedBase) setBaseCurrency(savedBase)
        if (savedTargets) setTargetCurrencies(JSON.parse(savedTargets))
        if (savedLastUpdated) setLastUpdated(savedLastUpdated)
        if (savedRates) setConversionRates(JSON.parse(savedRates))

        // Check if we need to refresh rates (older than 24 hours)
        const lastUpdate = savedLastUpdated ? new Date(savedLastUpdated) : null
        const now = new Date()
        if (!lastUpdate || now.getTime() - lastUpdate.getTime() > 24 * 60 * 60 * 1000) {
          refreshRates()
        }
      } catch (error) {
        console.error("Error loading preferences:", error)
        setError("Failed to load preferences")
      }
    }

    loadPreferences()
  }, [])

  // Save preferences when they change
  useEffect(() => {
    const savePreferences = async () => {
      try {
        await AsyncStorage.setItem("baseCurrency", baseCurrency)
        await AsyncStorage.setItem("targetCurrencies", JSON.stringify(targetCurrencies))
      } catch (error) {
        console.error("Error saving preferences:", error)
        setError("Failed to save preferences")
      }
    }

    savePreferences()
  }, [baseCurrency, targetCurrencies])

  const updateBaseCurrency = (currency) => {
    setBaseCurrency(currency)
    refreshRates()
  }

  const toggleTargetCurrency = (currency) => {
    setTargetCurrencies((prev) => {
      if (prev.includes(currency)) {
        return prev.filter((c) => c !== currency)
      } else {
        return [...prev, currency]
      }
    })
  }

  const refreshRates = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${baseCurrency}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates')
      }

      const data = await response.json()
      if (data.result === "error") {
        throw new Error(data["error-type"] || 'API Error')
      }

      const now = new Date().toISOString()
      
      // Format the rates to match our app's structure
      const rates = {}
      targetCurrencies.forEach(currency => {
        const rate = data.conversion_rates[currency]
        if (rate) {
          rates[currency] = rate
        } else {
          console.warn(`No rate found for ${currency}, using fallback`)
          rates[currency] = FALLBACK_RATES[baseCurrency]?.[currency] || 1
        }
      })

      console.log('Updated rates:', rates)
      setConversionRates(rates)
      setLastUpdated(now)

      // Cache the rates and timestamp
      await Promise.all([
        AsyncStorage.setItem("lastUpdated", now),
        AsyncStorage.setItem("cachedRates", JSON.stringify(rates))
      ])
    } catch (error) {
      console.error("Error fetching rates:", error)
      setError("Failed to fetch current rates. Using cached or fallback rates.")
      
      // Try to use cached rates first, then fallback rates
      try {
        const cachedRates = await AsyncStorage.getItem("cachedRates")
        if (cachedRates) {
          const rates = JSON.parse(cachedRates)
          console.log('Using cached rates:', rates)
          setConversionRates(rates)
        } else if (FALLBACK_RATES[baseCurrency]) {
          console.log('Using fallback rates:', FALLBACK_RATES[baseCurrency])
          setConversionRates(FALLBACK_RATES[baseCurrency])
        }
      } catch (storageError) {
        console.error("Error reading cached rates:", storageError)
        if (FALLBACK_RATES[baseCurrency]) {
          setConversionRates(FALLBACK_RATES[baseCurrency])
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CurrencyContext.Provider
      value={{
        baseCurrency,
        setBaseCurrency: updateBaseCurrency,
        targetCurrencies,
        toggleTargetCurrency,
        conversionRates,
        lastUpdated,
        refreshRates,
        isLoading,
        error,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrencyContext = () => useContext(CurrencyContext)

