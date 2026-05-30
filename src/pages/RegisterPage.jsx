import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const OCCUPATIONS = [
  "Plumber", "Electrician", "Painter", "Mechanic", "Cook", "Carpenter",
  "Barber", "Sweeper", "Mason", "Driver", "Helper", "Cobbler", "Technical Person", "Labour","Beauty Parlour", "Others",
];

const SERVICE_CATEGORIES = [
  {
    category: "Hair & Personal Care",
    icon: "💇",
    services: [
      {
        name: "Barber",
        description: "Professional hair cutting, shaving, and beard grooming services",
        pricing: [
          { service: "Trendy Hair Cutting", price: "₹100" },
          { service: "Beard Grooming", price: "₹70" },
          { service: "Hair Coloring", price: "₹150+" },
          { service: "Facial", price: "₹100" }
        ]
      }
    ]
  },
  {
    category: "Cleaning & Maintenance",
    icon: "🧹",
    services: [
      {
        name: "Sweeper",
        description: "Deep cleaning, office cleaning, and general house maintenance",
        pricing: [
          { service: "Deep Home Cleaning", price: "₹500-₹1500" },
          { service: "Office Cleaning", price: "₹800-₹2000" },
          { service: "Bathroom & Kitchen Cleaning", price: "₹400-₹800" },
          { service: "New Home Cleaning (per sq ft)", price: "₹3-₹5" }
        ]
      },
      {
        name: "Mason",
        description: "Tiles & marble fitting, wall repair, and brickwork & ball plastering",
        pricing: [
          { service: "Tiles & Marble Fitting (per sq ft)", price: "₹50-₹100" },
          { service: "Wall Repair", price: "₹500-₹1200" },
          { service: "Brickwork & Ball Plastering (per sq ft)", price: "₹40-₹80" }
        ]
      }
    ]
  },
  {
    category: "Technical & Installation",
    icon: "🔧",
    services: [
      {
        name: "Plumber",
        description: "Pipe fitting, water tank installation, drainage services, and leak repairs",
        pricing: [
          { service: "Pipe Fitting & Tap Repair", price: "₹300-₹600" },
          { service: "Water Tank & Sink Installation", price: "₹800-₹1500" },
          { service: "Drainage Cleaning", price: "₹400-₹800" },
          { service: "Leak Repair from Pipe/Tank", price: "₹300-₹700" },
          { service: "Hourly Charge", price: "₹299 (Extra hour ₹99/hr)" }
        ]
      },
      {
        name: "Electrician",
        description: "Electrical repairs, fan installation, switchboard & socket fixing",
        pricing: [
          { service: "Electrical Repair", price: "₹200-₹500" },
          { service: "Fan & Copper Installation", price: "₹250-₹500" },
          { service: "Switchboard & Socket Fixing", price: "₹300-₹600" }
        ]
      },
      {
        name: "Carpenter",
        description: "Furniture repair, door & window repairs, and lock & key replacement",
        pricing: [
          { service: "Furniture Repair", price: "₹400-₹1200" },
          { service: "Door, Window, Latch Repair", price: "₹500-₹1500" },
          { service: "Lock & Key Replacement", price: "₹200-₹500" }
        ]
      }
    ]
  },
  {
    category: "Painting & Decoration",
    icon: "🎨",
    services: [
      {
        name: "Painter",
        description: "Professional painting with attention to detail and quality finishes",
        pricing: [
          { service: "Interior Painting (per sq ft)", price: "₹20-₹40" },
          { service: "Exterior Painting (per sq ft)", price: "₹25-₹50" },
          { service: "Wall Texture/Design (per sq ft)", price: "₹30-₹60" }
        ]
      }
    ]
  },
  {
    category: "Automotive & Transportation",
    icon: "🚗",
    services: [
      {
        name: "Mechanic",
        description: "Scooter/bike repair, tyre puncture & chain tightening services",
        pricing: [
          { service: "Scooter/Bike Repair", price: "₹300-₹800" },
          { service: "Tyre Puncture Repair", price: "₹50-₹150" },
          { service: "Chain Tightening", price: "₹100-₹200" }
        ]
      },
      {
        name: "Driver",
        description: "Personal & commercial transportation with safe & reliable service",
        pricing: [
          { service: "Personal Commuting (per day)", price: "₹500-₹1000" },
          { service: "Commercial Transport (per km)", price: "₹15-₹30" },
          { service: "Long distance Transport", price: "₹20-₹40/km" }
        ]
      }
    ]
  },
  {
    category: "Culinary Services",
    icon: "👨‍🍳",
    services: [
      {
        name: "Cook",
        description: "Non-veg and vegetarian cooking per person basis",
        pricing: [
          { service: "Non-Veg Cooking (per person)", price: "₹150-₹300" },
          { service: "Vegetarian Cooking (per person)", price: "₹100-₹200" },
          { service: "Special Events Catering (per person)", price: "₹200-₹400" }
        ]
      }
    ]
  },
  {
    category: "Additional Services",
    icon: "⚙️",
    services: [
      {
        name: "Helper",
        description: "General assistance for household and commercial tasks",
        pricing: [
          { service: "Hourly Rate", price: "₹100-₹200" },
          { service: "Daily Rate", price: "₹500-₹1000" }
        ]
      },
      {
        name: "Cobbler",
        description: "Professional shoe repair and maintenance services",
        pricing: [
          { service: "Shoe Sole Repair", price: "₹100-₹300" },
          { service: "Heel Replacement", price: "₹150-₹400" },
          { service: "General Shoe Maintenance", price: "₹50-₹150" }
        ]
      },
      {
        name: "Technical Person",
        description: "Technical support and troubleshooting services",
        pricing: [
          { service: "Hardware Support", price: "₹300-₹800" },
          { service: "Software Support (hourly)", price: "₹200-₹500" },
          { service: "Network Setup", price: "₹500-₹1500" }
        ]
      },
      {
        name: "Beauty Parlour",
        description: "Beauty services at home including makeup, skincare, and grooming",
        pricing: [
          { service: "Makeup Services", price: "₹500-₹2000" },
          { service: "Skincare Treatments", price: "₹300-₹1000" },
          { service: "Grooming Services", price: "₹200-₹800" }
        ]
      },

      {
        name: "Labour",
        description: "General labor for construction, moving, and heavy work",
        pricing: [
          { service: "Daily Labor (per day)", price: "₹400-₹800" },
          { service: "Hourly Labor (per hour)", price: "₹100-₹200" },
          { service: "Heavy Lifting/Moving", price: "₹500-₹1200" }
        ]
      }
    ]
  }
];

const RegisterPage = () => {
  const location = useLocation();
   const navigate = useNavigate();
const initialRole = location.state?.registerAs || "customer";
  // const isRoleLocked = !!initialRole; // Lock role if it came from navbar confirmation
  
  // const [role, setRole] = useState(initialRole || "customer");
 const [role, setRole] = useState(initialRole);

useEffect(()=>{

if(location.state?.registerAs){

setRole(
location.state.registerAs
);

}

},[location]);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    dob: "",
    mobile: "",
    email: "",
    state: "",

    occupation: "",
    occupationOther: "",
    aadhaar: "",
    pan: "",
    priceCharge: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [regId, setRegId] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
 

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
    }  else if (name === "aadhaar") {
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


    if (role === "worker") {
      newErrors.occupation = !formData.occupation ? "Occupation is required" : "";
      if (formData.occupation === "Others") {
        newErrors.occupationOther = !formData.occupationOther ? "Please specify your occupation" : "";
      }
      newErrors.aadhaar = validateAadhaar(formData.aadhaar);
      newErrors.priceCharge = validatePriceCharge(formData.priceCharge);
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
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
   <div className="pt-14 bg-muted/20 min-h-screen">

<section className="container py-10">

<div className="mb-8">
<p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">JOIN THE PLATFORM</p>
<h1 className="text-4xl font-bold">Registration</h1>
<p className="mt-2 text-sm text-muted-foreground font-medium">

You are registering as{" "}

<span className="text-primary font-semibold capitalize ">
{role}
</span>

</p>
</div>

<div className="grid lg:grid-cols-5 gap-8">


{/* LEFT SERVICE PANEL */}

<div className="lg:col-span-2">
<div className="bg-white rounded-xl border shadow-sm p-5 sticky top-20">
<h2 className="font-bold text-xl mb-2 ">Service Pricing</h2>
<p className="text-sm text-muted-foreground mb-5">Reference market pricing</p>

<div className=" space-y-4 max-h-[650px] overflow-y-auto pr-2 ">
{SERVICE_CATEGORIES.map((cat,index)=>(

<div key={index} className=" border rounded-lg p-4 hover:shadow-md transition">

<h3 className=" font-semibold text-primary mb-3">
{cat.icon} {cat.category}
</h3>


{cat.services.map((service)=>(
<div key={service.name} className="mb-3">

<p className="font-medium mb-2">

{service.name}

</p>

{service.pricing.slice(0,2).map((item)=>(
<div key={item.service} className=" flex justify-between text-sm text-muted-foreground">
<span>{item.service}</span>
<span>{item.price}</span>
</div>

))}
</div>
))}
</div>
))}
</div>

</div>

</div>


{/* FORM PANEL */}

<div className="lg:col-span-3">

<div className="bg-white border rounded-xl shadow-sm p-8">

<h2 className="text-2xl font-bold mb-6">Register as {" "}
<span className="text-primary">
{role}
</span>
</h2>

<form onSubmit={handleSubmit} className=" grid md:grid-cols-2 gap-5">
{fields.map((field)=>(
<div key={field.name} className={ field.name==="address" ?"md:col-span-2":""}>

<label className="block text-sm font-medium mb-2">
{field.label}

</label>

<input name={field.name} type={field.type} required={field.required} value={formData[field.name]}onChange={handleChange} placeholder={ field.name==="mobile" ?"Enter Mobile Number":""}

className=" w-full h-12 px-4 rounded-lg border focus:ring-2 focus:ring-orange-400 outline-none"/>{errors[field.name]&&(
<p className=" text-red-500 text-xs mt-1">{errors[field.name]}</p>
)}

</div>

))}

{role==="worker"&&(
<div className="md:col-span-2">
<label className="block mb-2 font-medium">Occupation</label>
<select name="occupation" value={formData.occupation} onChange={handleChange} className=" w-full h-12 border rounded-lg px-4">

<option value="">Select Occupation</option>{OCCUPATIONS.map((o)=>(<option key={o} value={o} >{o}</option>))}
</select>
</div>
)}


<div className="md:col-span-2">
<button type="submit" disabled={loading} className=" w-full h-12 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition">

{loading ?"Registering...":`Register as ${role}`}
</button>
</div>
</form>
</div>
</div>
</div>
</section>

</div>
  );
};

export default RegisterPage;
