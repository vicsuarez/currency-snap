"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"

const slides = [
  {
    id: 1,
    title: "Welcome to Currency Snap",
    description: "Convert prices instantly while traveling abroad",
    icon: "camera-outline",
  },
  {
    id: 2,
    title: "Point & Convert",
    description: "Just point your camera at any price tag and get instant conversions",
    icon: "scan-outline",
  },
  {
    id: 3,
    title: "Multiple Currencies",
    description: "Convert to multiple currencies at once - perfect for international travelers",
    icon: "cash-outline",
  },
  {
    id: 4,
    title: "Ready to Go!",
    description: "No more mental math or calculator apps while shopping abroad",
    icon: "checkmark-circle-outline",
  },
]

export default function OnboardingScreen({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      onComplete()
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.skipContainer}>
        {currentSlide < slides.length - 1 && (
          <TouchableOpacity onPress={onComplete}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.slideContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={slides[currentSlide].icon} size={100} color="#00FFFF" />
        </View>

        <Text style={styles.title}>{slides[currentSlide].title}</Text>
        <Text style={styles.description}>{slides[currentSlide].description}</Text>
      </View>

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View key={index} style={[styles.paginationDot, index === currentSlide && styles.paginationDotActive]} />
        ))}
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>{currentSlide === slides.length - 1 ? "Get Started" : "Next"}</Text>
        <Ionicons name="arrow-forward" size={20} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  skipContainer: {
    alignItems: "flex-end",
    marginTop: 20,
  },
  skipText: {
    color: "#999",
    fontSize: 16,
  },
  slideContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(0, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    color: "#CCC",
    textAlign: "center",
    lineHeight: 26,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#333",
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: "#00FFFF",
    width: 20,
  },
  nextButton: {
    backgroundColor: "#00FFFF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  nextButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
})

