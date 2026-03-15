import axios from "axios";

const API = axios.create({
  baseURL: "https://fastfood-k8cr.onrender.com/api"
});

export default API;