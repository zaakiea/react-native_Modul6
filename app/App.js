import { useEffect, useCallback, useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, LogBox } from "react-native";
import * as SplashScreenLib from "expo-splash-screen"; // Ganti nama import library native agar tidak bentrok

// --- Import Screen ---
import { MonitoringScreen } from "./src/screens/MonitoringScreen.js";
import { ControlScreen } from "./src/screens/ControlScreen.js";
import { LoginScreen } from "./src/screens/LoginScreen.js";
import { ProfileScreen } from "./src/screens/ProfileScreen.js";
import { SplashScreen } from "./src/screens/SplashScreen.js"; // Import Component Custom Splash Screen

// --- Import Services/Hooks ---
import { assertConfig } from "./src/services/config.js";
import { AuthProvider, useAuth } from "./src/hooks/useAuth.js";

// Mengabaikan peringatan timer
LogBox.ignoreLogs(["Setting a timer for a long period of time"]);

const Tab = createMaterialTopTabNavigator();

// Komponen Navigasi Tab
function AppTabs() {
  const { session, user, loading } = useAuth();
  const [isSplashAnimationFinished, setSplashAnimationFinished] =
    useState(false);

  useEffect(() => {
    // Tahan Splash Screen minimal selama 3 detik (3000ms)
    // Anda bisa mengubah angka 3000 ini sesuai durasi GIF yang diinginkan
    const timer = setTimeout(() => {
      setSplashAnimationFinished(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Tampilkan Custom Splash Screen jika:
  // 1. Data Auth masih loading (loading === true)
  // 2. ATAU Durasi minimal 3 detik belum selesai (isSplashAnimationFinished === false)
  if (loading || !isSplashAnimationFinished) {
    return <SplashScreen />;
  }

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      swipeEnabled={true}
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
      <Tab.Screen name="Monitoring" component={MonitoringScreen} />
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

// Tahan splash screen native (logo putih bawaan) sampai aplikasi siap
SplashScreenLib.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        assertConfig();
        // Load font atau aset lain di sini jika perlu
        // await Font.loadAsync(...);
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Sembunyikan native splash screen segera agar Custom GIF Splash Screen bisa tampil
      await SplashScreenLib.hideAsync();
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
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <AuthProvider>
        <NavigationContainer theme={theme}>
          <Tab.Navigator
            screenOptions={{
              headerShown: true,
              headerTitle: "IOTWatch",
              headerTitleAlign: "center",
              headerTintColor: "#1f2937",
              headerStyle: { backgroundColor: "#f8f9fb" },
              headerTitleStyle: { fontWeight: "600", fontSize: 18 },
            }}
            tabBar={() => null}
          >
            <Tab.Screen name="AppRoot" component={AppTabs} />
          </Tab.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
