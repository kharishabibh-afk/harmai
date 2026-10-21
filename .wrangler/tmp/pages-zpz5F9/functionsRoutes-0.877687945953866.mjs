import { onRequestPost as __api_character_assist_js_onRequestPost } from "C:\\Users\\ACER\\Documents\\harmai\\functions\\api\\character-assist.js"
import { onRequestPost as __api_chat_js_onRequestPost } from "C:\\Users\\ACER\\Documents\\harmai\\functions\\api\\chat.js"
import { onRequestPost as __api_generate_image_js_onRequestPost } from "C:\\Users\\ACER\\Documents\\harmai\\functions\\api\\generate-image.js"
import { onRequestGet as __api_health_js_onRequestGet } from "C:\\Users\\ACER\\Documents\\harmai\\functions\\api\\health.js"
import { onRequestPost as __api_memory_analyze_js_onRequestPost } from "C:\\Users\\ACER\\Documents\\harmai\\functions\\api\\memory-analyze.js"

export const routes = [
    {
      routePath: "/api/character-assist",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_character_assist_js_onRequestPost],
    },
  {
      routePath: "/api/chat",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_chat_js_onRequestPost],
    },
  {
      routePath: "/api/generate-image",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_generate_image_js_onRequestPost],
    },
  {
      routePath: "/api/health",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_health_js_onRequestGet],
    },
  {
      routePath: "/api/memory-analyze",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_memory_analyze_js_onRequestPost],
    },
  ]