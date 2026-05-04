import { useState, useEffect, useCallback } from "react";
import { Bell, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const NotificationBell = () => {
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // silent
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  };

  if (!isLoggedIn) return null;

  const typeColors = {
    booking_created: "text-primary",
    booking_accepted: "text-green-600",
    booking_declined: "text-destructive",
    booking_completed: "text-primary",
    new_worker_registered: "text-blue-600",
    new_customer_registered: "text-blue-600",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 hover:bg-muted rounded transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-mono rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-card border border-border shadow-lg z-50">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <p className="font-mono text-xs uppercase tracking-widest">Notifications</p>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="font-mono text-[10px] text-primary uppercase tracking-widest flex items-center gap-1 hover:opacity-80"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="p-4 text-center font-mono text-xs text-muted-foreground">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3 border-b border-border last:border-0 ${!n.read ? "bg-muted/50" : ""}`}
                >
                  <p className={`font-mono text-xs font-bold ${typeColors[n.type] || ""}`}>
                    {n.title}
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
