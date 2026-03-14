import axios from "axios";

const API = axios.create({
  baseURL: "https://mtk-fastfood.onrender.com/api"
});

export default API;