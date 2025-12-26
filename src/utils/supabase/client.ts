import { createClient } from "@supabase/supabase-js";

// Get the Supabase URL and public anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const customFunctionUrl = import.meta.env.VITE_SUPABASE_FUNCTION_URL;

// Throw an error if the environment variables are not set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and anon key are required.");
}

// For Docker deployments with custom routing, use a base URL that doesn't have the extra path
// The functions are at /deno instead of /service/functions/v1
const effectiveUrl = customFunctionUrl
  ? customFunctionUrl.replace("/api", "") // Remove /api to get base URL
  : supabaseUrl;

export const supabase = createClient(effectiveUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      "X-Client-Info": "gutzo-marketplace",
    },
    fetch: customFunctionUrl
      ? (url, options = {}) => {
        // Intercept function calls and redirect to custom URL
        const urlString = typeof url === "string" ? url : url.toString();
        const urlObj = new URL(urlString);
        if (urlObj.pathname.includes("/functions/v1/")) {
          // Replace /functions/v1/ with /api/
          const newPath = urlObj.pathname.replace("/functions/v1/", "/api/");
          urlObj.pathname = newPath;
          console.log(
            "🔀 Redirecting function call:",
            urlString,
            "→",
            urlObj.toString(),
          );
          return fetch(urlObj.toString(), options);
        }
        return fetch(url, options);
      }
      : undefined,
  },
});
