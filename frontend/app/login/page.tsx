"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post(`/login`, { email, password });

      // Save token (e.g. localStorage)
      localStorage.setItem("token", response.data.access_token);

      // Redirect to main chat page
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to log in to your chat account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded bg-red-50 p-2 text-xs text-red-600">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-6">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Sign In"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-600 underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
