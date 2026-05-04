import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

const LoginPage = () => {
  const [regId, setRegId] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.login(regId, dob);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);

      // Role-based redirect
      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "worker") {
        navigate("/dashboard");
      } else {
        navigate("/search");
      }
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-14 min-h-screen flex items-center justify-center">
      <div className="form-panel w-full">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
          User Portal
        </p>
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Registration ID <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={regId}
              onChange={(e) => setRegId(e.target.value)}
              placeholder="e.g. SEVA123456 or CUST123456"
              required
              className="w-full h-11 px-4 bg-background border border-border font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Date of Birth <span className="text-primary">*</span>
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              className="w-full h-11 px-4 bg-background border border-border font-mono text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          <p className="text-center font-body text-sm text-muted-foreground">
            Not registered?{" "}
            <Link to="/register" className="safety-link font-mono text-xs uppercase">Register Now</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
