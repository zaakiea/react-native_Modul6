import { useCallback, useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity, // Import TouchableOpacity
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LineChart } from "react-native-chart-kit";
import { useMqttSensor } from "../hooks/useMqttSensor.js";
// import { Api } from "../services/api.js"; // Hapus Api statis
import { useApi } from "../hooks/useApi.js"; // Import hook
import { DataTable } from "../components/DataTable.js";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

// Konfigurasi untuk chart
const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(255, 122, 89, ${opacity})`, // Warna garis dan titik
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#ff7a59",
  },
};

export function MonitoringScreen() {
  const api = useApi(); // Gunakan hook Api
  const {
    temperature,
    timestamp,
    connectionState,
    error: mqttError,
  } = useMqttSensor();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [tempHistory, setTempHistory] = useState([]);

  // State baru untuk pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // useEffect untuk mengumpulkan data histori dari MQTT
  useEffect(() => {
    // Hanya tambahkan jika temperatur adalah angka yang valid
    if (typeof temperature === "number" && timestamp) {
      setTempHistory((prevHistory) => {
        const newEntry = { temperature, timestamp };
        // Tambahkan data baru di depan
        const updatedHistory = [newEntry, ...prevHistory];

        // Batasi histori hanya 10 data terakhir
        if (updatedHistory.length > 10) {
          return updatedHistory.slice(0, 10);
        }
        return updatedHistory;
      });
    }
  }, [temperature, timestamp]); // Dijalankan setiap ada data temperatur atau timestamp baru

  // Modifikasi fetchReadings untuk menerima halaman
  const fetchReadings = useCallback(
    async (pageNum) => {
      setLoading(true);
      setApiError(null);
      try {
        // Gunakan api.getSensorReadings(pageNum)
        const { data, count, perPage } = await api.getSensorReadings(pageNum);
        setReadings(data ?? []);
        // Hitung total halaman
        setTotalPages(Math.ceil((count ?? 0) / (perPage ?? 10)));
        setPage(pageNum); // Set halaman saat ini
      } catch (err) {
        setApiError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [api]
  ); // Tambahkan api sebagai dependensi

  // Buat fetch Halaman Pertama
  const fetchFirstPage = useCallback(() => {
    fetchReadings(1);
  }, [fetchReadings]); // fetchReadings sekarang stabil karena dependensinya 'api'

  // Gunakan fetchFirstPage saat fokus
  useFocusEffect(
    useCallback(() => {
      fetchFirstPage();
    }, [fetchFirstPage])
  );

  // onRefresh harus me-load ulang halaman saat ini
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchReadings(page); // Refresh halaman saat ini
    } finally {
      setRefreshing(false);
    }
  }, [fetchReadings, page]);

  // Handler untuk tombol pagination
  const handlePrevPage = () => {
    if (page > 1) {
      fetchReadings(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      fetchReadings(page + 1);
    }
  };

  // Siapkan data untuk chart
  // Kita perlu membaliknya agar data tertua di kiri dan terbaru di kanan
  const chartData = {
    labels:
      tempHistory.length > 0
        ? tempHistory
            .map((p) =>
              new Date(p.timestamp).toLocaleTimeString().substring(0, 5)
            )
            .reverse()
        : ["--"],
    datasets: [
      {
        data:
          tempHistory.length > 0
            ? tempHistory.map((p) => p.temperature).reverse()
            : [0],
      },
    ],
    legend: ["Temperature (°C)"], // optional
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.card}>
          <Text style={styles.title}>Realtime Temperature</Text>

          {/* Tampilkan chart jika sudah ada data, jika tidak tampilkan loading */}
          {tempHistory.length > 0 ? (
            <LineChart
              data={chartData}
              width={screenWidth - 72} // lebar card (screenWidth - padding*2 - cardPadding*2)
              height={220}
              chartConfig={chartConfig}
              bezier // membuat garis melengkung
              style={styles.chart}
              withVerticalLabels={false} // Label X-axis disembunyikan
            />
          ) : (
            <View style={styles.chartLoadingContainer}>
              <ActivityIndicator size="large" color="#ff7a59" />
              <Text style={styles.metaText}>Waiting for sensor data...</Text>
            </View>
          )}

          <View style={styles.valueRow}>
            <Text style={styles.temperatureText}>
              {typeof temperature === "number"
                ? `${temperature.toFixed(2)}°C`
                : "--"}
            </Text>
          </View>
          <Text style={styles.metaText}>MQTT status: {connectionState}</Text>
          {timestamp && (
            <Text style={styles.metaText}>
              Last update: {new Date(timestamp).toLocaleString()}
            </Text>
          )}
          {mqttError && (
            <Text style={styles.errorText}>MQTT error: {mqttError}</Text>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Triggered Readings History</Text>
          {loading && !refreshing && <ActivityIndicator />}
        </View>
        {apiError && (
          <Text style={styles.errorText}>
            Failed to load history: {apiError}
          </Text>
        )}

        {/* Tampilkan DataTable */}
        <DataTable
          columns={[
            {
              key: "recorded_at",
              title: "Timestamp",
              render: (value) =>
                value ? new Date(value).toLocaleString() : "--",
            },
            {
              key: "temperature",
              title: "Temperature (°C)",
              render: (value) =>
                typeof value === "number"
                  ? `${Number(value).toFixed(2)}`
                  : "--",
            },
            {
              key: "threshold_value",
              title: "Threshold (°C)",
              render: (value) =>
                typeof value === "number"
                  ? `${Number(value).toFixed(2)}`
                  : "--",
            },
          ]}
          data={readings}
          keyExtractor={(item) => item.id}
        />

        {/* Tambahkan Kontrol Pagination */}
        <View style={styles.paginationControls}>
          <TouchableOpacity
            style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
            onPress={handlePrevPage}
            disabled={page <= 1}
          >
            <Text style={styles.pageButtonText}>Sebelumnya</Text>
          </TouchableOpacity>

          <Text style={styles.pageInfo}>
            Halaman {page} / {totalPages}
          </Text>

          <TouchableOpacity
            style={[
              styles.pageButton,
              page >= totalPages && styles.pageButtonDisabled,
            ]}
            onPress={handleNextPage}
            disabled={page >= totalPages}
          >
            <Text style={styles.pageButtonText}>Berikutnya</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Tambahkan style baru untuk pagination
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    alignSelf: "center",
  },
  chartLoadingContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginTop: 12,
  },
  temperatureText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#ff7a59",
  },
  metaText: {
    marginTop: 8,
    color: "#555",
    textAlign: "center",
  },
  errorText: {
    marginTop: 8,
    color: "#c82333",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Style baru
  paginationControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  pageButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  pageButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  pageButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});
