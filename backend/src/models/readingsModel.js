import { supabase } from "../config/supabaseClient.js";

const TABLE = "sensor_readings";
const PER_PAGE = 10; // Tentukan jumlah item per halaman

function normalize(row) {
  if (!row) return row;
  return {
    ...row,
    temperature: row.temperature === null ? null : Number(row.temperature),
    threshold_value:
      row.threshold_value === null ? null : Number(row.threshold_value),
  };
}

export const ReadingsModel = {
  async list(page = 1) {
    const pageNum = Number(page) || 1;
    const from = (pageNum - 1) * PER_PAGE;
    const to = from + PER_PAGE - 1;

    const { data, error, count } = await supabase
      .from(TABLE)
      .select("id, temperature, threshold_value, recorded_at", {
        count: "exact",
      }) // Minta total count
      .order("recorded_at", { ascending: false })
      .range(from, to); // Terapkan pagination

    if (error) throw error;

    return {
      data: data.map(normalize),
      count: count,
      perPage: PER_PAGE,
      page: pageNum,
    };
  },

  async latest() {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, temperature, threshold_value, recorded_at")
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return normalize(data);
  },

  async create(payload) {
    const { temperature, threshold_value } = payload;

    if (typeof temperature !== "number") {
      throw new Error("temperature must be a number");
    }

    const newRow = {
      temperature,
      threshold_value: threshold_value ?? null,
    };

    const { data, error } = await supabase
      .from(TABLE)
      .insert(newRow)
      .select("id, temperature, threshold_value, recorded_at")
      .single();

    if (error) throw error;
    return normalize(data);
  },
};
