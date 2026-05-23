"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { authService } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

// --------------------------------
// Types and Enums
// --------------------------------

export type AuthView = "sign-in" | "sign-up" | "forgot-password" | "reset-success";

interface AuthState {
  view: AuthView;
}

interface FormState {
  isLoading: boolean;
  error: string | null;
  showPassword: boolean;
}

// --------------------------------
// Schemas
// --------------------------------

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  terms: z.literal(true, { errorMap: () => ({ message: "You must agree to the terms" }) }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// --------------------------------
// Password Strength Meter
// --------------------------------
const getPasswordStrength = (password: string) => {
  let score = 0;
  if (!password) return score;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
};

const PasswordStrengthMeter = ({ password }: { password: string }) => {
  const score = getPasswordStrength(password);
  const getLabel = () => {
    switch(score) {
      case 0: return "Too weak";
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      default: return "";
    }
  }
  const getColor = () => {
    switch(score) {
      case 0: return "bg-neutral-800";
      case 1: return "bg-red-500";
      case 2: return "bg-amber-500";
      case 3: return "bg-blue-500";
      case 4: return "bg-emerald-500";
      default: return "bg-neutral-800";
    }
  }

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1 h-1.5 w-full">
        {[1, 2, 3, 4].map((level) => (
          <div 
            key={level} 
            className={`flex-1 rounded-full transition-colors duration-300 ${score >= level ? getColor() : 'bg-white/10'}`} 
          />
        ))}
      </div>
      <p className="text-[10px] text-neutral-400 text-right h-3">{password ? getLabel() : ""}</p>
    </div>
  )
}


// --------------------------------
// Main Auth Component
// --------------------------------

interface AuthProps extends React.ComponentProps<"div"> {
  defaultView?: AuthView;
  onNavigate?: (view: AuthView) => void;
}

function Auth({ className, defaultView = "sign-in", onNavigate, ...props }: AuthProps) {
  const [state, setState] = React.useState<AuthState>({ view: defaultView });

  const setView = React.useCallback((view: AuthView) => {
    setState((prev) => ({ ...prev, view }));
    if (onNavigate) onNavigate(view);
  }, [onNavigate]);

  return (
    <div
      data-slot="auth"
      className={cn("mx-auto w-full max-w-md", className)}
      {...props}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]/60 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5" />
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {state.view === "sign-in" && (
              <AuthSignIn
                key="sign-in"
                onForgotPassword={() => setView("forgot-password")}
                onSignUp={() => setView("sign-up")}
              />
            )}
            {state.view === "sign-up" && (
              <AuthSignUp
                key="sign-up"
                onSignIn={() => setView("sign-in")}
              />
            )}
            {state.view === "forgot-password" && (
              <AuthForgotPassword
                key="forgot-password"
                onSignIn={() => setView("sign-in")}
                onSuccess={() => setView("reset-success")}
              />
            )}
            {state.view === "reset-success" && (
              <AuthResetSuccess
                key="reset-success"
                onSignIn={() => setView("sign-in")}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --------------------------------
// Shared Components
// --------------------------------

interface AuthFormProps<T> {
  onSubmit: (data: T) => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

function AuthForm<T>({ onSubmit, children, className }: AuthFormProps<T>) {
  return (
    <form
      onSubmit={onSubmit}
      data-slot="auth-form"
      className={cn("space-y-5", className)}
    >
      {children}
    </form>
  );
}

interface AuthErrorProps {
  message: string | null;
}

function AuthError({ message }: AuthErrorProps) {
  if (!message) return null;
  return (
    <div
      data-slot="auth-error"
      className="mb-6 animate-in rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
    >
      {message}
    </div>
  );
}

interface AuthSeparatorProps {
  text?: string;
}

function AuthSeparator({ text = "Or continue with" }: AuthSeparatorProps) {
  return (
    <div data-slot="auth-separator" className="relative mt-6">
      <div className="absolute inset-0 flex items-center">
        <Separator className="bg-white/10" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-[#0f0f11] px-2 text-neutral-500">{text}</span>
      </div>
    </div>
  );
}

// --------------------------------
// Sign In Component
// --------------------------------

interface AuthSignInProps {
  onForgotPassword: () => void;
  onSignUp: () => void;
}

function AuthSignIn({ onForgotPassword, onSignUp }: AuthSignInProps) {
  const navigate = useNavigate();
  const { loginState } = useAuth();
  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInFormValues) => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await authService.login({ email: data.email, password: data.password });
      loginState(response.user, response.accessToken, response.refreshToken);
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setFormState((prev) => ({ ...prev, error: error.response?.data?.message || error.message || "Invalid email or password" }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <motion.div
      data-slot="auth-sign-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-6 md:p-8"
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-neutral-400">Sign in to your account to continue</p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm<SignInFormValues> onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-neutral-300">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            disabled={formState.isLoading}
            className={cn("bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-indigo-500", errors.email && "border-red-500")}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-neutral-300">Password</Label>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs text-indigo-400 hover:text-indigo-300"
              onClick={onForgotPassword}
              disabled={formState.isLoading}
            >
              Forgot password?
            </Button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={formState.showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={formState.isLoading}
              className={cn("bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-indigo-500", errors.password && "border-red-500")}
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full text-neutral-400 hover:text-white hover:bg-transparent"
              onClick={() =>
                setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
              }
              disabled={formState.isLoading}
            >
              {formState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white border-none shadow-[0_0_15px_rgba(79,70,229,0.3)] mt-6" disabled={formState.isLoading}>
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </AuthForm>

      <p className="mt-8 text-center text-sm text-neutral-400">
        Don't have an account?{" "}
        <Button
          variant="link"
          className="h-auto p-0 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
          onClick={onSignUp}
          disabled={formState.isLoading}
        >
          Request Access
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Sign Up Component
// --------------------------------

interface AuthSignUpProps {
  onSignIn: () => void;
}

function AuthSignUp({ onSignIn }: AuthSignUpProps) {
  const navigate = useNavigate();
  const { loginState } = useAuth();
  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", terms: false },
  });

  const terms = watch("terms");
  const currentPassword = watch("password");

  const onSubmit = async (data: SignUpFormValues) => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await authService.register({ name: data.name, email: data.email, password: data.password });
      // Usually register might auto-login or require email verification.
      // Assuming auto-login for seamless UX if it returns tokens, or we just log them in immediately using the credentials.
      const response = await authService.login({ email: data.email, password: data.password });
      loginState(response.user, response.accessToken, response.refreshToken);
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setFormState((prev) => ({ ...prev, error: error.response?.data?.message || error.message || "An unexpected error occurred" }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <motion.div
      data-slot="auth-sign-up"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-6 md:p-8"
    >
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Create account</h1>
        <p className="mt-2 text-sm text-neutral-400">Join Korix and organize your workflow</p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm<SignUpFormValues> onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="name" className="text-neutral-300">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            disabled={formState.isLoading}
            className={cn("bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-indigo-500", errors.name && "border-red-500")}
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-neutral-300">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            disabled={formState.isLoading}
            className={cn("bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-indigo-500", errors.email && "border-red-500")}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-neutral-300">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={formState.showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={formState.isLoading}
              className={cn("bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-indigo-500", errors.password && "border-red-500")}
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full text-neutral-400 hover:text-white hover:bg-transparent"
              onClick={() =>
                setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
              }
              disabled={formState.isLoading}
            >
              {formState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <PasswordStrengthMeter password={currentPassword || ""} />
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <Checkbox
            id="terms"
            checked={terms}
            onCheckedChange={(checked) => setValue("terms", checked === true)}
            disabled={formState.isLoading}
            className="border-white/20 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
          />
          <div className="space-y-1">
            <Label htmlFor="terms" className="text-sm font-normal text-neutral-300">
              I agree to the terms
            </Label>
          </div>
        </div>
        {errors.terms && <p className="text-xs text-red-400 mt-1">{errors.terms.message}</p>}

        <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white border-none shadow-[0_0_15px_rgba(79,70,229,0.3)] mt-6" disabled={formState.isLoading}>
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </AuthForm>

      <p className="mt-8 text-center text-sm text-neutral-400">
        Already have an account?{" "}
        <Button
          variant="link"
          className="h-auto p-0 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
          onClick={onSignIn}
          disabled={formState.isLoading}
        >
          Sign in
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Forgot Password Component
// --------------------------------

interface AuthForgotPasswordProps {
  onSignIn: () => void;
  onSuccess: () => void;
}

function AuthForgotPassword({ onSignIn, onSuccess }: AuthForgotPasswordProps) {
  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async () => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      onSuccess();
    } catch {
      setFormState((prev) => ({ ...prev, error: "An unexpected error occurred" }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <motion.div
      data-slot="auth-forgot-password"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-6 md:p-8"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-4 text-neutral-400 hover:text-white"
        onClick={onSignIn}
        disabled={formState.isLoading}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Back</span>
      </Button>

      <div className="mb-8 text-center mt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Reset password</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Enter your email to receive a reset link
        </p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm<ForgotPasswordFormValues> onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-neutral-300">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            disabled={formState.isLoading}
            className={cn("bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-indigo-500", errors.email && "border-red-500")}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white border-none mt-4" disabled={formState.isLoading}>
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </AuthForm>

      <p className="mt-8 text-center text-sm text-neutral-400">
        Remember your password?{" "}
        <Button
          variant="link"
          className="h-auto p-0 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
          onClick={onSignIn}
          disabled={formState.isLoading}
        >
          Sign in
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Reset Success Component
// --------------------------------

interface AuthResetSuccessProps {
  onSignIn: () => void;
}

function AuthResetSuccess({ onSignIn }: AuthResetSuccessProps) {
  return (
    <motion.div
      data-slot="auth-reset-success"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col items-center p-6 md:p-8 text-center"
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20">
        <MailCheck className="h-8 w-8 text-indigo-400" />
      </div>

      <h1 className="text-2xl font-bold text-white tracking-tight">Check your email</h1>
      <p className="mt-2 text-sm text-neutral-400">
        We sent a password reset link to your email.
      </p>

      <Button
        className="mt-8 w-full max-w-xs bg-white/5 border border-white/10 hover:bg-white/10 text-white"
        onClick={onSignIn}
      >
        Back to sign in
      </Button>
    </motion.div>
  );
}

// --------------------------------
// Exports
// --------------------------------

export {
  Auth,
  AuthSignIn,
  AuthSignUp,
  AuthForgotPassword,
  AuthResetSuccess,
  AuthForm,
  AuthError,
  AuthSeparator,
};
