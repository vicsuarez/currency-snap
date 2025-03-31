"use client"
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useCurrencyContext } from "../context/currency-context"

const AVAILABLE_CURRENCIES = [
  { code: "JPY", name: "Japanese Yen" },
  { code: "USD", name: "US Dollar" },
  { code: "PEN", name: "Peruvian Sol" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
]

export default function SettingsScreen({ onClose }) {
  const { baseCurrency, setBaseCurrency, targetCurrencies, toggleTargetCurrency, lastUpdated, refreshRates } =
    useCurrencyContext()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Base Currency</Text>
          <Text style={styles.sectionDescription}>Select the currency you want to convert from</Text>

          <View style={styles.currencyList}>
            {AVAILABLE_CURRENCIES.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[styles.currencyOption, baseCurrency === currency.code && styles.selectedCurrency]}
                onPress={() => setBaseCurrency(currency.code)}
              >
                <Text style={[styles.currencyCode, baseCurrency === currency.code && styles.selectedText]}>
                  {currency.code}
                </Text>
                <Text style={[styles.currencyName, baseCurrency === currency.code && styles.selectedText]}>
                  {currency.name}
                </Text>
                {baseCurrency === currency.code && <Ionicons name="checkmark-circle" size={24} color="#00FFFF" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Currencies</Text>
          <Text style={styles.sectionDescription}>Select the currencies you want to convert to</Text>

          <View style={styles.currencyList}>
            {AVAILABLE_CURRENCIES.filter((c) => c.code !== baseCurrency).map((currency) => (
              <View key={currency.code} style={styles.currencyToggle}>
                <View>
                  <Text style={styles.currencyCode}>{currency.code}</Text>
                  <Text style={styles.currencyName}>{currency.name}</Text>
                </View>
                <Switch
                  value={targetCurrencies.includes(currency.code)}
                  onValueChange={() => toggleTargetCurrency(currency.code)}
                  trackColor={{ false: "#333", true: "#00FFFF" }}
                  thumbColor={targetCurrencies.includes(currency.code) ? "#f4f3f4" : "#f4f3f4"}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.ratesInfo}>
            <Text style={styles.ratesInfoText}>
              Rates last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Never"}
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={refreshRates}>
              <Text style={styles.refreshButtonText}>Refresh Rates</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  closeButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionDescription: {
    color: "#999",
    marginBottom: 20,
  },
  currencyList: {
    gap: 12,
  },
  currencyOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
  },
  selectedCurrency: {
    backgroundColor: "#003333",
    borderWidth: 1,
    borderColor: "#00FFFF",
  },
  currencyCode: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    width: 60,
  },
  currencyName: {
    color: "#CCC",
    fontSize: 16,
    flex: 1,
  },
  selectedText: {
    color: "#00FFFF",
  },
  currencyToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
  },
  ratesInfo: {
    alignItems: "center",
    gap: 15,
  },
  ratesInfoText: {
    color: "#999",
    textAlign: "center",
  },
  refreshButton: {
    backgroundColor: "#00FFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
})

