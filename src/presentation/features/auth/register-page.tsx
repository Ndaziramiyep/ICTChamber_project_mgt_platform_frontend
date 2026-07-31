import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { useRegisterMutation } from "@/application/auth/use-register-mutation";
import { Button } from "@/presentation/components/button";
import { FormField } from "@/presentation/components/form-field";
import { Input } from "@/presentation/components/input";
import { AuthLayout } from "@/presentation/features/auth/auth-layout";
import { getErrorMessage } from "@/shared/lib/get-error-message";
import { notify } from "@/shared/lib/notify";
import { registerFormSchema, type RegisterFormValues } from "@/shared/validation/auth-schemas";

export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync(values);
      navigate("/boards", { replace: true });
    } catch (error) {
      notify.error(getErrorMessage(error, "Could not create your account. Please try again."));
    }
  });

  return (
    <AuthLayout title="Create your account" subtitle="Start organizing your team's work.">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormField label="Display name" errorMessage={errors.displayName?.message}>
          <Input autoComplete="name" {...register("displayName")} />
        </FormField>
        <FormField label="Email address" errorMessage={errors.emailAddress?.message}>
          <Input type="email" autoComplete="email" {...register("emailAddress")} />
        </FormField>
        <FormField
          label="Password"
          hint={!errors.plainTextPassword ? "At least 8 characters." : undefined}
          errorMessage={errors.plainTextPassword?.message}
        >
          <Input type="password" autoComplete="new-password" {...register("plainTextPassword")} />
        </FormField>
        <Button type="submit" isLoading={registerMutation.isPending} className="mt-2 w-full">
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
