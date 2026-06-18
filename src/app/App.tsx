import { useState, useEffect } from "react";
import { fetchProducts, fetchPosts, Product, Post } from "./data/api";
import AdminPanel from "./components/AdminPanel";
import {
  Phone,
  Mail,
  MapPin,
  ShoppingCart,
  User,
  Search,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  FlaskConical,
  Microscope,
  Thermometer,
  Package,
  Shield,
  Truck,
  Award,
  Clock,
  ArrowRight,
  Star,
  CheckCircle,
  ExternalLink,
  Minus,
  Plus,
  Lock,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Lab Consumables",
    href: "#products",
    children: [
      { label: "Pipettes & Tips", href: "#products" },
      { label: "Microtubes & Centrifuge Tubes", href: "#products" },
      { label: "Cell Culture Flasks", href: "#products" },
      { label: "Petri Dishes & Plates", href: "#products" },
      { label: "Glassware", href: "#products" },
      { label: "Filters & Membranes", href: "#products" },
    ],
  },
  {
    label: "Reagents & Chemicals",
    href: "#products",
    children: [
      { label: "Molecular Biology Reagents", href: "#products" },
      { label: "Biochemistry Reagents", href: "#products" },
      { label: "Stains & Dyes", href: "#products" },
      { label: "Buffers & Solutions", href: "#products" },
      { label: "Culture Media", href: "#products" },
      { label: "Diagnostic Kits", href: "#products" },
    ],
  },
  {
    label: "Medical Equipment",
    href: "#products",
    children: [
      { label: "Centrifuges", href: "#products" },
      { label: "Microscopes", href: "#products" },
      { label: "Spectrophotometers", href: "#products" },
      { label: "Incubators", href: "#products" },
      { label: "Biosafety Cabinets", href: "#products" },
      { label: "PCR Instruments", href: "#products" },
    ],
  },
  {
    label: "Rapid Diagnostics",
    href: "#products",
    children: [
      { label: "Lateral Flow Tests", href: "#products" },
      { label: "Point-of-Care Testing", href: "#products" },
      { label: "Immunoassay Kits", href: "#products" },
      { label: "Haematology Strips", href: "#products" },
      { label: "Urinalysis", href: "#products" },
      { label: "COVID & Respiratory", href: "#products" },
    ],
  },
  {
    label: "Brands",
    href: "#brands",
    children: [
      { label: "Thermo Fisher Scientific", href: "#brands" },
      { label: "Bio-Rad", href: "#brands" },
      { label: "Merck", href: "#brands" },
      { label: "Sartorius", href: "#brands" },
      { label: "Eppendorf", href: "#brands" },
      { label: "Qiagen", href: "#brands" },
    ],
  },
  { label: "About Us", href: "#about", children: [] },
  { label: "Contact", href: "#contact", children: [] },
];

const PRODUCT_CATEGORIES = [
  {
    title: "Laboratory Consumables",
    description:
      "High-quality pipettes, tubes, flasks, and disposables for every lab workflow",
    image:
      "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&h=400&fit=crop&auto=format",
    count: "2,400+ Products",
    color: "from-blue-900 to-blue-700",
  },
  {
    title: "Reagents & Chemicals",
    description:
      "Premium grade reagents, buffers, culture media, and diagnostic kits",
    image:
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&h=400&fit=crop&auto=format",
    count: "1,800+ Products",
    color: "from-cyan-900 to-cyan-700",
  },
  {
    title: "Medical Equipment",
    description:
      "Centrifuges, microscopes, spectrophotometers, and analytical instruments",
    image:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=400&fit=crop&auto=format",
    count: "650+ Products",
    color: "from-indigo-900 to-indigo-700",
  },
  {
    title: "Rapid Diagnostics",
    description:
      "Lateral flow assays, point-of-care tests, and immunoassay platforms",
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop&auto=format",
    count: "320+ Products",
    color: "from-slate-800 to-slate-700",
  },
];

const FEATURED_PRODUCTS = [
  {
    name: "Eppendorf Safe-Lock Microtubes 1.5ml",
    sku: "SKU: EP-0030120086",
    price: "K 350",
    unit: "per 500",
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=300&h=300&fit=crop&auto=format",
    category: "Consumables",
  },
  {
    name: "Thermo Fisher DPBS Solution 500ml",
    sku: "SKU: TF-14190094",
    price: "K 520",
    unit: "per unit",
    badge: "In Stock",
    image:
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=300&h=300&fit=crop&auto=format",
    category: "Reagents",
  },
  {
    name: "Malaria Rapid Test — Pf/PAN",
    sku: "SKU: CE-MAL-25",
    price: "K 1,050",
    unit: "per 25 tests",
    badge: "In Stock",
    image:
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300&h=300&fit=crop&auto=format",
    category: "Diagnostics",
  },
  {
    name: "Bio-Rad Mini-PROTEAN Tetra System",
    sku: "SKU: BR-1658000",
    price: "K 34,500",
    unit: "per system",
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=300&h=300&fit=crop&auto=format",
    category: "Equipment",
  },
  {
    name: "Universal Transport Medium 3ml",
    sku: "SKU: UTM-3ML-50",
    price: "K 1,160",
    unit: "per 50 tubes",
    badge: "In Stock",
    image:
      "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=300&h=300&fit=crop&auto=format",
    category: "Consumables",
  },
  {
    name: "Haemoglobin Rapid Test HemoCue",
    sku: "SKU: HC-300-PLUS",
    price: "K 7,950",
    unit: "per analyser",
    badge: "In Stock",
    image:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=300&h=300&fit=crop&auto=format",
    category: "Equipment",
  },
];

const WHY_CHOOSE = [
  {
    icon: Shield,
    title: "Quality Assured",
    body: "All products are ISO-certified and sourced directly from accredited manufacturers to meet the highest standards.",
  },
  {
    icon: Truck,
    title: "Fast Zambia-Wide Delivery",
    body: "Reliable and timely delivery across Zambia — from Lusaka to Ndola, Kitwe and beyond.",
  },
  {
    icon: Award,
    title: "Trusted Zambian Clients",
    body: "Supplying leading Zambian hospitals, clinics, pharmacies and schools since our incorporation in 2021.",
  },
  {
    icon: Clock,
    title: "Expert Support",
    body: "Our dedicated team provides pre- and post-sale technical guidance and after-sales support Monday–Friday.",
  },
];

const BRANDS = [
  "Thermo Fisher Scientific",
  "Eppendorf",
  "Bio-Rad",
  "Merck",
  "Sartorius",
  "Qiagen",
  "Roche",
  "Beckman Coulter",
];

const TESTIMONIALS = [
  {
    name: "Fairview Hospital",
    role: "Procurement — Lusaka, Zambia",
    text: "Chamrud Enterprise consistently delivers quality reagents on time. Their dedicated service and attention to our supply needs makes them our preferred supplier.",
    rating: 5,
  },
  {
    name: "Kanyama General Hospital",
    role: "Medical Supplies — Lusaka, Zambia",
    text: "We have been sourcing medical consumables and diagnostic kits from Chamrud for several years. Competitive pricing and a reliable supply chain every time.",
    rating: 5,
  },
  {
    name: "Royal Hospital",
    role: "Laboratory Department — Lusaka, Zambia",
    text: "The breadth of their catalogue is excellent. From basic lab supplies to pharmaceuticals — Chamrud Enterprise is our single-source supplier of choice in Zambia.",
    rating: 5,
  },
];

const BADGE_COLORS: Record<string, string> = {
  "Best Seller": "bg-amber-100 text-amber-800 border-amber-200",
  "In Stock": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "CE Marked": "bg-blue-100 text-blue-800 border-blue-200",
  New: "bg-violet-100 text-violet-800 border-violet-200",
};

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openNav, setOpenNav] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [products, setProducts] = useState<Product[]>(FEATURED_PRODUCTS as any);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!isAdminOpen) {
      fetchProducts().then(fetched => {
        if (fetched.length > 0) setProducts(fetched);
      });
      fetchPosts().then(fetched => {
        setPosts(fetched);
      });
    }
  }, [isAdminOpen]);

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:3001/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setContactForm({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSubmitSuccess(false), 6000);
      } else {
        alert(data.error || "Failed to send message. Please try again.");
      }
    } catch {
      alert("Could not reach the server. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  }

  function updateQuantity(productId: string, delta: number) {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  }

  const handleRequestQuotation = () => {
    if (cart.length === 0) return;
    const parsePrice = (priceStr: string) => {
      const clean = priceStr.replace(/,/g, "").replace(/[^\d.]/g, "");
      return parseFloat(clean) || 0;
    };
    const total = cart.reduce((acc, item) => acc + parsePrice(item.product.price) * item.quantity, 0);
    const getAbsoluteImageUrl = (imgUrl: string) => {
      if (!imgUrl) return "";
      if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) {
        if (imgUrl.includes("localhost")) {
          return imgUrl.replace("localhost", window.location.hostname);
        }
        return imgUrl;
      }
      return `${window.location.protocol}//${window.location.hostname}:3001${imgUrl.startsWith("/") ? "" : "/"}${imgUrl}`;
    };
    const itemsList = cart.map(item => {
      const imgUrl = getAbsoluteImageUrl(item.product.image);
      const imgLine = imgUrl ? `%0A  Image: ${imgUrl}` : "";
      return `▪ ${item.product.name}%0A  SKU: ${item.product.sku}%0A  Price: ${item.product.price} ${item.product.unit}%0A  Qty: ${item.quantity}%0A  Subtotal: K ${(parsePrice(item.product.price) * item.quantity).toLocaleString()}${imgLine}`;
    }).join('%0A%0A');
    const message =
      `Hello Chamrud Enterprise! 👋%0A%0AI would like to request a quotation for the following items:%0A%0A${itemsList}%0A%0A─────────────────%0A*ESTIMATED TOTAL: K ${total.toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}*%0A─────────────────%0A%0APlease send me a formal quotation. Thank you!`;
    window.open(`https://wa.me/260772071404?text=${message}`, '_blank');
  };

  const handleNavClick = (label: string, parentLabel?: string) => {
    if (parentLabel === "Brands" || label === "Brands") {
      if (parentLabel === "Brands") {
        setSearchQuery(label);
      } else {
        setSearchQuery("");
      }
      setActiveCategory("All");
      return;
    }
    const categoryTarget = parentLabel || label;
    const categoryMap: Record<string, string> = {
      "Lab Consumables": "Consumables",
      "Reagents & Chemicals": "Reagents",
      "Medical Equipment": "Equipment",
      "Rapid Diagnostics": "Diagnostics"
    };
    const mapped = categoryMap[categoryTarget];
    if (mapped) {
      setActiveCategory(mapped);
      setSearchQuery("");
    }
    setMobileOpen(false);
  };

  const categories = ["All", "Consumables", "Reagents", "Equipment", "Diagnostics"];
  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Top utility bar */}
      <div className="bg-[#003399] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9">
          <div className="flex items-center gap-6">
            <a
              href="tel:+260772071404"
              className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity"
            >
              <Phone className="w-3 h-3" />
              +260 772 071 404
            </a>
            <a
              href="mailto:sales.chamrud@gmail.com"
              className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity"
            >
              <Mail className="w-3 h-3" />
              sales.chamrud@gmail.com
            </a>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className="opacity-60">Mon–Fri 08:00–17:00 CAT</span>
            <span className="opacity-30">|</span>
            <a href="#contact" className="opacity-80 hover:opacity-100 transition-opacity">
              Request a Quote
            </a>
            <span className="opacity-30">|</span>
            <a href="#about" className="opacity-80 hover:opacity-100 transition-opacity">
              About Us
            </a>
            <span className="opacity-30">|</span>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="opacity-80 hover:opacity-100 transition-opacity flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              Admin Portal
            </button>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 h-16">
            {/* Logo */}
            <a href="#home" className="flex-shrink-0 flex items-center gap-3 no-underline">
              <img src="http://localhost:3001/uploads/chamrud_logo.png" alt="Chamrud Logo" className="w-10 h-10 rounded-lg object-contain shadow-sm bg-white p-0.5" />
              <div>
                <div
                  className="text-[#003399] font-bold text-base leading-tight tracking-tight"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Chamrud
                </div>
                <div className="text-[#149CD8] text-[10px] tracking-widest uppercase leading-tight">
                  Enterprise
                </div>
              </div>
            </a>

            {/* Search bar */}
            <div className="flex-1 max-w-xl hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products, brands, catalogue numbers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#149CD8]/30 focus:border-[#149CD8] transition-all"
                />
              </div>
            </div>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-3">
              <a href="#contact" className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-[#FF9933] transition-colors">
                <User className="w-4 h-4" />
                <span>Contact Us</span>
              </a>
              <button onClick={() => setIsCartOpen(true)} className="relative flex items-center gap-2 bg-[#FF9933] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#e88820] transition-colors cursor-pointer">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden md:inline">Basket</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation bar */}
        <div className="hidden md:block border-t border-border bg-[#003399]">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => setOpenNav(item.label)}
                  onMouseLeave={() => setOpenNav(null)}
                >
                  <a
                    href={item.href}
                    onClick={() => handleNavClick(item.label)}
                    className="flex items-center gap-1.5 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors font-medium"
                  >
                    {item.label}
                    {item.children.length > 0 && (
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    )}
                  </a>
                  {item.children.length > 0 && openNav === item.label && (
                    <div className="absolute top-full left-0 bg-white border border-border shadow-xl rounded-b-xl rounded-tr-xl z-50 min-w-56 py-2">
                      {item.children.map((child) => (
                        <a
                          key={child.label}
                          href={child.href}
                          onClick={() => handleNavClick(child.label, item.label)}
                          className="flex items-center justify-between px-4 py-2.5 text-sm text-foreground hover:bg-secondary hover:text-[#FF9933] transition-colors group/item"
                        >
                          {child.label}
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover/item:opacity-60 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-border">
            <div className="px-4 py-3">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none"
                />
              </div>
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block py-2.5 border-b border-border text-sm font-medium text-foreground hover:text-[#FF9933] transition-colors"
                  onClick={() => handleNavClick(item.label)}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero section */}
      <section id="home" className="relative bg-[#003399] overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1400&h=600&fit=crop&auto=format)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#003399] via-[#003399]/90 to-[#003399]/60" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-xs text-white/80 mb-6 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 bg-[#FF9933] rounded-full animate-pulse" />
              Trusted Medical Supplier — Lusaka, Zambia
            </div>
            <h1
              className="text-4xl md:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Your Complete
              <br />
              <span className="text-[#FF9933]">Medical Lab</span>
              <br />
              Supply Partner
            </h1>
            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              Supplying hospitals, clinics, research institutes and laboratories
              across Zambia with quality laboratory reagents, pharmaceuticals,
              and medical supplies.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#products" className="flex items-center gap-2 bg-[#FF9933] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e88820] transition-colors text-sm">
                Browse Catalogue
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#contact" className="flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors text-sm backdrop-blur-sm">
                Request a Quote
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-6">
              {[
                { label: "Products", value: "4,500+" },
                { label: "Brands", value: "120+" },
                { label: "Zambian Clients", value: "100+" },
                { label: "Years Active", value: "3+" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-white/50 text-xs uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certification strip */}
      <div className="bg-[#149CD8] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
            {[
              "ISO 9001:2015 Certified",
              "Wholly Zambian Company",
              "Incorporated October 2021",
              "PACRA Registered",
              "SOPs & CoA Available",
            ].map((cert) => (
              <div
                key={cert}
                className="flex items-center gap-2 text-white/90 text-xs whitespace-nowrap"
              >
                <CheckCircle className="w-3.5 h-3.5 text-white flex-shrink-0" />
                {cert}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product categories */}
      <section id="products" className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#FF9933] font-semibold mb-2">
              Product Categories
            </div>
            <h2
              className="text-2xl md:text-3xl font-bold text-foreground"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Everything your laboratory needs
            </h2>
          </div>
          <a
            href="#products"
            onClick={() => {
              setActiveCategory("All");
              setSearchQuery("");
            }}
            className="hidden md:flex items-center gap-1.5 text-sm text-[#149CD8] font-medium hover:gap-2.5 transition-all"
          >
            View all categories
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRODUCT_CATEGORIES.map((cat) => (
            <div
              key={cat.title}
              onClick={() => {
                const categoryMap: Record<string, string> = {
                  "Laboratory Consumables": "Consumables",
                  "Reagents & Chemicals": "Reagents",
                  "Medical Equipment": "Equipment",
                  "Rapid Diagnostics": "Diagnostics"
                };
                const mapped = categoryMap[cat.title];
                if (mapped) {
                  setActiveCategory(mapped);
                  setSearchQuery("");
                  const el = document.getElementById("products");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="group relative rounded-xl overflow-hidden cursor-pointer bg-card border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-44 overflow-hidden bg-slate-200">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-60 group-hover:opacity-70 transition-opacity`}
                />
              </div>
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#003399] text-[10px] font-bold px-2.5 py-1 rounded-full">
                {cat.count}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#001530] to-transparent">
                <h3
                  className="text-white font-bold text-base leading-tight mb-1"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {cat.title}
                </h3>
                <p className="text-white/70 text-xs leading-relaxed hidden group-hover:block transition-all">
                  {cat.description}
                </p>
              </div>
              <div className="absolute bottom-4 right-4 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section id="featured" className="bg-[#f0f6fb] py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-[#FF9933] font-semibold mb-2">
                Featured Products
              </div>
              <h2
                className="text-2xl md:text-3xl font-bold text-foreground"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Popular this month
              </h2>
            </div>
            <a
              href="#products"
              className="hidden md:flex items-center gap-1.5 text-sm text-[#149CD8] font-medium hover:gap-2.5 transition-all"
            >
              View all products
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 mb-7 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-[#FF9933] text-white"
                    : "bg-white text-muted-foreground border border-border hover:border-[#FF9933] hover:text-[#FF9933]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((product) => (
              <div
                key={product.sku}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="h-44 bg-slate-100 overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className={`absolute top-3 left-3 text-[10px] font-semibold border px-2 py-0.5 rounded-full ${BADGE_COLORS[product.badge]}`}
                  >
                    {product.badge}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-[10px] text-muted-foreground font-mono mb-1 tracking-wider">
                    {product.sku}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 leading-snug">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div
                        className="text-lg font-bold text-[#003399]"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {product.price}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {product.unit}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-xs border border-border px-3 py-1.5 rounded-lg hover:border-[#149CD8] hover:text-[#149CD8] transition-colors font-medium">
                        Details
                      </button>
                      <button onClick={() => addToCart(product as any)} className="text-xs bg-[#FF9933] text-white px-3 py-1.5 rounded-lg hover:bg-[#e88820] transition-colors font-medium flex items-center gap-1 cursor-pointer">
                        <ShoppingCart className="w-3 h-3" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section id="about" className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-widest text-[#FF9933] font-semibold mb-2">
            Why Chamrud Enterprise
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold text-foreground"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            The laboratory supply partner you can rely on
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_CHOOSE.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-md hover:border-[#FF9933]/30 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-[#FF9933]/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#FF9933]" />
                </div>
                <h3
                  className="font-bold text-foreground mb-2 text-base"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Latest News & Announcements */}
      {posts.length > 0 && (
        <section id="updates" className="max-w-7xl mx-auto px-4 py-14 border-t border-border">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs uppercase tracking-widest text-[#FF9933] font-semibold mb-2">
                Latest Updates
              </div>
              <h2
                className="text-2xl md:text-3xl font-bold text-foreground"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                News & Announcements
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-250 flex flex-col"
              >
                {post.imageUrl && (
                  <div className="h-48 overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-semibold border px-2.5 py-0.5 rounded-full ${
                      post.category === 'Offer' ? 'bg-[#FF9933]/15 text-[#FF9933] border-[#FF9933]/30' :
                      post.category === 'Announcement' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                      post.category === 'News' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                      'bg-[#149CD8]/15 text-[#149CD8] border-[#149CD8]/30'
                    }`}>
                      {post.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString("en-ZM", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-foreground mb-2 leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1 line-clamp-4">
                    {post.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Brands strip */}
      <section id="brands" className="bg-[#f0f6fb] border-y border-border py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Authorised Distributor For
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {BRANDS.map((brand) => (
              <div
                key={brand}
                className="bg-card border border-border rounded-lg px-3 py-4 flex items-center justify-center text-center hover:border-[#FF9933]/40 hover:shadow-sm transition-all cursor-pointer"
              >
                <span className="text-[11px] font-semibold text-muted-foreground hover:text-[#FF9933] transition-colors leading-tight">
                  {brand}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-widest text-[#FF9933] font-semibold mb-2">
            Client Testimonials
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold text-foreground"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Trusted by healthcare professionals
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-5 italic">
                "{t.text}"
              </p>
              <div className="border-t border-border pt-4">
                <div className="font-semibold text-sm text-foreground">
                  {t.name}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {t.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#FF9933] py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Ready to place an order?
          </div>
          <p className="text-white/80 text-base mb-8 max-w-xl mx-auto">
            Get competitive pricing on all laboratory reagents, pharmaceuticals,
            and medical supplies across Zambia.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#contact" className="flex items-center gap-2 bg-white text-[#FF9933] px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors text-sm">
              Get a Quote
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="tel:+260772071404" className="flex items-center gap-2 border border-white/50 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors text-sm">
              <Phone className="w-4 h-4" />
              Call Us Now
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-[#003399] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-[#FF9933] font-semibold mb-2">Get In Touch</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Contact Chamrud Enterprise
            </h2>
            <p className="text-white/60 mt-2 text-sm">We supply hospitals, clinics and labs across Zambia</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="tel:+260772071404" className="bg-white/10 border border-white/20 rounded-xl p-6 flex flex-col items-center text-center hover:bg-white/20 transition-all group">
              <div className="w-12 h-12 rounded-full bg-[#FF9933] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="text-white/60 text-xs uppercase tracking-widest mb-1">Phone</div>
              <div className="text-white font-semibold text-sm">+260 772 071 404</div>
              <div className="text-white/60 text-sm mt-1">+260 966 669 767</div>
            </a>
            <a href="mailto:sales.chamrud@gmail.com" className="bg-white/10 border border-white/20 rounded-xl p-6 flex flex-col items-center text-center hover:bg-white/20 transition-all group">
              <div className="w-12 h-12 rounded-full bg-[#149CD8] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="text-white/60 text-xs uppercase tracking-widest mb-1">Email</div>
              <div className="text-white font-semibold text-sm">sales.chamrud@gmail.com</div>
            </a>
            <div className="bg-white/10 border border-white/20 rounded-xl p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="text-white/60 text-xs uppercase tracking-widest mb-1">Address</div>
              <div className="text-white font-semibold text-sm">15 Enock Kavu Road</div>
              <div className="text-white/70 text-sm">Rhodes Park, Lusaka</div>
              <div className="text-[#FF9933] font-semibold text-sm mt-1">Zambia</div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10 max-w-3xl mx-auto backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-6 text-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Send Us a Message
            </h3>
            {submitSuccess && (
              <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm text-center flex items-center justify-center gap-2 animate-in fade-in duration-300">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Thank you! Your email client has been opened to send the message.</span>
              </div>
            )}
            <form onSubmit={handleContactSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase mb-2">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FF9933] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FF9933] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase mb-2">Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="Inquiry about Reagents"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FF9933] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase mb-2">Message *</label>
                <textarea
                  rows={5}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us what you need..."
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FF9933] transition-colors resize-none"
                />
              </div>
              <div className="text-center pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FF9933] hover:bg-[#e88820] text-white px-8 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmitting ? "Opening Mail..." : "Send Message"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#001a33] text-white">
        <div className="max-w-7xl mx-auto px-4 pt-14 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="http://localhost:3001/uploads/chamrud_logo.png" alt="Chamrud Logo" className="w-10 h-10 rounded-lg object-contain shadow-sm bg-white p-0.5" />
                <div>
                  <div
                    className="text-white font-bold text-base leading-tight"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Chamrud Enterprise
                  </div>
                  <div className="text-[#149CD8] text-[10px] tracking-widest uppercase">
                    Medical &amp; Lab Supplies · Zambia
                  </div>
                </div>
              </div>
              <p className="text-white/50 text-sm leading-relaxed mb-4">
                A wholly Zambian company supplying laboratory reagents,
                pharmaceuticals and medical supplies since 2021.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#FF9933]" />
                  15 Enock Kavu Road, Rhodes Park, Lusaka, Zambia
                </div>
                <a href="tel:+260772071404" className="flex items-center gap-2 text-white/50 text-xs hover:text-white/80 transition-colors">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0 text-[#FF9933]" />
                  +260 772 071 404 / +260 966 669 767
                </a>
                <a href="mailto:sales.chamrud@gmail.com" className="flex items-center gap-2 text-white/50 text-xs hover:text-white/80 transition-colors">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0 text-[#FF9933]" />
                  sales.chamrud@gmail.com
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4
                className="font-bold text-sm mb-4 text-white/90"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Products
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Laboratory Consumables", href: "#products" },
                  { label: "Reagents & Chemicals", href: "#products" },
                  { label: "Medical Equipment", href: "#products" },
                  { label: "Rapid Diagnostics", href: "#products" },
                  { label: "Pharmaceuticals", href: "#products" },
                  { label: "Office & School Supplies", href: "#products" },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-white/50 text-sm hover:text-[#FF9933] transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4
                className="font-bold text-sm mb-4 text-white/90"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Company
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "About Chamrud", href: "#about" },
                  { label: "Our Brands", href: "#brands" },
                  { label: "Our Services", href: "#products" },
                  { label: "Contact Us", href: "#contact" },
                  { label: "Admin Portal", href: "", onClick: () => setIsAdminOpen(true) },
                ].map((item) => (
                  <li key={item.label}>
                    {item.onClick ? (
                      <button
                        onClick={item.onClick}
                        className="text-white/50 text-sm hover:text-[#149CD8] transition-colors cursor-pointer text-left"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <a
                        href={item.href}
                        className="text-white/50 text-sm hover:text-[#149CD8] transition-colors"
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4
                className="font-bold text-sm mb-4 text-white/90"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Stay Updated
              </h4>
              <p className="text-white/50 text-sm mb-4 leading-relaxed">
                Subscribe for new product announcements, regulatory updates, and
                exclusive offers.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FF9933]/50"
                />
                <button className="bg-[#FF9933] hover:bg-[#e88820] text-white px-3 py-2 rounded-lg transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-5">
                <div className="text-white/30 text-xs uppercase tracking-widest mb-3">
                  Registered In
                </div>
                <div className="flex flex-wrap gap-2">
                  {["PACRA", "Zambia", "Est. 2021", "Lusaka"].map((cert) => (
                    <span
                      key={cert}
                      className="bg-white/10 border border-white/10 text-white/60 text-[10px] px-2.5 py-1 rounded-full font-medium"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-white/30 text-xs">
              © 2026 Chamrud Enterprise. All rights reserved. · Lusaka, <span className="text-[#FF9933]">Zambia</span>
            </div>
            <div className="flex gap-5">
              {[
                { label: "About Us", href: "#about" },
                { label: "Products", href: "#products" },
                { label: "Brands", href: "#brands" },
                { label: "Contact", href: "#contact" },
              ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-white/30 text-xs hover:text-[#FF9933] transition-colors"
                  >
                    {link.label}
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </footer>
      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-border flex items-center justify-between bg-[#003399] text-white">
              <div className="font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Your Quotation Basket
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Your basket is empty.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="flex gap-3 bg-white p-3 rounded-xl border border-border shadow-sm">
                    <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg bg-slate-100" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground truncate">{item.product.sku}</div>
                      <div className="font-semibold text-sm leading-tight line-clamp-2 mb-1">{item.product.name}</div>
                      <div className="text-[#003399] font-bold text-sm">{item.product.price}</div>
                    </div>
                    <div className="flex flex-col items-center justify-between">
                      <button onClick={() => updateQuantity(item.product.id, 1)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                        <Plus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, -1)} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
                        <Minus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-border bg-white space-y-4">
              {cart.length > 0 && (
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-border">
                  <span className="text-xs font-semibold text-[#003399] uppercase tracking-wider">Estimated Total:</span>
                  <span className="text-lg font-bold text-[#003399]">
                    K {(() => {
                      const parsePrice = (priceStr: string) => {
                        const clean = priceStr.replace(/,/g, "").replace(/[^\d.]/g, "");
                        const parsed = parseFloat(clean);
                        return isNaN(parsed) ? 0 : parsed;
                      };
                      const total = cart.reduce((acc, item) => acc + (parsePrice(item.product.price) * item.quantity), 0);
                      return total.toLocaleString("en-ZM", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    })()}
                  </span>
                </div>
              )}
              <button
                onClick={handleRequestQuotation}
                disabled={cart.length === 0}
                className="w-full bg-[#FF9933] text-white py-3 rounded-xl font-bold hover:bg-[#e88820] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Request Quotation via WhatsApp
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-[10px] text-muted-foreground mt-3">
                No payment required now. Our sales team will respond with a formal quotation.
              </p>
            </div>
          </div>
        </div>
      )}

      {isAdminOpen && (
        <AdminPanel
          onClose={() => setIsAdminOpen(false)}
          onPostsChange={() => {}}
        />
      )}
    </div>
  );
}
