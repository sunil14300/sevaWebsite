const Footer = () => {
  return (
    <footer className="workshop-panel mt-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-4 text-secondary-foreground">
              SEVA<span className="text-primary">.</span>WEBSITE
            </h4>
            <p className="font-body text-sm text-secondary-foreground/70">
              Connecting you with skilled workers and service providers in your area. Time-saving, respectful, and reliable.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-4 text-secondary-foreground">Services</h4>
            <ul className="space-y-2 font-body text-sm text-secondary-foreground/70">
              <li>Plumber</li>
              <li>Electrician</li>
              <li>Painter</li>
              <li>Mechanic</li>
              <li>Cook</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-4 text-secondary-foreground">Contact</h4>
            <ul className="space-y-2 font-body text-sm text-secondary-foreground/70">
              <li>info@sevawebsite.com</li>
              <li>+91 8065147502</li>
              <li>Lucknow, Uttar Pradesh</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-secondary-foreground/10 text-center">
          <p className="font-mono text-xs text-secondary-foreground/50 uppercase tracking-widest">
            © 2026 Seva Website. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
