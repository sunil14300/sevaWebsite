import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Camera, Save, User } from "lucide-react";

const WorkerProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const fileRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getMyProfile();
        setProfile(data);
        setForm({
          address: data.address || "",
          mobile: data.mobile || "",
          email: data.email || "",
          state: data.state || "",
          priceCharge: data.priceCharge || "",
          available: data.available ?? true,
        });
      } catch {
        toast.error("Could not load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast.error("Photo must be under 500KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const updated = await api.updateProfile({ profilePhoto: reader.result });
        setProfile((p) => ({ ...p, profilePhoto: updated.profilePhoto }));
        toast.success("Photo updated!");
      } catch {
        toast.error("Upload failed");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateProfile(form);
      setProfile((p) => ({ ...p, ...updated }));
      toast.success("Profile updated!");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="pt-14"><p className="text-center py-20 font-mono text-sm text-muted-foreground">Loading...</p></div>;
  if (!profile) return null;

  return (
    <div className="pt-14">
      <section className="container py-10 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">My Profile</p>
        <h1 className="text-3xl font-bold tracking-tight mb-8">{profile.name}</h1>

        {/* Profile Photo */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border flex items-center justify-center">
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-full bg-foreground/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              <Camera className="w-6 h-6 text-background" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div>
            <p className="font-mono text-sm font-bold">{profile.registrationId}</p>
            <p className="font-mono text-xs text-muted-foreground">{profile.occupation} · {profile.state}</p>
            <p className="font-mono text-xs text-muted-foreground">Rating: {profile.rating || 0}/5 ({profile.totalRatings} reviews)</p>
            {profile.verified && <span className="font-mono text-[10px] text-primary">✓ Verified</span>}
          </div>
        </div>

        {/* Editable Fields */}
        <div className="space-y-4">
          {[
            { key: "address", label: "Address", type: "text" },
            { key: "mobile", label: "Mobile", type: "tel" },
            { key: "email", label: "Email", type: "email" },
            { key: "state", label: "State", type: "text" },
            { key: "priceCharge", label: "Price / Charge", type: "text" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key] || ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full h-10 px-3 bg-card border border-border font-body text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          ))}

          <div className="flex items-center gap-3">
            <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Available</label>
            <button
              onClick={() => setForm({ ...form, available: !form.available })}
              className={`px-4 py-1.5 font-mono text-xs uppercase tracking-widest border transition-colors ${
                form.available ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
              }`}
            >
              {form.available ? "Yes" : "No"}
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default WorkerProfilePage;
