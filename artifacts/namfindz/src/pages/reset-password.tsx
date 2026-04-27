import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { KeyRound, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

function readToken(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("token") ?? "";
}

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setToken(readToken());
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Could not reset password");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <MapPin className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold tracking-tight">
            nam<span className="text-primary">Findz</span>
          </span>
        </Link>
      </div>
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Set a new password</CardTitle>
          <CardDescription>
            Choose a strong password you haven't used before.
          </CardDescription>
        </CardHeader>
        {done ? (
          <>
            <CardContent>
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Your password has been updated. You can now log in with your
                  new password.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate("/login")}>
                Continue to log in
              </Button>
            </CardFooter>
          </>
        ) : !token ? (
          <>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>
                  This page needs a reset token. Please use the link from your
                  email, or{" "}
                  <Link href="/forgot-password" className="underline font-medium">
                    request a new one
                  </Link>
                  .
                </AlertDescription>
              </Alert>
            </CardContent>
          </>
        ) : (
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="mr-2 h-4 w-4" />
                )}
                Update password
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
