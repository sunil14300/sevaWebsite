import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const OCCUPATIONS = [
  "Plumber", "Electrician", "Painter", "Mechanic", "Cook", "Carpenter",
  "Barber", "Sweeper", "Mason", "Driver", "Helper", "Cobbler", "Technical Person", "Labour",
];

const RegisterPage = () => {
  const [role, setRole] = useState("customer");
  const [formData, setFormData] = useState({
    name: "", address: "", dob: "", mobile: "", email: "",
    state: "", occupation: "", aadhaar: "", pan: "", priceCharge: "", password: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [regId, setRegId] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, role };
      if (role === "customer") {
        delete payload.occupation;
        delete payload.aadhaar;
        delete payload.pan;
        delete payload.priceCharge;
      }
      const data = await api.register(payload);
      setRegId(data.registrationId);
      login(data.token, data.user || { registrationId: data.registrationId, name: formData.name, role });
      setSubmitted(true);
      toast.success("Registration successful!");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-14 min-h-screen flex items-center justify-center">
        <div className="form-panel text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Registration Complete</p>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome, {formData.name}</h2>
          <div className="workshop-panel inline-block my-6 px-8 py-4">
            <p className="font-mono text-xs text-secondary-foreground/60 uppercase tracking-widest mb-1">Your Registration ID</p>
            <p className="font-mono text-2xl font-bold text-primary">{regId}</p>
          </div>
          <p className="font-body text-sm text-muted-foreground mb-6">
            Save this ID. You'll need it to login.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-block px-6 py-3 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const commonFields = [
    { name: "name", label: "Full Name", type: "text", required: true },
    { name: "address", label: "Address", type: "text", required: true },
    { name: "dob", label: "Date of Birth", type: "date", required: true },
    { name: "mobile", label: "Mobile Number", type: "tel", required: true },
    { name: "email", label: "E-mail (optional)", type: "email", required: false },
    { name: "state", label: "State", type: "text", required: true },
  ];

  const workerFields = [
    { name: "aadhaar", label: "Aadhaar Number", type: "text", required: true },
    { name: "pan", label: "PAN Card Number", type: "text", required: false },
    { name: "priceCharge", label: "Price Charge (per task/day)", type: "text", required: true },
  ];

  const fields = role === "worker" ? [...commonFields, ...workerFields] : commonFields;

  return (
    <div className="pt-14">
      <section className="container py-10">
        <div className="max-w-lg mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Join the platform</p>
          <h1 className="text-3xl font-bold tracking-tight mb-6">Registration</h1>

          {/* Role Toggle */}
          <div className="flex mb-8 border border-border">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`flex-1 h-12 font-mono text-xs uppercase tracking-widest transition-all ${
                role === "customer"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              🏠 I want to Hire
            </button>
            <button
              type="button"
              onClick={() => setRole("worker")}
              className={`flex-1 h-12 font-mono text-xs uppercase tracking-widest transition-all ${
                role === "worker"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              🔧 I want to Work
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  {field.label} {field.required && <span className="text-primary">*</span>}
                </label>
                <input
                  name={field.name}
                  type={field.type}
                  required={field.required}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-card border border-border font-body text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            ))}

            {role === "worker" && (
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Occupation <span className="text-primary">*</span>
                </label>
                <select
                  name="occupation"
                  required
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-card border border-border font-body text-sm focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Select occupation</option>
                  {OCCUPATIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Password (min 6 chars) <span className="text-primary">*</span>
              </label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full h-11 px-4 bg-card border border-border font-body text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Registering..." : `Register as ${role === "customer" ? "Customer" : "Worker"}`}
              </button>
            </div>

            <p className="text-center font-body text-sm text-muted-foreground">
              Already registered?{" "}
              <Link to="/login" className="safety-link font-mono text-xs uppercase">Login</Link>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default RegisterPage;
