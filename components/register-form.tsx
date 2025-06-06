"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/schema/register";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { register } from "@/actions/authActionsClient";

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // Convert validated data to FormData format
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("email", data.email);
      formData.append("password", data.password);

      const res = await register(formData);

      if (res.success) {
        toast.success(res.message);
        toast.info("Please check your email to verify your account.");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  {...registerField("firstName")}
                  id="first-name"
                  type="text"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  {...registerField("lastName")}
                  id="last-name"
                  type="text"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...registerField("email")}
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  {...registerField("password")}
                  id="password"
                  type="password"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  {...registerField("confirmPassword")}
                  id="confirm-password"
                  type="password"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full bg-purple text-white">
                Register
              </Button>
              <div className="text-center text-sm">
                Have an account?{" "}
                <a
                  onClick={() => {
                    router.push("/login");
                  }}
                  className="underline underline-offset-4 hover:cursor-pointer"
                >
                  Login
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}