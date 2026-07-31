import { z } from "zod";

export const loginFormSchema = z.object({
  emailAddress: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  plainTextPassword: z.string().min(1, "Password is required."),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required.")
    .max(100, "Display name must be 100 characters or fewer."),
  emailAddress: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  plainTextPassword: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password must be 128 characters or fewer."),
});
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
