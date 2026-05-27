import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Users, Briefcase, Calendar, ShieldCheck, Trash2, CheckCircle, XCircle, Edit } from "lucide-react";

const AdminPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [bookingSearchQuery, setBookingSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    loadStats();
  }, [isAdmin]);

  const loadStats = async () => {
    try {
      const data = await api.adminGetStats();
      setStats(data);
    } catch {
      toast.error("Failed to load stats");
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (verifiedFilter) params.verified = verifiedFilter;
      const data = await api.adminGetUsers(params);
      setUsers(data.users || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const searchTerm = userSearchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchTerm) ||
      user.registrationId.toLowerCase().includes(searchTerm) ||
      user.mobile.includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm)
    );
  });

  // Filter bookings based on search query
  const filteredBookings = bookings.filter((booking) => {
    const searchTerm = bookingSearchQuery.toLowerCase();
    return (
      booking.customerName?.toLowerCase().includes(searchTerm) ||
      booking.workerName?.toLowerCase().includes(searchTerm) ||
      booking._id?.includes(searchTerm)
    );
  });

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.adminGetBookings();
      setBookings(data.bookings || []);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "users") loadUsers();
    if (tab === "bookings") loadBookings();
  }, [tab, roleFilter, verifiedFilter]);

  const verifyUser = async (id, verified) => {
    try {
      await api.adminUpdateUser(id, { verified });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, verified } : u)));
      toast.success(verified ? "User verified" : "Verification removed");
    } catch {
      toast.error("Update failed");
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user permanently?")) return;
    try {
      await api.adminDeleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const deleteBooking = async (id) => {
    if (!confirm("Delete this booking permanently?")) return;
    try {
      await api.adminDeleteBooking(id);
      setBookings((prev) => prev.filter((b) => b._id !== id));
      toast.success("Booking deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await api.adminUpdateBooking(id, { status });
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status } : b)));
      toast.success("Booking updated");
    } catch {
      toast.error("Update failed");
    }
  };

  const saveUserEdit = async () => {
    if (!editingUser) return;
    try {
      const updated = await api.adminUpdateUser(editingUser._id, editingUser);
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
      setEditingUser(null);
      toast.success("User updated");
    } catch {
      toast.error("Update failed");
    }
  };

  const tabs = [
    { id: "stats", label: "Overview", icon: <Briefcase className="h-4 w-4" /> },
    { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { id: "bookings", label: "Bookings", icon: <Calendar className="h-4 w-4" /> },
  ];

  if (!isAdmin) return null;

  return (
    <div className="pt-14">
      <section className="container py-10">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Admin Panel</p>
        <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-0 mb-8 border border-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-6 py-3 font-mono text-xs uppercase tracking-widest transition-all ${
                tab === t.id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        {tab === "stats" && stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Workers", value: stats.totalWorkers, icon: "🔧" },
                { label: "Customers", value: stats.totalCustomers, icon: "🏠" },
                { label: "Bookings", value: stats.totalBookings, icon: "📋" },
                { label: "Pending Verification", value: stats.pendingVerifications, icon: "⏳" },
              ].map((s) => (
                <div key={s.label} className="bg-card border border-border p-6 text-center">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="font-mono text-3xl font-bold mb-1">{s.value}</div>
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-widest mb-3">Revenue & Commission</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Revenue", value: `₹${stats.totalRevenue || 0}`, icon: "💰" },
                { label: "Total Commission (7%)", value: `₹${(stats.totalCommission || 0).toFixed(2)}`, icon: "📊" },
                { label: "Completed Revenue", value: `₹${stats.completedRevenue || 0}`, icon: "✅" },
                { label: "Completed Commission", value: `₹${(stats.completedCommission || 0).toFixed(2)}`, icon: "🏦" },
              ].map((s) => (
                <div key={s.label} className="bg-card border border-border p-6 text-center">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="font-mono text-xl font-bold mb-1">{s.value}</div>
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Users */}
        {tab === "users" && (
          <>
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="flex gap-0">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name, ID, mobile, or email..."
                    className="w-full h-11 pl-4 pr-4 bg-card border border-border font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3 flex-wrap">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-10 px-3 bg-card border border-border font-mono text-xs focus:outline-none focus:border-primary"
                >
                  <option value="">All Roles</option>
                  <option value="worker">Workers</option>
                  <option value="customer">Customers</option>
                  <option value="admin">Admins</option>
                </select>
                <select
                  value={verifiedFilter}
                  onChange={(e) => setVerifiedFilter(e.target.value)}
                  className="h-10 px-3 bg-card border border-border font-mono text-xs focus:outline-none focus:border-primary"
                >
                  <option value="">All Status</option>
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                <div className="h-32 bg-card border border-border animate-pulse rounded"></div>
                <div className="h-32 bg-card border border-border animate-pulse rounded"></div>
                <div className="h-32 bg-card border border-border animate-pulse rounded"></div>
              </div>
            ) : (
              <>
                <p className="font-mono text-xs text-muted-foreground mb-4">
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
                </p>
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="font-mono text-sm text-muted-foreground">
                      {userSearchQuery ? `No users found matching "${userSearchQuery}"` : "No users found"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredUsers.map((u) => (
                      <div key={u._id} className="bg-card border border-border p-5 hover:border-primary transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-mono text-base font-bold">{u.name}</h3>
                              <span className="font-mono text-[10px] px-2 py-0.5 bg-secondary text-secondary-foreground uppercase">{u.role}</span>
                              {u.verified ? (
                                <span className="font-mono text-[10px] text-primary">✓ Verified</span>
                              ) : (
                                <span className="font-mono text-[10px] text-destructive">✗ Unverified</span>
                              )}
                            </div>
                            <p className="font-mono text-xs text-muted-foreground">{u.registrationId}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => verifyUser(u._id, !u.verified)}
                              className="p-2 hover:bg-muted transition-colors"
                              title={u.verified ? "Remove verification" : "Verify"}
                            >
                              {u.verified ? <XCircle className="h-4 w-4 text-destructive" /> : <CheckCircle className="h-4 w-4 text-primary" />}
                            </button>
                            <button onClick={() => setEditingUser({ ...u })} className="p-2 hover:bg-muted transition-colors" title="Edit">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => deleteUser(u._id)} className="p-2 hover:bg-muted transition-colors" title="Delete">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="font-mono text-[10px] text-muted-foreground uppercase">Mobile</p>
                            <p className="font-body">{u.mobile}</p>
                          </div>
                          <div>
                            <p className="font-mono text-[10px] text-muted-foreground uppercase">State</p>
                            <p className="font-body">{u.state}</p>
                          </div>
                          {u.role === "worker" && (
                            <>
                              <div>
                                <p className="font-mono text-[10px] text-muted-foreground uppercase">Occupation</p>
                                <p className="font-body">{u.occupation}</p>
                              </div>
                              <div>
                                <p className="font-mono text-[10px] text-muted-foreground uppercase">Price</p>
                                <p className="font-body">{u.priceCharge}</p>
                              </div>
                            </>
                          )}
                          <div>
                            <p className="font-mono text-[10px] text-muted-foreground uppercase">Email</p>
                            <p className="font-body">{u.email || "—"}</p>
                          </div>
                          <div>
                            <p className="font-mono text-[10px] text-muted-foreground uppercase">Joined</p>
                            <p className="font-body">{new Date(u.createdAt).toLocaleDateString()}</p>
                          </div>
                          {u.role === "worker" && (
                            <div>
                              <p className="font-mono text-[10px] text-muted-foreground uppercase">Aadhaar</p>
                              <p className="font-body">{u.aadhaar}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Bookings */}
        {tab === "bookings" && (
          <>
            <div className="mb-6">
              {/* Search Bar */}
              <div className="flex gap-0">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={bookingSearchQuery}
                    onChange={(e) => setBookingSearchQuery(e.target.value)}
                    placeholder="Search by customer name, worker name, or booking ID..."
                    className="w-full h-11 pl-4 pr-4 bg-card border border-border font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                <div className="h-40 bg-card border border-border animate-pulse rounded"></div>
                <div className="h-40 bg-card border border-border animate-pulse rounded"></div>
                <div className="h-40 bg-card border border-border animate-pulse rounded"></div>
              </div>
            ) : (
              <>
                <p className="font-mono text-xs text-muted-foreground mb-4">
                  {filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""} found
                </p>
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="font-mono text-sm text-muted-foreground">
                      {bookingSearchQuery ? `No bookings found matching "${bookingSearchQuery}"` : "No bookings found"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBookings.map((b) => (
                      <div key={b._id} className="bg-card border border-border p-5 hover:border-primary transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-mono text-base font-bold">{b.customerName}</h3>
                            <p className="font-mono text-xs text-muted-foreground">
                              Worker: {b.workerId?.name || "Unknown"} ({b.workerId?.registrationId})
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">{b.status || "pending"}</span>
                            <button onClick={() => deleteBooking(b._id)} className="p-2 hover:bg-muted transition-colors" title="Delete">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mb-3">
                          <div>
                            <p className="font-mono text-[10px] text-muted-foreground uppercase">Date</p>
                            <p className="font-body">{new Date(b.serviceDate).toLocaleDateString()}</p>
                          </div>
                          {/* <div>
                            <p className="font-mono text-[10px] text-muted-foreground uppercase">Price</p>
                            <p className="font-body font-bold">₹{b.agreedPrice}</p>
                          </div> */}
                          <div>
                            <p className="font-mono text-[10px] text-muted-foreground uppercase">Commission</p>
                            <p className="font-body">₹{b.commission?.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="font-mono text-[10px] text-muted-foreground uppercase">Mobile</p>
                            <p className="font-body">{b.customerMobile}</p>
                          </div>
                          <div>
                            <p className="font-mono text-[10px] text-muted-foreground uppercase">Address</p>
                            <p className="font-body">{b.customerAddress}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-border flex-wrap">
                          {["pending", "confirmed", "completed", "cancelled"].map((s) => (
                            <button
                              key={s}
                              onClick={() => updateBookingStatus(b._id, s)}
                              className={`px-3 py-1 font-mono text-[10px] uppercase tracking-widest border transition-colors ${
                                b.status === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
            <div className="bg-card border border-border p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-mono text-lg font-bold">Edit User</h3>
                <button onClick={() => setEditingUser(null)} className="font-mono text-xs text-destructive">✕</button>
              </div>
              <div className="space-y-3">
                {[
                  { key: "name", label: "Name" },
                  { key: "mobile", label: "Mobile" },
                  { key: "email", label: "Email" },
                  { key: "address", label: "Address" },
                  { key: "state", label: "State" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">{f.label}</label>
                    <input
                      value={editingUser[f.key] || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, [f.key]: e.target.value })}
                      className="w-full h-10 px-3 bg-background border border-border font-body text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                ))}
                {editingUser.role === "worker" && (
                  <>
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">Price Charge</label>
                      <input
                        value={editingUser.priceCharge || ""}
                        onChange={(e) => setEditingUser({ ...editingUser, priceCharge: e.target.value })}
                        className="w-full h-10 px-3 bg-background border border-border font-body text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-border font-mono text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="customer">Customer</option>
                    <option value="worker">Worker</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button
                  onClick={saveUserEdit}
                  className="w-full h-10 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminPage;
