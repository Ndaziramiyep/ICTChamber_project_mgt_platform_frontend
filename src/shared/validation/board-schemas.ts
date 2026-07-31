import { z } from "zod";

export const boardFormSchema = z.object({
  title: z.string().min(1, "Title is required.").max(200, "Title must be 200 characters or fewer."),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or fewer.")
    .optional()
    .or(z.literal("")),
});
export type BoardFormValues = z.infer<typeof boardFormSchema>;

export const columnFormSchema = z.object({
  title: z.string().min(1, "Title is required.").max(200, "Title must be 200 characters or fewer."),
});
export type ColumnFormValues = z.infer<typeof columnFormSchema>;

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required.").max(200, "Title must be 200 characters or fewer."),
  description: z
    .string()
    .max(4000, "Description must be 4000 characters or fewer.")
    .optional()
    .or(z.literal("")),
});
export type TaskFormValues = z.infer<typeof taskFormSchema>;
