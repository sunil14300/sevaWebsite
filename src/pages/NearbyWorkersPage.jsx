import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Star, User, Filter } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";

const OCCUPATIONS = [
  "", "Plumber", "Electrician", "Painter", "Mechanic", "Cook",
  "Carpenter", "Barber", "Sweeper", "Mason", "Driver",
  "Helper", "Cobbler", "Technical Person", "Labour", "Others",
];

const NearbyWorkersPage = () => {
  const { isLoggedIn, isCustomer } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [occupation, setOccupation] = useState("");
  const [radius, setRadius] = useState(2000);
  const [bookingWorker, setBookingWorker] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    customerName: "", customerMobile: "", customerAddress: "",
    serviceDate: "", description: "",
  });
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        toast.error("Could not get your location. Please enable location access.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const fetchNearbyWorkers = async () => {
    if (!userLocation) return;
    setLoading(true);
    try {
      const data = await api.getNearbyWorkers(userLocation.lat, userLocation.lng, radius, occupation);
      setWorkers(data.workers || []);
    } catch {
      toast.error("Could not load nearby workers. Is the backend running?");
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) fetchNearbyWorkers();
  }, [userLocation, radius, occupation]);

  // Initialize & update Leaflet map
  useEffect(() => {
    if (!userLocation || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Fix default icon paths
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15);
      } else {
        mapInstanceRef.current = L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 15);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(mapInstanceRef.current);
      }

      // Clear old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Add user marker (blue)
      const userIcon = L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;background:hsl(210,100%,50%);border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup("<b>Your Location</b>");
      markersRef.current.push(userMarker);

      // Add radius circle
      const circle = L.circle([userLocation.lat, userLocation.lng], {
        radius: radius,
        color: "hsl(16, 100%, 50%)",
        fillColor: "hsl(16, 100%, 50%)",
        fillOpacity: 0.08,
        weight: 1,
      }).addTo(mapInstanceRef.current);
      markersRef.current.push(circle);

      // Add worker markers (orange)
      workers.forEach((w) => {
        if (!w.location?.coordinates || (w.location.coordinates[0] === 0 && w.location.coordinates[1] === 0)) return;
        const [lng, lat] = w.location.coordinates;

        const workerIcon = L.divIcon({
          className: "",
          html: `<div style="width:12px;height:12px;background:hsl(16,100%,50%);border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const marker = L.marker([lat, lng], { icon: workerIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="font-family:monospace;font-size:12px">
              <b>${w.name}</b><br/>
              ${w.occupation === "Others" ? w.occupationOther : w.occupation} · ${w.priceCharge}<br/>
              ⭐ ${w.rating || 0}/5 · ${w.available ? "Available" : "Booked"}
            </div>
          `);
        markersRef.current.push(marker);
      });

      mapInstanceRef.current.invalidateSize();
    };

    initMap();

    return () => {
      // don't destroy map on re-render, just clean markers
    };
  }, [userLocation, workers, radius]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await api.createBooking({ ...bookingForm, workerId: bookingWorker.registrationId });
      toast.success("Booking created!");
      setBookingWorker(null);
      setBookingForm({ customerName: "", customerMobile: "", customerAddress: "", serviceDate: "", description: "" });
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
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Book Worker</p>
                <h3 className="font-mono text-lg font-bold">{bookingWorker.name}</h3>
                <p className="font-mono text-xs text-muted-foreground">{bookingWorker.occupation === "Others" ? bookingWorker.occupationOther : bookingWorker.occupation} · {bookingWorker.priceCharge}</p>
              </div>
              <button onClick={() => setBookingWorker(null)} className="font-mono text-xs text-destructive">✕</button>
            </div>
            <form onSubmit={handleBooking} className="space-y-3">
              {[
                { name: "customerName", label: "Your Name", type: "text" },
                { name: "customerMobile", label: "Your Mobile", type: "tel" },
                { name: "customerAddress", label: "Service Address", type: "text" },
                { name: "serviceDate", label: "Service Date", type: "date" },
                
              ].map((f) => (
                <div key={f.name}>
                  <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">{f.label}</label>
                  <input
                    type={f.type} required
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
              {/* <p className="font-mono text-[10px] text-muted-foreground">7% commission will be applied</p> */}

              {/* terms and conditions apply */}

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">

              <h4 className="font-semibold text-sm mb-3">📜 Terms & Conditions</h4>

              <div className="max-h-40 overflow-y-auto border bg-white rounded-md p-3 text-xs text-gray-700 space-y-2">

              <p>1. Worker service price displayed on platform is fixed and non-negotiable.</p>
              <p>2. Customer agrees to pay the amount shown before booking.</p>
              <p>3. Price bargaining after booking is not allowed.</p>
              <p>4. False bookings or misuse of platform may lead to account suspension.</p>
              <p>5. Customer must provide correct service address and mobile number.</p>
              <p>6. Worker must complete service professionally and ethically.</p>
              <p>7. Platform acts only as a service marketplace connecting customers and workers.</p>
              <p>8. Illegal activities, fraud, abuse or harassment are strictly prohibited.</p>
              <p>9. Workers are responsible for service quality and professionalism.</p>
              <p>10. Platform reserves right to suspend suspicious or fraudulent accounts.</p>
              <p>11. Service timing depends on worker availability.</p>
              <p>12. Customer should verify service details before confirming booking.</p>
              <p>13. By continuing, you agree platform policies and legal usage conditions.</p>
              </div>

            <div className="flex gap-2 mt-4 items-start">
            <input required type="checkbox" id="terms" className="mt-1"/>
                <label htmlFor="terms" className="text-xs text-gray-700">I have read and accepted the Terms & Conditions.</label>

            </div>

            </div>

              <button type="submit" className="w-full h-10 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}

      <section className="container py-10">
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Nearby Workers</p>
          <h1 className="text-3xl font-bold tracking-tight mb-4">Find Workers Near You</h1>

          <div className="flex flex-wrap gap-3 items-end mb-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                <Filter className="inline h-3 w-3 mr-1" />Occupation
              </label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="h-10 px-3 bg-card border border-border font-mono text-xs focus:outline-none focus:border-primary"
              >
                <option value="">All Occupations</option>
                {OCCUPATIONS.filter(Boolean).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Radius</label>
              <select
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="h-10 px-3 bg-card border border-border font-mono text-xs focus:outline-none focus:border-primary"
              >
                <option value={1000}>1 km</option>
                <option value={2000}>2 km</option>
                <option value={5000}>5 km</option>
                <option value={10000}>10 km</option>
              </select>
            </div>
            <button
              onClick={getUserLocation}
              disabled={locating}
              className="h-10 px-4 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              <Navigation className="h-3 w-3" />
              {locating ? "Locating..." : "Refresh Location"}
            </button>
          </div>
        </div>

        {!userLocation && !locating && (
          <div className="text-center py-20">
            <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-mono text-sm text-muted-foreground mb-4">Enable location access to find workers near you</p>
            <button
              onClick={getUserLocation}
              className="px-6 py-3 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90"
            >
              Enable Location
            </button>
          </div>
        )}

        {locating && (
          <p className="font-mono text-sm text-muted-foreground text-center py-10">Getting your location...</p>
        )}

        {userLocation && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <div
                ref={mapRef}
                className="w-full h-[400px] lg:h-[500px] border border-border bg-muted"
                style={{ zIndex: 1 }}
              />
              <p className="font-mono text-[10px] text-muted-foreground mt-2">
                Showing workers within {radius / 1000}km · {workers.length} found
              </p>
            </div>

            {/* Worker list */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground sticky top-0 bg-background py-2">
                {loading ? "Searching..." : `${workers.length} Worker${workers.length !== 1 ? "s" : ""} Nearby`}
              </p>

              {workers.length === 0 && !loading && (
                <p className="font-mono text-xs text-muted-foreground text-center py-6">
                  No workers found nearby. Try increasing the radius.
                </p>
              )}

              {workers.map((w) => (
                <div key={w.registrationId || w._id} className="worker-card">
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted border border-border flex-shrink-0 flex items-center justify-center">
                        {w.profilePhoto ? (
                          <img src={w.profilePhoto} alt={w.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-mono text-sm font-bold truncate">{w.name}</h3>
                        <p className="font-mono text-[10px] text-muted-foreground uppercase">{w.occupation === "Others" ? w.occupationOther : w.occupation}</p>
                      </div>
                      <span className={w.available ? "status-available" : "status-booked"}>
                        {w.available ? "Available" : "Booked"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-primary" />{w.rating || 0}/5
                      </span>
                      <span className="font-mono font-bold text-foreground">{w.priceCharge}</span>
                    </div>
                    {isCustomer && (
                      <button
                        disabled={!w.available}
                        onClick={() => setBookingWorker(w)}
                        className="w-full h-8 bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                      >
                        Book Now
                      </button>
                    )}
                    {!isLoggedIn && (
                      <span className="font-mono text-[10px] text-muted-foreground">Login as customer to book</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default NearbyWorkersPage;
