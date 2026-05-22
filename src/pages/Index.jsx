import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SERVICE_CATEGORIES = [
  { name: "Plumber", icon: "🔧", description: "Pipe fitting, repairs, installations" },
  { name: "Electrician", icon: "⚡", description: "Wiring, repairs, installations" },
  { name: "Painter", icon: "🎨", description: "Interior & exterior painting" },
  { name: "Mechanic", icon: "🔩", description: "Bike & cycle repair" },
  { name: "Cook", icon: "👨‍🍳", description: "Home cooking services" },
  { name: "Carpenter", icon: "🪚", description: "Furniture & woodwork" },
  { name: "Barber", icon: "✂️", description: "Hair cutting & grooming" },
  { name: "Sweeper", icon: "🧹", description: "Home & office cleaning" },
  { name: "Mason", icon: "🧱", description: "Brick & construction work" },
  { name: "Driver", icon: "🚗", description: "Personal & commercial driving" },
  { name: "Helper", icon: "🤝", description: "General labour assistance" },
  { name: "Cobbler", icon: "👞", description: "Shoe repair & maintenance" },
];

const STATS = [
  { value: "500+", label: "Workers" },
  { value: "12", label: "Categories" },
  { value: "7%", label: "Commission" },
  { value: "48hr", label: "Payment cycle" },
];

const Index = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleCategoryClick = (name) => {
    navigate(`/search?q=${encodeURIComponent(name)}`);
  };

  return (
    <div className="pt-14">
      {/* Hero */}
      <section className="container py-20 md:py-32">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4 animate-fade-in">
            Service Marketplace
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-6 animate-fade-in" style={{animationDelay: "0.1s"}}>
            Find skilled workers<span className="text-primary">.</span>
            <br />
            Get work done<span className="text-primary">.</span>
          </h1>
          <p className="font-body text-lg md:text-xl text-muted-foreground max-w-xl mb-10 animate-fade-in" style={{animationDelay: "0.2s"}}>
            Search for labour, workers and employees as per your requirement — plumbers, electricians, mechanics, cooks and more. Immediate home service.
          </p>

          <form onSubmit={handleSearch} className="flex gap-0 max-w-xl animate-fade-in" style={{animationDelay: "0.3s"}}>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a service... (e.g. plumber, electrician)"
                className="w-full h-12 pl-11 pr-4 bg-card border border-border font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all duration-300 hover:border-primary/50"
              />
            </div>
            <button
              type="submit"
              className="h-12 px-8 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 hover:shadow-lg transition-all duration-300 active:scale-95"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="workshop-panel">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, idx) => (
              <div key={stat.label} className="text-center animate-fade-in" style={{animationDelay: `${0.4 + idx * 0.1}s`}}>
                <div className="font-mono text-3xl font-bold text-secondary-foreground mb-1 hover:text-primary transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="font-mono text-xs uppercase tracking-widest text-secondary-foreground/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Browse by
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Service Categories
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-base">
          {SERVICE_CATEGORIES.map((cat, idx) => (
            <div
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className="category-card group animate-fade-in hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
              style={{animationDelay: `${0.6 + idx * 0.05}s`}}
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {cat.icon}
              </div>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider mb-1 group-hover:text-primary transition-colors duration-300">
                {cat.name}
              </h3>
              <p className="font-body text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                {cat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container py-16 border-t border-border">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Process
          </p>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Search", desc: "Find the service you need from our categories" },
            { step: "02", title: "Select", desc: "Choose a worker based on skills, location & price" },
            { step: "03", title: "Book", desc: "Confirm your booking with a 7% commission charge" },
            { step: "04", title: "Done", desc: "Get immediate home service and rate the worker" },
          ].map((item, idx) => (
            <div key={item.step} className="relative animate-fade-in hover:transform hover:scale-105 transition-all duration-300" style={{animationDelay: `${1.0 + idx * 0.1}s`}}>
              <span className="font-mono text-5xl font-bold text-muted/80 group-hover:text-primary transition-colors duration-300">{item.step}</span>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider mt-2 mb-1 group-hover:text-primary transition-colors duration-300">
                {item.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Motive */}
      <section className="workshop-panel">
        <div className="container py-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-secondary-foreground/60 mb-2">
              Our motive
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-secondary-foreground mb-6">
              Equal work, equal respect<span className="text-primary">.</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {[
                "Time saving — get service at your doorstep",
                "No discrimination — every worker is equally respected",
                "Reliable service — verified professionals",
                "Immediate work — home service on demand",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-primary font-mono font-bold mt-0.5">→</span>
                  <p className="font-body text-sm text-secondary-foreground/80">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
