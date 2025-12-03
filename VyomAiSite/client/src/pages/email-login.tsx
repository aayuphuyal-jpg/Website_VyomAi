import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const emailLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type EmailLoginFormData = z.infer<typeof emailLoginSchema>;

export default function EmailLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordInputValue, setPasswordInputValue] = useState("");

  const form = useForm<EmailLoginFormData>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: EmailLoginFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/email/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Login Failed",
          description: error.error || "Invalid email or password",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { token } = await response.json();
      localStorage.setItem("vyomai-email-token", token);
      localStorage.setItem("vyomai-email-address", data.email);

      toast({
        title: "Success",
        description: "Welcome to your email inbox",
      });

      setLocation("/email/inbox");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to email server. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background to-background/80 dark:from-background dark:to-background/80 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-48 -mb-48" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-primary/70 dark:from-primary/80 dark:to-primary">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Email Access</h1>
          <p className="text-muted-foreground">Access your VyomAi business email</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 backdrop-blur-sm bg-card/50 border border-border/50">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isLoading ? "animate-email-buffer" : ""}`} />
                        <Input
                          {...field}
                          type="email"
                          placeholder="shekhar@vyomai.cloud"
                          disabled={isLoading}
                          className="pl-10 bg-background/50 border-border/50 focus-visible:border-primary focus-visible:ring-primary/20"
                          data-testid="input-email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          disabled={isLoading}
                          className="pl-10 pr-10 bg-background/50 border-border/50 focus-visible:border-primary focus-visible:ring-primary/20"
                          data-testid="input-password"
                          onChange={(e) => {
                            field.onChange(e);
                            setPasswordInputValue(e.target.value);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors ${passwordInputValue ? "animate-eye-blink" : ""}`}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold h-10"
                data-testid="button-login-email"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          {/* Info */}
          <div className="mt-6 p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Tip:</span> Use your full VyomAi email address (e.g., shekhar@vyomai.cloud) and the password you set in Hostinger.
            </p>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          <button
            type="button"
            onClick={() => setLocation("/")}
            className="text-primary hover:underline font-medium transition-colors"
            data-testid="link-back-home"
          >
            Back to Home
          </button>
        </p>
      </div>
    </div>
  );
}
