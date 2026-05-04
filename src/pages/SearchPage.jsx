import { Search, MapPin, Star, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [workers, setWorkers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [bookingWorker, setBookingWorker] = useState(null);
  const [bookingForm, setBookingForm] = useState({ customerName: "", customerMobile: "", customerAddress: "", serviceDate: "", agreedPrice: "", description: "" });
  const { isLoggedIn, isCustomer } = useAuth();

  const fetchWorkers = async (q) => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;
      const data = await api.searchWorkers(params);
      setWorkers(data.workers || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error("Could not load workers. Is the backend running?");
      setWorkers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers(query);
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await api.createBooking({ ...bookingForm, workerId: bookingWorker.registrationId });
      toast.success("Booking created!");
      setBookingWorker(null);
      setBookingForm({ customerName: "", customerMobile: "", customerAddress: "", serviceDate: "", agreedPrice: "", description: "" });
    } catch (err) {
      toast.error(err.message || "Booking failed");
    }
  };

  return (
    <div className="pt-14">
      {/* Booking Modal */}
      {bookingWorker && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
            <div className="bg-card border border-border p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center">
                    {bookingWorker.profilePhoto ? (
                      <img src={bookingWorker.profilePhoto} alt={bookingWorker.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Book Worker</p>
                    <h3 className="font-mono text-lg font-bold">{bookingWorker.name}</h3>
                    <p className="font-mono text-xs text-muted-foreground">{bookingWorker.occupation} · {bookingWorker.priceCharge}</p>
                  </div>
                </div>
              <button onClick={() => setBookingWorker(null)} className="font-mono text-xs text-destructive">✕</button>
            </div>
            <form onSubmit={handleBooking} className="space-y-3">
              {[
                { name: "customerName", label: "Your Name", type: "text" },
                { name: "customerMobile", label: "Your Mobile", type: "tel" },
                { name: "customerAddress", label: "Service Address", type: "text" },
                { name: "serviceDate", label: "Service Date", type: "date" },
                { name: "agreedPrice", label: "Agreed Price (₹)", type: "number" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    required
                    value={bookingForm[f.name]}
                    onChange={(e) => setBookingForm({ ...bookingForm, [f.name]: e.target.value })}
                    className="w-full h-10 px-3 bg-background border border-border font-body text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">Description (optional)</label>
                <textarea
                  value={bookingForm.description}
                  onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                  className="w-full h-20 px-3 py-2 bg-background border border-border font-body text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">7% commission will be applied</p>
              <button type="submit" className="w-full h-10 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}

      <section className="container py-10">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Search Results {query && `for "${query}"`}
          </p>
          <div className="flex gap-0 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchWorkers(query)}
                placeholder="Search workers..."
                className="w-full h-12 pl-11 pr-4 bg-card border border-border font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <button
              onClick={() => fetchWorkers(query)}
              className="h-12 px-6 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </div>
        </div>

        {loading ? (
          <p className="font-mono text-sm text-muted-foreground py-10 text-center">Loading workers...</p>
        ) : (
          <>
            <p className="font-mono text-xs text-muted-foreground mb-6">
              {total} worker{total !== 1 ? "s" : ""} found
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {workers.map((worker) => (
                <div key={worker.registrationId || worker._id} className="worker-card">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-muted border border-border flex-shrink-0 flex items-center justify-center">
                          {worker.profilePhoto ? (
                            <img src={worker.profilePhoto} alt={worker.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-mono text-base font-bold">{worker.name}</h3>
                          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                            {worker.occupation}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={worker.available ? "status-available" : "status-booked"}>
                          {worker.available ? "Available" : "Booked"}
                        </span>
                        {worker.verified && (
                          <span className="font-mono text-[10px] text-primary uppercase tracking-wider">✓ Verified</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="font-body text-sm">{worker.address || worker.state}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-3 w-3 text-primary" />
                        <span className="font-body text-sm">{worker.rating || 0} / 5.0</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="font-mono text-sm font-bold">{worker.priceCharge}</span>
                      {isCustomer && (
                        <button
                          disabled={!worker.available}
                          onClick={() => setBookingWorker(worker)}
                          className="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                        >
                          Book Now
                        </button>
                      )}
                      {!isLoggedIn && (
                        <span className="font-mono text-[10px] text-muted-foreground">Login as customer to book</span>
                      )}
                    </div>

                    <p className="font-mono text-[10px] text-muted-foreground mt-3 uppercase tracking-wider">
                      ID: {worker.registrationId} · {worker.state}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {workers.length === 0 && !loading && (
              <div className="text-center py-20">
                <p className="font-mono text-sm text-muted-foreground">
                  {query ? `No workers found for "${query}".` : "No workers found. Is the backend running?"}
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default SearchPage;
