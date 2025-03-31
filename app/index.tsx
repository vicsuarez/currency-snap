"use client"

import { useState, useRef, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal, ActivityIndicator, Dimensions } from "react-native"
import { Camera } from "expo-camera"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import SettingsScreen from "./settings"
import { useCurrencyContext } from "../context/currency-context"
import { detectPrice } from "../services/vision-service"

export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [detectedPrice, setDetectedPrice] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off)
  const cameraRef = useRef(null)
  const { baseCurrency, targetCurrencies, conversionRates, isLoading, error, refreshRates } = useCurrencyContext()

  useEffect(() => {
    ;(async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted")
    })()
  }, [])

  const handleDetectPrice = async () => {
    if (!isProcessing && cameraRef.current) {
      setIsProcessing(true)
      try {
        // Get screen dimensions for frame calculations
        const screenWidth = Dimensions.get('window').width
        const frameWidth = screenWidth * 0.8 // 80% of screen width
        const frameHeight = frameWidth * (9/16) // 16:9 aspect ratio
        const frameX = (screenWidth - frameWidth) / 2
        const frameY = (Dimensions.get('window').height - frameHeight) / 2

        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: true,
          skipProcessing: false,
        })

        console.log('Captured center area dimensions:', {
          cropX: frameX,
          cropY: frameY,
          cropWidth: frameWidth,
          cropHeight: frameHeight
        })

        const price = await detectPrice(photo.base64, {
          x: frameX,
          y: frameY,
          width: frameWidth,
          height: frameHeight
        })
        
        if (price && price > 0) {
          setDetectedPrice(price)
          refreshRates()
        }
      } catch (error) {
        console.error("Error processing image:", error)
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const toggleFlash = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off ? Camera.Constants.FlashMode.torch : Camera.Constants.FlashMode.off,
    )
  }

  const formatCurrency = (amount: number, currency: string): string => {
    // Format number with thousand separators and 2 decimal places
    const formattedNumber = Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formattedNumber} ${currency}`;
  };

  const convertCurrency = (amount: number | null, targetCurrency: string): string => {
    if (!amount || amount <= 0) return "N/A";
    if (isLoading) return "Loading...";
    if (error) return "Error";
    if (!conversionRates[targetCurrency]) {
      console.log('Missing rate for:', targetCurrency, 'Rates:', conversionRates);
      return "N/A";
    }
    const converted = amount * conversionRates[targetCurrency];
    return formatCurrency(converted, targetCurrency);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>Requesting camera permission...</Text>
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>No access to camera</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={Camera.Constants.Type.back}
          flashMode={flashMode}
        >
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>
            
            <TouchableOpacity 
              style={styles.detectButton}
              onPress={handleDetectPrice}
              disabled={isProcessing}
            >
              <View style={[
                styles.detectButtonInner,
                isProcessing && styles.detectButtonProcessing
              ]}>
                {isProcessing ? (
                  <ActivityIndicator color="#00FFFF" />
                ) : (
                  <Ionicons name="scan" size={30} color="#00FFFF" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
          <Ionicons
            name={flashMode === Camera.Constants.FlashMode.off ? "flash-off" : "flash"}
            size={24}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => setShowSettings(true)}>
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {detectedPrice && (
        <View style={styles.resultsContainer}>
          <View style={styles.detectedPriceContainer}>
            <Text style={styles.detectedPriceLabel}>Detected Price:</Text>
            <Text style={styles.detectedPrice}>
              {formatCurrency(detectedPrice || 0, 'JPY')}
            </Text>
          </View>

          {error && (
            <TouchableOpacity style={styles.errorContainer} onPress={refreshRates}>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          )}

          <View style={styles.conversionResults}>
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#00FFFF" />
                <Text style={styles.loadingText}>Updating rates...</Text>
              </View>
            )}
            
            {targetCurrencies.map((currency) => (
              <View key={currency} style={styles.conversionItem}>
                <Text style={styles.currencyCode}>{currency}</Text>
                <Text style={styles.convertedAmount}>
                  {convertCurrency(detectedPrice, currency)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={false}
        visible={showSettings}
        onRequestClose={() => setShowSettings(false)}
      >
        <SettingsScreen onClose={() => setShowSettings(false)} />
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  messageText: {
    color: "white",
    textAlign: "center",
    marginTop: 20,
  },
  cameraContainer: {
    flex: 1,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: Dimensions.get('window').width * 0.8,
    height: (Dimensions.get('window').width * 0.8) * (9/16), // 16:9 aspect ratio
    borderColor: "#00FFFF",
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#00FFFF",
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "#00FFFF",
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#00FFFF",
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "#00FFFF",
  },
  detectButton: {
    position: 'absolute',
    bottom: '25%', // Position at 25% from bottom
    alignSelf: 'center',
  },
  detectButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00FFFF',
  },
  detectButtonProcessing: {
    opacity: 0.7,
  },
  controlsContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    flexDirection: "column",
    gap: 20,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  resultsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  detectedPriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  detectedPriceLabel: {
    color: "#999",
    fontSize: 16,
  },
  detectedPrice: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  errorContainer: {
    backgroundColor: "rgba(255,0,0,0.1)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
  },
  retryText: {
    color: "#00FFFF",
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    gap: 10,
  },
  loadingText: {
    color: "#00FFFF",
    fontSize: 14,
  },
  conversionResults: {
    gap: 12,
  },
  conversionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currencyCode: {
    color: "#00FFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  convertedAmount: {
    color: "white",
    fontSize: 18,
  },
})

