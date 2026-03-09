import axios from "axios";

const API = axios.create({
  baseURL: "https://softbackend-eta.vercel.app/api"
});

export default API;