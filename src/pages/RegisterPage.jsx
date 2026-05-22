import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const OCCUPATIONS = [
  "Plumber", "Electrician", "Painter", "Mechanic", "Cook", "Carpenter",
  "Barber", "Sweeper", "Mason", "Driver", "Helper", "Cobbler", "Technical Person", "Labour", "Others",
];

const RegisterPage = () => {
  const [role, setRole] = useState("customer");
  const [formData, setFormData] = useState({
    name: "", address: "", dob: "", mobile: "", email: "",
    state: "", occupation: "", occupationOther: "", aadhaar: "", pan: "", priceCharge: "", password: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [regId, setRegId] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return "Name is required";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Name should only contain letters and spaces";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    return "";
  };

  const validateMobile = (mobile) => {
    if (!mobile) return "Mobile number is required";
    const cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile.length < 10) return "Mobile number must be at least 10 digits";
    if (cleanMobile.length > 10) return "Mobile number must be 10 digits";
    return "";
  };

  const validateEmail = (email) => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const validateAadhaar = (aadhaar) => {
    if (!aadhaar) return "Aadhaar number is required";
    const cleanAadhaar = aadhaar.replace(/\D/g, "");
    if (cleanAadhaar.length !== 12) return "Aadhaar number must be 12 digits";
    return "";
  };

  const validatePriceCharge = (price) => {
    if (!price) return "Price charge is required";
    if (isNaN(price) || parseFloat(price) <= 0) return "Price must be a valid positive number";
    return "";
  };

  const validateDOB = (dob) => {
    if (!dob) return "Date of birth is required";
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) return "Must be at least 18 years old";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Real-time validation for specific fields
    if (name === "name") {
      const cleanedValue = value.replace(/[0-9]/g, ""); // Remove numbers automatically
      setFormData({ ...formData, [name]: cleanedValue });
      setErrors({ ...errors, [name]: validateName(cleanedValue) });
    } else if (name === "mobile") {
      // Allow only digits
      const cleanedValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: cleanedValue });
      setErrors({ ...errors, [name]: validateMobile(cleanedValue) });
    } else if (name === "email") {
      setFormData({ ...formData, [name]: value });
      setErrors({ ...errors, [name]: validateEmail(value) });
    } else if (name === "password") {
      setFormData({ ...formData, [name]: value });
      setErrors({ ...errors, [name]: validatePassword(value) });
    } else if (name === "aadhaar") {
      const cleanedValue = value.replace(/\D/g, "").slice(0, 12);
      setFormData({ ...formData, [name]: cleanedValue });
      setErrors({ ...errors, [name]: validateAadhaar(cleanedValue) });
    } else if (name === "priceCharge") {
      setFormData({ ...formData, [name]: value });
      setErrors({ ...errors, [name]: validatePriceCharge(value) });
    } else if (name === "dob") {
      setFormData({ ...formData, [name]: value });
      setErrors({ ...errors, [name]: validateDOB(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    newErrors.name = validateName(formData.name);
    newErrors.mobile = validateMobile(formData.mobile);
    newErrors.address = !formData.address ? "Address is required" : "";
    newErrors.dob = validateDOB(formData.dob);
    newErrors.state = !formData.state ? "State is required" : "";
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);

    if (role === "worker") {
      newErrors.occupation = !formData.occupation ? "Occupation is required" : "";
      if (formData.occupation === "Others") {
        newErrors.occupationOther = !formData.occupationOther ? "Please specify your occupation" : "";
      }
      newErrors.aadhaar = validateAadhaar(formData.aadhaar);
      newErrors.priceCharge = validatePriceCharge(formData.priceCharge);
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData, role };
      if (role === "customer") {
        delete payload.occupation;
        delete payload.occupationOther;
        delete payload.aadhaar;
        delete payload.pan;
        delete payload.priceCharge;
      } else if (formData.occupation !== "Others") {
        delete payload.occupationOther;
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
              🏠 Customer
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
              🔧 Worker
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
                  placeholder={field.name === "mobile" ? "Enter 10 digit number" : ""}
                  className={`w-full h-11 px-4 bg-card border font-body text-sm focus:outline-none transition-colors ${
                    errors[field.name] ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"
                  }`}
                />
                {errors[field.name] && (
                  <p className="text-red-500 text-xs mt-1 font-body">{errors[field.name]}</p>
                )}
              </div>
            ))}

            {role === "worker" && (
              <>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    Occupation <span className="text-primary">*</span>
                  </label>
                  <select
                    name="occupation"
                    required
                    value={formData.occupation}
                    onChange={handleChange}
                    className={`w-full h-11 px-4 bg-card border font-body text-sm focus:outline-none transition-colors ${
                      errors.occupation ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"
                    }`}
                  >
                    <option value="">Select occupation</option>
                    {OCCUPATIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  {errors.occupation && (
                    <p className="text-red-500 text-xs mt-1 font-body">{errors.occupation}</p>
                  )}
                </div>
                {formData.occupation === "Others" && (
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      Please specify your occupation <span className="text-primary">*</span>
                    </label>
                    <input
                      name="occupationOther"
                      type="text"
                      required
                      placeholder="Enter your occupation"
                      value={formData.occupationOther}
                      onChange={handleChange}
                      className={`w-full h-11 px-4 bg-card border font-body text-sm focus:outline-none transition-colors ${
                        errors.occupationOther ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"
                      }`}
                    />
                    {errors.occupationOther && (
                      <p className="text-red-500 text-xs mt-1 font-body">{errors.occupationOther}</p>
                    )}
                  </div>
                )}
              </>
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
                className={`w-full h-11 px-4 bg-card border font-body text-sm focus:outline-none transition-colors ${
                  errors.password ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 font-body">{errors.password}</p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || Object.values(errors).some(error => error)}
                className="w-full h-12 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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
