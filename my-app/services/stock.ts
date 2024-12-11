import { Filters } from "@/app/interfaces";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/perform_rag";

interface FiltersAPI {
  market_cap_min: number | null;
  market_cap_max: number | null;
  volume_min: number | null;
  volume_max: number | null;
  sector: string | null;
}

const callApi = async (query: string, filters: Filters) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };
    const filters_api: FiltersAPI = {
      market_cap_min: filters.marketCap ? filters.marketCap.operator == ">=" ? Number(filters.marketCap.value) : null : null,
      market_cap_max: filters.marketCap ? filters.marketCap.operator == "<=" ? Number(filters.marketCap.value) : null : null,
      volume_min: filters.volume ? filters.volume.operator == "<=" ? Number(filters.volume.value) : null : null,
      volume_max: filters.volume ? filters.volume.operator == "<=" ? Number(filters.volume.value) : null : null,
      sector: filters.sector.value || null,
    }

    const payload = { query, filters: filters_api };
    console.log(filters_api)
    const response = await axios.post(BASE_URL, payload, { headers });
    
    //console.log("Respuesta de la API:", response.data);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error inesperado:", error.message);
    } else {
      console.error("Error inesperado:", error);
    }
  }
};

export default callApi;