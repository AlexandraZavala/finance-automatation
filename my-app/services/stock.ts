import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/perform_rag";

const callApi = async (query: string, filters: Record<string, any>) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    const payload = { query, filters };

    const response = await axios.post(BASE_URL, payload, { headers });

    console.log("Respuesta de la API:", response.data);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error inesperado:", error.message);
    } else {
      console.error("Error inesperado:", error);
    }
  }
};

export default callApi;