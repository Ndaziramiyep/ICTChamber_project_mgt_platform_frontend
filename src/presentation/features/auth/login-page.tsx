import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { useLoginMutation } from "@/application/auth/use-login-mutation";
import { Button } from "@/presentation/components/button";
import { FormField } from "@/presentation/components/form-field";
import { Input } from "@/presentation/components/input";
import { AuthLayout } from "@/presentation/features/auth/auth-layout";
import { getErrorMessage } from "@/shared/lib/get-error-message";
import { notify } from "@/shared/lib/notify";
import { loginFormSchema, type LoginFormValues } from "@/shared/validation/auth-schemas";

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await loginMutation.mutateAsync(values);
      navigate("/boards", { replace: true });
    } catch (error) {
      notify.error(getErrorMessage(error, "Could not sign in. Please try again."));
    }
  });

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back — pick up where you left off.">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <FormField label="Email address" errorMessage={errors.emailAddress?.message}>
          <Input type="email" autoComplete="email" {...register("emailAddress")} />
        </FormField>
        <FormField label="Password" errorMessage={errors.plainTextPassword?.message}>
          <Input
            type="password"
            autoComplete="current-password"
            {...register("plainTextPassword")}
          />
        </FormField>
        <Button type="submit" isLoading={loginMutation.isPending} className="mt-2 w-full">
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
