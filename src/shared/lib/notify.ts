import toast from "react-hot-toast";

/** Single point of contact for user-facing toast notifications, so styling stays consistent. */
export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
};
