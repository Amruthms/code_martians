import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Default admin credentials
  const ADMIN_EMAIL = "admin@safety.com";
  const ADMIN_PASSWORD = "admin123";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setError("");
      onLogin();
    } else {
      setError("Invalid email or password. Please use admin credentials.");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">
      {/* Left side - Hero image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1678519732971-30366e62a7da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwc2FmZXR5fGVufDF8fHx8MTc2MjQxMzI5OXww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Construction Site Safety"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-12">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl"
              style={{ backgroundColor: "#FF7A00" }}
            >
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl text-white mb-4">AI for Safer Workplaces</h1>
          <p className="text-white/80 max-w-md text-lg">
            Real-time construction site monitoring powered by AI, IoT sensors,
            and computer vision. Ensuring compliance with Nordic Safety
            Standards.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0A0A0A]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg"
              style={{ backgroundColor: "#FF7A00" }}
            >
              <svg
                className="h-7 w-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Admin Login</CardTitle>
              <CardDescription className="text-gray-400">
                Sign in with admin credentials to access the Safety Intelligence
                System
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@safety.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full text-white"
                  style={{ backgroundColor: "#FF7A00" }}
                >
                  Sign In as Admin
                </Button>

                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/50">
                  <p className="text-sm text-blue-400 mb-2">
                    <strong>Default Admin Credentials:</strong>
                  </p>
                  <p className="text-xs text-blue-300">
                    Email:{" "}
                    <code className="bg-blue-900/50 px-2 py-1 rounded">
                      admin@safety.com
                    </code>
                  </p>
                  <p className="text-xs text-blue-300">
                    Password:{" "}
                    <code className="bg-blue-900/50 px-2 py-1 rounded">
                      admin123
                    </code>
                  </p>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="flex justify-center gap-6 text-sm text-gray-400">
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                  <a href="#" className="hover:text-white transition-colors">
                    GDPR
                  </a>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
