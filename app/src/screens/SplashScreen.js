// app/src/screens/SplashScreen.js
import React from "react";
import { View, StyleSheet, Image, Text, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export function SplashScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Menampilkan GIF Animasi */}
        <Image
          source={require("../../assets/Gear-Loader.gif")}
          style={styles.gif}
          resizeMode="contain"
        />

        {/* Teks Loading Opsional di bawah GIF */}
        <Text style={styles.loadingText}>Memuat IOT Watch...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // Pastikan sama dengan background di app.json
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  gif: {
    width: width * 0.6, // Menggunakan 60% lebar layar
    height: width * 0.6, // Menjaga rasio aspek (sesuaikan jika perlu)
  },
  loadingText: {
    marginTop: 20,
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "500",
  },
});
