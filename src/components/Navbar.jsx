import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Menu, X, Briefcase } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, isAdmin, isWorker, isCustomer, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleSelectionOpen, setRoleSelectionOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleRegisterClick = () => {
    setRoleSelectionOpen(true);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setRoleSelectionOpen(false);
    setConfirmed(false);
    setConfirmationOpen(true);
  };

  const handleConfirm = () => {
    if (confirmed) {
      setConfirmationOpen(false);
      setRoleSelectionOpen(false);
      // Navigate to register page with role info
      navigate("/register", { state: { registerAs: selectedRole } });
      setSelectedRole(null);
      setConfirmed(false);
    }
  };

  const handleCancel = () => {
    setConfirmationOpen(false);
    setRoleSelectionOpen(false);
    setSelectedRole(null);
    setConfirmed(false);
  };

  let navItems = [{ label: "Home", path: "/" }];

  // Search & Nearby only for customers and guests (not workers)
  if (!isWorker) {
    navItems.push({ label: "Search", path: "/search" });
    navItems.push({ label: "Nearby", path: "/nearby" });
  }

  if (!isLoggedIn) {
    navItems.push({ label: "Login", path: "/login" });
  } else {
    if (isCustomer) {
      navItems.push({ label: "My Bookings", path: "/my-bookings" });
    }
    if (isWorker) {
      navItems.push({ label: "Dashboard", path: "/dashboard" });
      navItems.push({ label: "My Profile", path: "/profile" });
    }
    if (isAdmin) {
      navItems.push({ label: "Admin", path: "/admin" });
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="font-mono text-lg font-bold tracking-tight safety-link">
          SEVA<span className="text-primary">.</span>WEBSITE
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-mono text-xs uppercase tracking-widest safety-link ${
                location.pathname === item.path ? "text-primary" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
          {!isLoggedIn && (
            <button
              onClick={handleRegisterClick}
              className="font-mono text-xs uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
            >
              Register
            </button>
          )}
          {isLoggedIn && (
            <>
              <NotificationBell />
              <span className="font-mono text-xs text-muted-foreground">
                {user?.name} <span className="text-primary">({user?.role})</span>
              </span>
              <button
                onClick={handleLogout}
                className="font-mono text-xs uppercase tracking-widest text-destructive hover:opacity-80 transition-opacity"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          {isLoggedIn && <NotificationBell />}
          <button onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 font-mono text-xs uppercase tracking-widest safety-link ${
                location.pathname === item.path ? "text-primary" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
          {!isLoggedIn && (
            <button
              onClick={() => {
                setMobileOpen(false);
                handleRegisterClick();
              }}
              className="block w-full text-left py-2 font-mono text-xs uppercase tracking-widest text-primary"
            >
              Register
            </button>
          )}
          {isLoggedIn && (
            <div className="pt-2 border-t border-border mt-2">
              <span className="block py-1 font-mono text-xs text-muted-foreground">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="font-mono text-xs uppercase tracking-widest text-destructive"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}

      {/* Role Selection Modal */}
      <Dialog open={roleSelectionOpen} onOpenChange={setRoleSelectionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono text-lg uppercase tracking-widest">
              Choose Registration Type
            </DialogTitle>
            <DialogDescription className="font-body">
              Select the type of account you want to create
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-6">
            <button
              onClick={() => handleRoleSelect("customer")}
              className="p-4 border-2 border-border hover:border-primary hover:bg-primary/10 rounded transition-all text-center"
            >
              <div className="text-2xl mb-2">🏠</div>
              <p className="font-mono text-sm uppercase tracking-widest font-semibold">Customer</p>
              <p className="font-body text-xs text-muted-foreground mt-1">Book services</p>
            </button>
            <button
              onClick={() => handleRoleSelect("worker")}
              className="p-4 border-2 border-border hover:border-primary hover:bg-primary/10 rounded transition-all text-center"
            >
              <div className="text-2xl mb-2">🔧</div>
              <p className="font-mono text-sm uppercase tracking-widest font-semibold">Worker</p>
              <p className="font-body text-xs text-muted-foreground mt-1">Offer services</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono text-lg uppercase tracking-widest">
              Confirm Registration
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="font-body text-sm text-foreground">
              Are you sure you want to register as a <span className="font-semibold text-primary">{selectedRole}</span>?
            </p>

            {selectedRole === "worker" && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm font-body">
                <p className="text-muted-foreground">
                  As a worker, you'll be able to offer your professional services and build your reputation with customer ratings and reviews.
                </p>
              </div>
            )}

            {selectedRole === "customer" && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm font-body">
                <p className="text-muted-foreground">
                  As a customer, you'll be able to browse, book, and review professional services from verified workers.
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded border border-border">
              <Checkbox
                id="confirm"
                checked={confirmed}
                onCheckedChange={setConfirmed}
              />
              <label htmlFor="confirm" className="font-body text-sm cursor-pointer">
                Yes, I want to register as a {selectedRole}
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 font-mono text-xs uppercase tracking-widest border border-border hover:bg-muted rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!confirmed}
              className="px-4 py-2 font-mono text-xs uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 rounded transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;
