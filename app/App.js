import { useEffect, useCallback, useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
// Ganti import Tab Navigator
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MonitoringScreen } from "./src/screens/MonitoringScreen.js";
import { ControlScreen } from "./src/screens/ControlScreen.js";
import { LoginScreen } from "./src/screens/LoginScreen.js"; // Import baru
import { ProfileScreen } from "./src/screens/ProfileScreen.js"; // Import baru
import { assertConfig } from "./src/services/config.js";
import { AuthProvider, useAuth } from "./src/hooks/useAuth.js"; // Import baru
import * as SplashScreen from "expo-splash-screen"; // Import baru
import { View, ActivityIndicator, LogBox } from "react-native";

// Mengabaikan peringatan timer yang umum di Expo Go dengan Supabase
LogBox.ignoreLogs(["Setting a timer for a long period of time"]);

// Ganti jadi MaterialTopTabNavigator untuk gestur swipe
const Tab = createMaterialTopTabNavigator();

// Pindahkan Navigasi Tab ke komponen terpisah
function AppTabs() {
  const { session, user, loading } = useAuth();

  if (loading) {
    // Tampilkan loading screen sementara auth dicek
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8f9fb",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Tab.Navigator
      tabBarPosition="bottom" // Posisikan tab di bawah
      swipeEnabled={true} // Aktifkan gestur swipe
      screenOptions={({ route }) => ({
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarIcon: ({ color, focused }) => {
          let iconName;
          if (route.name === "Monitoring") {
            iconName = focused ? "analytics" : "analytics-outline";
          } else if (route.name === "Control") {
            iconName = focused ? "options" : "options-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Login") {
            iconName = focused ? "log-in" : "log-in-outline";
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      {/* Tab ini selalu tampil */}
      <Tab.Screen name="Monitoring" component={MonitoringScreen} />

      {/* Tab kondisional berdasarkan sesi login */}
      {session && user ? (
        <>
          <Tab.Screen name="Control" component={ControlScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </>
      ) : (
        <Tab.Screen name="Login" component={LoginScreen} />
      )}
    </Tab.Navigator>
  );
}

// Tahan splash screen
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Lakukan validasi config
        assertConfig();
        // Anda bisa tambahkan logic loading font di sini jika ada
        // await Font.loadAsync(...);
      } catch (e) {
        console.warn(e);
      } finally {
        // Beri tahu aplikasi bahwa persiapan selesai
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Sembunyikan splash screen setelah layout siap
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#f8f9fb",
    },
  };

  if (!appIsReady) {
    return null; // Tampilkan splash screen (dari app.json)
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <AuthProvider>
        <NavigationContainer theme={theme}>
          {/* Komponen Header/Navbar global dipindahkan ke sini */}
          {/* Kita gunakan wrapper Navigator agar bisa menampilkan Header di atas TopTabNavigator */}
          <Tab.Navigator
            screenOptions={{
              headerShown: true,
              headerTitle: "IOTWatch",
              headerTitleAlign: "center",
              headerTintColor: "#1f2937",
              headerStyle: { backgroundColor: "#f8f9fb" },
              headerTitleStyle: { fontWeight: "600", fontSize: 18 },
            }}
            tabBar={() => null} // Sembunyikan tab bar dari wrapper ini
          >
            <Tab.Screen name="AppRoot" component={AppTabs} />
          </Tab.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
