import { Toaster as ReactHotToaster } from "react-hot-toast";

/** App-wide toast notification host — mounted once near the app root. */
export function Toaster() {
  return (
    <ReactHotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: { fontSize: "0.875rem" },
        success: { iconTheme: { primary: "#4f46e5", secondary: "#ffffff" } },
      }}
    />
  );
}
