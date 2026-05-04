import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Star } from "lucide-react";

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingBooking, setRatingBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await api.getCustomerBookings();
        setBookings(data || []);
      } catch (err) {
        toast.error("Could not load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleRate = async () => {
    if (!rating) return toast.error("Please select a rating");
    try {
      await api.rateBooking(ratingBooking._id, rating, ratingComment);
      setBookings((prev) => prev.map((b) => b._id === ratingBooking._id ? { ...b, rating, ratingComment, status: "completed" } : b));
      toast.success("Thank you for your feedback!");
      setRatingBooking(null);
      setRating(0);
      setRatingComment("");
    } catch (err) {
      toast.error(err.message || "Rating failed");
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "confirmed": return "text-primary";
      case "completed": return "text-green-600";
      case "cancelled": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="pt-14">
      {/* Rating Modal */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-card border border-border p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Rate Worker</p>
                <h3 className="font-mono text-lg font-bold">{ratingBooking.workerId?.name || "Worker"}</h3>
              </div>
              <button onClick={() => { setRatingBooking(null); setRating(0); setRatingComment(""); }} className="font-mono text-xs text-destructive">✕</button>
            </div>

            <p className="font-mono text-xs text-muted-foreground mb-4">How was your experience?</p>

            <div className="flex gap-2 justify-center mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${(hoverRating || rating) >= star ? "fill-primary text-primary" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>

            <p className="font-mono text-xs text-center mb-4">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>

            <div className="mb-4">
              <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">Comment (optional)</label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full h-20 px-3 py-2 bg-background border border-border font-body text-sm focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleRate}
              className="w-full h-10 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Submit Rating
            </button>
          </div>
        </div>
      )}

      <section className="container py-10">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Your Bookings</p>
        <h1 className="text-3xl font-bold tracking-tight mb-8">My Bookings</h1>

        {loading ? (
          <p className="font-mono text-sm text-muted-foreground text-center py-10">Loading...</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-mono text-sm text-muted-foreground">No bookings yet. Search and book a worker!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b._id} className="bg-card border border-border p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-mono text-base font-bold">{b.workerId?.name || "Worker"}</h3>
                    <p className="font-mono text-xs text-muted-foreground">{b.workerId?.occupation}</p>
                  </div>
                  <span className={`font-mono text-xs uppercase tracking-widest ${statusColor(b.status)}`}>
                    {b.status || "pending"}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase">Date</p>
                    <p className="font-body">{new Date(b.serviceDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase">Price</p>
                    <p className="font-body font-bold">₹{b.agreedPrice}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase">Address</p>
                    <p className="font-body">{b.customerAddress}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase">Worker ID</p>
                    <p className="font-body">{b.workerId?.registrationId}</p>
                  </div>
                </div>
                {b.description && (
                  <p className="font-body text-sm text-muted-foreground mt-3 border-t border-border pt-3">{b.description}</p>
                )}

                {/* Rating section */}
                {b.status === "completed" && !b.rating && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <button
                      onClick={() => setRatingBooking(b)}
                      className="px-4 py-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
                    >
                      Rate Worker
                    </button>
                  </div>
                )}
                {b.rating && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`h-4 w-4 ${b.rating >= star ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                    {b.ratingComment && <span className="font-body text-xs text-muted-foreground">— {b.ratingComment}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyBookingsPage;
