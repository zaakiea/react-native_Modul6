import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

export function ProfileScreen() {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <View style={[styles.container, styles.center]}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-circle-outline" size={80} color="#2563eb" />
          </View>

          <Text style={styles.title}>Profile</Text>

          {user ? (
            <Text style={styles.emailText}>{user.email}</Text>
          ) : (
            <Text style={styles.emailText}>Not logged in.</Text>
          )}

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={signOut}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fb",
  },
  center: {
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: "center", // Pusatkan semua item di dalam card
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
    color: "#1f2937",
  },
  emailText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#6b7280",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%", // Buat tombol selebar card
  },
  logoutButton: {
    backgroundColor: "#c82333", // Warna merah untuk logout
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8, // Beri jarak antara ikon dan teks
  },
});
