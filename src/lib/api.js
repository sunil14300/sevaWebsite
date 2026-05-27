const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem("seva_token");
    const headers = { "Content-Type": "application/json", ...options.headers };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.errors?.[0]?.msg || "Request failed");
    return data;
  },

  // Auth
  register(formData) {
    return this.request("/auth/register", { method: "POST", body: JSON.stringify(formData) });
  },
  login(registrationId, dob) {
    return this.request("/auth/login", { method: "POST", body: JSON.stringify({ registrationId, dob }) });
  },

  // Workers
  searchWorkers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/workers?${query}`);
  },
  getWorker(id) {
    return this.request(`/workers/${id}`);
  },
  updateProfile(updates) {
    return this.request("/workers/me", { method: "PATCH", body: JSON.stringify(updates) });
  },
  getMyProfile() {
    return this.request("/workers/me/profile");
  },
  getCustomerProfile() {
    return this.request("/customers/me/profile");
  },
  updateCustomerProfile(updates) {
    return this.request("/customers/me", { method: "PATCH", body: JSON.stringify(updates) });
  },
  getNearbyWorkers(lat, lng, radius = 2000, occupation = "") {
    const params = new URLSearchParams({ lat, lng, radius });
    if (occupation) params.append("occupation", occupation);
    return this.request(`/workers/nearby?${params.toString()}`);
  },

  // Bookings
  createBooking(data) {
    return this.request("/bookings", { method: "POST", body: JSON.stringify(data) });
  },
  getMyBookings() {
    return this.request("/bookings/my");
  },
  getCustomerBookings() {
    return this.request("/bookings/customer");
  },
  rateBooking(id, rating, ratingComment) {
    return this.request(`/bookings/${id}/rate`, { method: "PATCH", body: JSON.stringify({ rating, ratingComment }) });
  },

  // Notifications
  getNotifications() {
    return this.request("/notifications");
  },
  markAllRead() {
    return this.request("/notifications/read-all", { method: "PATCH" });
  },
  markRead(id) {
    return this.request(`/notifications/${id}/read`, { method: "PATCH" });
  },

  // Admin
  adminGetUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/users?${query}`);
  },
  adminGetUser(id) {
    return this.request(`/admin/users/${id}`);
  },
  adminUpdateUser(id, updates) {
    return this.request(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
  },
  adminDeleteUser(id) {
    return this.request(`/admin/users/${id}`, { method: "DELETE" });
  },
  adminGetBookings() {
    return this.request("/admin/bookings");
  },
  adminUpdateBooking(id, updates) {
    return this.request(`/admin/bookings/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
  },
  adminDeleteBooking(id) {
    return this.request(`/admin/bookings/${id}`, { method: "DELETE" });
  },
  adminGetStats() {
    return this.request("/admin/stats");
  },

  verifyAdminOTP(
registrationId,
otp
){

return this.request(

"/auth/verify-admin",

{

method:"POST",

body:
JSON.stringify({

registrationId,

otp

})

}

);

}

};
