import { useState, useEffect } from "react";
import { fetchProducts, fetchPosts, fetchSettings, getImageUrl, Product, Post, SiteSettings, DEFAULT_SETTINGS } from "./data/api";
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
  ChevronLeft,
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
    label: "Diagnostic Products",
    href: "#products",
    category: "Diagnostics",
    children: [
      { label: "Rapid Tests & Devices", href: "#products", search: "Rapid Tests" },
      { label: "Blood Grouping Reagents", href: "#products", search: "Blood Grouping Reagents" },
      { label: "Infectious Disease Tests", href: "#products", search: "Infectious Diseases" },
      { label: "Drugs of Abuse Tests", href: "#products", search: "Drugs of Abuse" },
      { label: "Urinalysis Strips", href: "#products", search: "Urinalysis Strips" },
      { label: "COVID & Respiratory", href: "#products", search: "Respiratory" },
    ],
  },
  {
    label: "Vials & Bottles",
    href: "#products",
    category: "Lab Consumables",
    children: [
      { label: "5ml Bottles", href: "#products", search: "5ml Bottles" },
      { label: "10ml Bottles", href: "#products", search: "10ml Bottles" },
      { label: "20ml Bottles", href: "#products", search: "20ml Bottles" },
      { label: "30ml Bottles", href: "#products", search: "30ml Bottles" },
      { label: "50ml Bottles", href: "#products", search: "50ml Bottles" },
      { label: "100ml Bottles", href: "#products", search: "100ml Bottles" },
    ],
  },
  {
    label: "Caps & Closures",
    href: "#products",
    category: "Lab Consumables",
    children: [
      { label: "Aluminium Caps", href: "#products", search: "Aluminium Caps" },
      { label: "Atomisers & Spray Caps", href: "#products", search: "Atomisers" },
      { label: "Dropper Pipette Assemblies", href: "#products", search: "Dropper Pipette" },
      { label: "Bamboo Range", href: "#products", search: "Bamboo" },
      { label: "Pots & Jars", href: "#products", search: "Jar" },
      { label: "Special Offers", href: "#products", search: "Special Offers" },
    ],
  },
  {
    label: "Readers & Equipment",
    href: "#products",
    category: "Equipment",
    children: [
      { label: "Readers", href: "#products", search: "Reader" },
      { label: "Fluorescence Analyzers", href: "#products", search: "Fluorescence" },
      { label: "Biochemical Meters", href: "#products", search: "Biochemical Meters" },
      { label: "PCR", href: "#products", search: "PCR" },
    ],
  },
  {
    label: "Reagents",
    href: "#products",
    category: "Reagents",
    children: [
      { label: "Blood Grouping Reagents", href: "#products", category: "Diagnostics", search: "Blood Grouping Reagents" },
      { label: "Latex Agglutination", href: "#products", category: "Diagnostics", search: "Latex Agglutination" },
      { label: "Febrile Antigens", href: "#products", category: "Diagnostics", search: "Febrile Antigens" },
      { label: "Control Materials", href: "#products", category: "All", search: "Controls" },
      { label: "Microbiology Reagents", href: "#products", search: "Microbiology" },
    ],
  },
  { label: "Brands", href: "#brands", children: [] },
  { label: "About Us", href: "#about", children: [] },
  { label: "Contact", href: "#contact", children: [] },
];

const PRODUCT_CATEGORIES = [
  {
    title: "Diagnostic Products",
    description:
      "Blood grouping, serology, rapid tests, urinalysis, infectious disease, DOA and point-of-care diagnostics",
    image: "/uploads/cat_diagnostic.png",
    count: "800+ Products",
    color: "from-blue-900 to-blue-700",
    category: "Diagnostics",
    search: "",
  },
  {
    title: "Glass & Plastic Vials",
    description:
      "Amber, blue, clear, green and matte glass bottles, Boston bottles, jars, vials and containers",
    image: "/uploads/cat_vials.png",
    count: "900+ Products",
    color: "from-cyan-900 to-cyan-700",
    category: "Lab Consumables",
    search: "Bottles",
  },
  {
    title: "Caps, Closures & Pipettes",
    description:
      "Aluminium caps, atomisers, spray caps, dropper pipette assemblies and closure systems",
    image: "/uploads/cat_caps.png",
    count: "300+ Products",
    color: "from-indigo-900 to-indigo-700",
    category: "Lab Consumables",
    search: "Caps",
  },
  {
    title: "Readers & Equipment",
    description:
      "Readers, analysers, accessories, and supporting instruments for diagnostic workflows",
    image: "/uploads/cat_readers.png",
    count: "40+ Products",
    color: "from-sky-900 to-sky-700",
    category: "Equipment",
    search: "",
  },
  {
    title: "Reagents & Controls",
    description:
      "Blood grouping reagents, latex agglutination, febrile antigens, controls and retained Chamrud microbiology reagents",
    image: "/uploads/cat_reagents.png",
    count: "65+ Products",
    color: "from-slate-800 to-slate-700",
    category: "Reagents",
    search: "",
  },
];

const HOME_STREAMS = [
  {
    title: "Diagnostic Products",
    description:
      "Rapid test devices, strips, cassettes, urinalysis, serology and point-of-care screening products for clinical laboratories.",
    links: ["Blood Grouping Reagents", "Rapid Tests & Devices", "Drugs of Abuse Tests", "Urinalysis Strips"],
    category: "Diagnostics",
    image: "/uploads/cat_diagnostic.png",
  },
  {
    title: "Vials, Bottles & Closures",
    description:
      "Glass and plastic packaging ranges organised by bottle size, colour, cap type, closure and pipette assembly.",
    links: ["5ml Bottles", "30ml Bottles", "Aluminium Caps", "Dropper Pipettes"],
    category: "Lab Consumables",
    image: "/uploads/cat_vials.png",
  },
  {
    title: "Readers, Reagents & Controls",
    description:
      "Readers, fluorescence accessories, blood grouping reagents, control materials and retained Chamrud laboratory reagents.",
    links: ["Readers", "Fluorescence", "Latex Agglutination", "Febrile Antigens"],
    category: "Equipment",
    image: "/uploads/cat_readers.png",
  },
];

const CATALOG_DEPARTMENTS = [
  {
    title: "Diagnostic Products",
    category: "Diagnostics",
    links: ["Blood Grouping Reagents", "Rapid Tests & Devices", "Infectious Diseases Rapid Strips & Devices", "Drugs of Abuse Rapid Tests", "Urinalysis Strips"],
  },
  {
    title: "Vials & Bottles",
    category: "Lab Consumables",
    links: ["5ml Bottles", "10ml Bottles", "20ml Bottles", "30ml Bottles", "50ml Bottles", "100ml Bottles"],
  },
  {
    title: "Caps & Closures",
    category: "Lab Consumables",
    links: ["Aluminium Caps", "Caps and Closures", "Atomisers & Spray Caps", "Dropper Pipette Assemblies", "Bamboo Range"],
  },
  {
    title: "Readers & Reagents",
    category: "Equipment",
    links: ["Readers", "Fluorescence", "Biochemical Meters", "Control Materials", "Microbiology Reagents"],
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

const BADGE_COLORS: Record<string, string> = {
  "Best Seller": "bg-amber-100 text-amber-800 border-amber-200",
  "In Stock": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "CE Marked": "bg-blue-100 text-blue-800 border-blue-200",
  "Rapid Labs": "bg-sky-100 text-sky-800 border-sky-200",
  New: "bg-violet-100 text-violet-800 border-violet-200",
};

const getBrandLogo = (brandName: string) => {
  const name = brandName.toLowerCase();
  if (name.includes("thermo")) {
    return <img src="/brands/thermo_fisher.svg" alt={brandName} className="h-7 w-auto object-contain max-w-[120px]" />;
  }
  if (name.includes("eppendorf")) {
    return <img src="/brands/eppendorf.svg" alt={brandName} className="h-7 w-auto object-contain max-w-[100px]" />;
  }
  if (name.includes("bio-rad") || name.includes("biorad")) {
    return <img src="/brands/bio_rad.svg" alt={brandName} className="h-7 w-auto object-contain max-w-[100px]" />;
  }
  if (name.includes("rapid")) {
    return <img src="/brands/rapid_labs.png" alt={brandName} className="h-8 w-auto object-contain max-w-[100px]" />;
  }
  if (name.includes("accurate")) {
    return <img src="/brands/accurate.gif" alt={brandName} className="h-9 w-auto object-contain max-w-[100px] mix-blend-multiply" />;
  }
  if (name.includes("viva")) {
    return <img src="/brands/viva_test.png" alt={brandName} className="h-8 w-auto object-contain max-w-[100px] mix-blend-multiply" />;
  }
  if (name.includes("beckman") || name.includes("coulter")) {
    return <img src="/brands/beckman_coulter.svg" alt={brandName} className="h-7 w-auto object-contain max-w-[120px]" />;
  }
  return (
    <svg className="w-8 h-8 text-[#FF9933]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12M18 3v3a4 4 0 0 1-1.3 3L11 15v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-5l-5.7-6A4 4 0 0 1 5 6V3h1z" />
    </svg>
  );
};

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openNav, setOpenNav] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentView, setCurrentView] = useState<"home" | "reagents-list" | "category" | "diagnostics" | "vials" | "closures" | "equipment">("home");
  const [subCategoryFilter, setSubCategoryFilter] = useState("All");
  const [reagentsSearch, setReagentsSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "sku-asc">("name-asc");
  const itemsPerPage = 24;

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetchSettings().then(s => setSiteSettings(s));
  }, []);

  useEffect(() => {
    if (!isAdminOpen) {
      fetchProducts().then(fetched => {
        if (fetched.length > 0) setProducts(fetched);
      });
      fetchPosts().then(fetched => {
        setPosts(fetched);
      });
      // Refresh settings when admin closes (they may have saved changes)
      fetchSettings().then(s => setSiteSettings(s));
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
      // 1. Submit to Web3Forms
      const web3FormsRes = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          access_key: "52da7e8b-2570-4bf9-8004-2f642b31819e",
          name: contactForm.name,
          email: contactForm.email,
          subject: contactForm.subject || `New Inquiry from ${contactForm.name}`,
          message: contactForm.message,
        })
      });
      const web3Data = await web3FormsRes.json();

      // 2. Submit to local backend to save in database
      try {
        await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactForm),
        });
      } catch (err) {
        console.warn("Could not save copy to local database:", err);
      }

      if (web3Data.success) {
        setSubmitSuccess(true);
        setContactForm({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSubmitSuccess(false), 6000);
      } else {
        alert(web3Data.message || "Failed to send message via Web3Forms. Please try again.");
      }
    } catch {
      alert("Failed to send message. Please check your internet connection.");
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
    const getAbsoluteImageUrl = (imgUrl: string) => {
      const normalized = getImageUrl(imgUrl);
      if (!normalized) return "";
      if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
        return normalized;
      }
      return `${window.location.origin}${normalized.startsWith("/") ? "" : "/"}${normalized}`;
    };
    const itemsList = cart.map(item => {
      const imgUrl = getAbsoluteImageUrl(item.product.image);
      const imgLine = imgUrl ? `%0A  Image: ${imgUrl}` : "";
      return `▪ ${item.product.name}%0A  SKU: ${item.product.sku}%0A  Unit: ${item.product.unit}%0A  Qty: ${item.quantity}${imgLine}`;
    }).join('%0A%0A');
    const message =
      `Hello Chamrud Enterprise! 👋%0A%0AI would like to request a quotation for the following items:%0A%0A${itemsList}%0A%0APlease send me a formal quotation. Thank you!`;
    window.open(`https://wa.me/${siteSettings.company.whatsapp}?text=${message}`, '_blank');
  };

  const navigateToCategoryPage = (category: string, subCategory: string = "All", initialSearch: string = "") => {
    const cat = category.toLowerCase();
    
    setSearchQuery(initialSearch);
    setSubCategoryFilter(subCategory);
    setCurrentPage(1);

    if (category === "All") {
      setCurrentView("category");
      setActiveCategory("All");
    } else if (cat.includes("diag") || cat === "diagnostics") {
      setCurrentView("diagnostics");
      setActiveCategory("Diagnostics");
    } else if (cat.includes("vial") || cat === "glass & plastic vials") {
      setCurrentView("vials");
      setActiveCategory("Lab Consumables");
    } else if (cat.includes("cap") || cat === "caps, closures & pipettes") {
      setCurrentView("closures");
      setActiveCategory("Lab Consumables");
    } else if (cat.includes("equip") || cat === "readers & equipment") {
      setCurrentView("equipment");
      setActiveCategory("Equipment");
    } else if (cat.includes("reagent") || cat === "reagents & controls" || cat === "reagents") {
      setCurrentView("reagents-list");
      setActiveCategory("Reagents");
    } else {
      setCurrentView("category");
      setActiveCategory(category);
    }
    
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavClick = (item: any, parentItem?: any) => {
    const label = typeof item === "string" ? item : item.label;
    if (label === "Reagents List" || label === "Reagents") {
      navigateToCategoryPage("Reagents");
      return;
    }

    if (label === "Brands") {
      setCurrentView("home");
      setMobileOpen(false);
      setSearchQuery("");
      setActiveCategory("All");
      setTimeout(() => {
        const el = document.getElementById("brands");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return;
    }

    if (label === "About Us") {
      setCurrentView("home");
      setMobileOpen(false);
      setTimeout(() => {
        const el = document.getElementById("about");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return;
    }

    if (label === "Contact") {
      setCurrentView("home");
      setMobileOpen(false);
      setTimeout(() => {
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return;
    }

    const categoryTarget = item.category || parentItem?.category || label;
    let targetCat = categoryTarget;
    
    if (label === "Vials & Bottles") {
      targetCat = "vials";
    } else if (label === "Caps & Closures") {
      targetCat = "closures";
    } else if (parentItem?.label === "Vials & Bottles") {
      targetCat = "vials";
    } else if (parentItem?.label === "Caps & Closures") {
      targetCat = "closures";
    }

    const subFilter = parentItem ? label : "All";
    navigateToCategoryPage(targetCat, subFilter, item.search || "");
  };

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category))).sort()];
  const filtered = products.filter((p) => {
    if (p.hidden) return false;

    // Filter by view-specific categories and rules
    if (currentView === "diagnostics") {
      if (p.category !== "Diagnostics") return false;
      if (subCategoryFilter !== "All") {
        const sf = subCategoryFilter.toLowerCase();
        if (sf.includes("rapid")) {
          if (!/rapid|device|cassette|panel|card|strip/i.test(p.name)) return false;
        } else if (sf.includes("blood grouping")) {
          if (!/blood grouping|grouping|anti-a|anti-b|anti-d|cell|screen panel/i.test(p.name)) return false;
        } else if (sf.includes("infectious")) {
          if (!/infectious|malaria|syphilis|hiv|hcv|hbsag|dengue|typhoid|chlamydia|strep|influenza|h\. pylori|hpylori|hp/i.test(p.name)) return false;
        } else if (sf.includes("abuse")) {
          if (!/drug|abuse|doa|mam|morphine|thc|amp|mop|bar|bzo|coc|met|mdma|opiate|panel|cup|saliva|urine/i.test(p.name)) return false;
        } else if (sf.includes("urinalysis")) {
          if (!/urinalysis|urine strip|parameter|combina/i.test(p.name)) return false;
        } else if (sf.includes("covid") || sf.includes("respiratory")) {
          if (!/covid|sars|cov|respiratory|influenza|flu/i.test(p.name)) return false;
        }
      }
    } else if (currentView === "vials") {
      if (p.category !== "Lab Consumables") return false;
      if (/cap|closure|atomiser|spray|pipette|dropper|pump|insert|bamboo|rack/i.test(p.name)) return false;
      if (subCategoryFilter !== "All") {
        if (subCategoryFilter.includes("5ml")) {
          if (!/5ml/i.test(p.name)) return false;
        } else if (subCategoryFilter.includes("10ml")) {
          if (!/10ml|15ml/i.test(p.name)) return false;
        } else if (subCategoryFilter.includes("20ml")) {
          if (!/20ml|25ml/i.test(p.name)) return false;
        } else if (subCategoryFilter.includes("30ml")) {
          if (!/30ml/i.test(p.name)) return false;
        } else if (subCategoryFilter.includes("50ml")) {
          if (!/50ml/i.test(p.name)) return false;
        } else if (subCategoryFilter.includes("100ml")) {
          if (!/100ml/i.test(p.name)) return false;
        } else if (subCategoryFilter.includes("Other")) {
          if (/5ml|10ml|15ml|20ml|25ml|30ml|50ml|100ml/i.test(p.name)) return false;
        }
      }
    } else if (currentView === "closures") {
      if (p.category !== "Lab Consumables") return false;
      if (!/cap|closure|atomiser|spray|pipette|dropper|pump|insert|bamboo|rack/i.test(p.name)) return false;
      if (subCategoryFilter !== "All") {
        if (subCategoryFilter.includes("Aluminium")) {
          if (!/aluminium/i.test(p.name)) return false;
        } else if (subCategoryFilter.includes("Atomiser")) {
          if (!/atomiser|spray/i.test(p.name)) return false;
        } else if (subCategoryFilter.includes("Dropper")) {
          if (!/dropper|pipette/i.test(p.name)) return false;
        } else if (subCategoryFilter.includes("Bamboo")) {
          if (!/bamboo/i.test(p.name)) return false;
        } else if (subCategoryFilter.includes("Pot") || subCategoryFilter.includes("Jar")) {
          if (!/pot|jar/i.test(p.name)) return false;
        }
      }
    } else if (currentView === "equipment") {
      if (p.category !== "Equipment") return false;
      if (subCategoryFilter !== "All") {
        if (subCategoryFilter.includes("Reader")) {
          if (!/reader|analyzer/i.test(p.name)) return false;
        } else if (subCategoryFilter.includes("Biochemical")) {
          if (!/meter|biochemical/i.test(p.name)) return false;
        } else if (subCategoryFilter.includes("PCR")) {
          if (!/pcr|accessory/i.test(p.name)) return false;
        }
      }
    } else {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      if (!matchesCategory) return false;
    }

    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sourceCategory || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name-asc") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "name-desc") {
      return b.name.localeCompare(a.name);
    } else if (sortBy === "sku-asc") {
      return a.sku.localeCompare(b.sku);
    }
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginatedProducts = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const subCategories = activeCategory === "All"
    ? []
    : Array.from(
        new Set(
          products
            .filter((p) => !p.hidden && p.category === activeCategory && p.sourceCategory)
            .map((p) => p.sourceCategory!)
        )
      ).sort();

  const filteredReagents = products.filter((p) => {
    if (p.hidden) return false;
    const isReagent = p.category === "Reagents" || p.category === "Microbiology Reagents";
    if (!isReagent) return false;
    const matchesSearch =
      p.name.toLowerCase().includes(reagentsSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(reagentsSearch.toLowerCase());
    return matchesSearch;
  });

  const streamProducts = (category: string) =>
    products
      .filter((product) => !product.hidden && product.category === category)
      .slice(0, 3);

  const categoryForLink = (defaultCategory: string, link: string) => {
    if (/hematology|haematology|minclean|minilyse|minidil/i.test(link)) return "Hematology";
    if (/c200/i.test(link)) return "Reagents";
    if (/microbiology/i.test(link)) return "Microbiology Reagents";
    if (/control/i.test(link)) return "All";
    if (/latex|febrile|blood grouping/i.test(link)) return "Diagnostics";
    if (/reader|meter|fluorescence/i.test(link)) return "Equipment";
    return defaultCategory;
  };

  const getCategoryInfo = (catName: string) => {
    const cats = siteSettings.categories || PRODUCT_CATEGORIES;
    const found = cats.find(c => c.category === catName);
    if (found) return found;
    if (catName === "Microbiology Reagents") {
      return {
        title: "Microbiology Reagents",
        description: "Culture media, agar plates, dehydrated media, and diagnostic reagents for microbiological analysis.",
        image: "/uploads/agar_package.png",
        count: "Microbiology",
        color: "from-purple-950 to-purple-800",
        category: "Microbiology Reagents",
        search: "",
      };
    }
    return {
      title: catName === "All" ? "All Products Catalog" : `${catName} Products`,
      description: "Browse our comprehensive range of high-quality diagnostic kits, reagents, and laboratory consumables.",
      color: "from-slate-900 to-slate-800",
      count: "All Products",
      image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&h=760&fit=crop&auto=format",
      category: catName,
      search: "",
    };
  };
  const activeCategoryInfo = getCategoryInfo(activeCategory);

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
              href={`tel:${siteSettings.company.phone}`}
              className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity"
            >
              <Phone className="w-3 h-3" />
              {siteSettings.company.phone}
            </a>
            <a
              href={`mailto:${siteSettings.company.email}`}
              className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity"
            >
              <Mail className="w-3 h-3" />
              {siteSettings.company.email}
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
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                setCurrentView("home");
                setActiveCategory("All");
                setSearchQuery("");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex-shrink-0 flex items-center gap-3 no-underline"
            >
              <img src="/uploads/chamrud_logo.png" alt="Chamrud Logo" className="w-10 h-10 rounded-lg object-contain shadow-sm bg-white p-0.5" />
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (currentView !== "category") {
                      setCurrentView("category");
                      setActiveCategory("All");
                    }
                    setCurrentPage(1);
                  }}
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
                    onClick={() => handleNavClick(item)}
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
                          onClick={() => handleNavClick(child, item)}
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (currentView !== "category") {
                      setCurrentView("category");
                      setActiveCategory("All");
                    }
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm focus:outline-none"
                />
              </div>
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block py-2.5 border-b border-border text-sm font-medium text-foreground hover:text-[#FF9933] transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item);
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {currentView === "home" && <>
      {/* Hero section */}
      <section id="home" className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-stretch">
            <div className="bg-[#003399] rounded-xl overflow-hidden relative min-h-[430px] flex items-end">
              <img
                src="/chamrud-enterprise-banner.jpeg"
                alt="Chamrud Enterprise"
                className="absolute inset-0 w-full h-full object-cover object-top opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#003399] via-[#003399]/85 to-[#003399]/50" />
              <div className="relative p-6 md:p-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-xs text-white/85 mb-5 backdrop-blur-sm">
                  <CheckCircle className="w-3.5 h-3.5 text-[#FF9933]" />
                  Trusted Medical Supplier - Lusaka, Zambia
                </div>
                <h1
                  className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Chamrud Enterprise laboratory supply catalogue
                </h1>
                <p className="text-white/75 text-base md:text-lg mb-7 leading-relaxed">
                  Quality diagnostic kits, reagents, consumables and medical supplies for hospitals, clinics, research institutes and laboratories across Zambia.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigateToCategoryPage("All")}
                    className="flex items-center gap-2 bg-[#FF9933] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#e88820] transition-colors text-sm cursor-pointer border-0"
                  >
                    Browse Products
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <a href="#contact" className="flex items-center gap-2 border border-white/30 text-white px-5 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors text-sm backdrop-blur-sm">
                    Request a Quote
                  </a>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {(siteSettings.streams || HOME_STREAMS).map((stream) => (
                <button
                  key={stream.title}
                  onClick={() => navigateToCategoryPage(stream.category)}
                  className="group text-left bg-[#f0f6fb] border border-border rounded-xl overflow-hidden hover:border-[#149CD8]/50 hover:shadow-md transition-all grid grid-cols-[120px_1fr] min-h-[132px]"
                >
                  <img
                    src={stream.image}
                    alt={stream.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="p-4 flex flex-col justify-center">
                    <div
                      className="font-bold text-[#003399] text-base mb-1"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {stream.title}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-2">
                      {stream.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FF9933]">
                      View products
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Chamrud Enterprise promotional banner */}
      <section className="bg-gradient-to-b from-white to-[#f0f6fb] py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6">
            <span className="inline-block bg-[#003399]/10 text-[#003399] text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">Your Trusted Medical Partner</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#003399]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Quality. Reliability. Excellence.
            </h2>
          </div>
          <div className="relative group mx-auto max-w-3xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#003399] via-[#FF9933] to-[#149CD8] rounded-2xl blur-sm opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/chamrud-enterprise-banner.jpeg"
                alt="Chamrud Enterprise – Rapid Test Kits, Lab Equipment & Reagents"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {[
              { label: "Rapid Test Kits", color: "#FF9933" },
              { label: "Lab Equipment & Materials", color: "#003399" },
              { label: "Lab Reagents & Consumables", color: "#149CD8" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold shadow-md"
                style={{ backgroundColor: item.color }}
              >
                <CheckCircle className="w-4 h-4" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certification strip */}
      <div className="bg-[#149CD8] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
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

      {/* Featured products auto-scroller */}
      {products.filter(p => p.featured && !p.hidden).length > 0 && (
        <section className="bg-[#003399] py-8 overflow-hidden border-b border-white/10">
          <style>{`
            @keyframes marquee-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-track {
              animation: marquee-scroll 32s linear infinite;
              display: flex;
              width: max-content;
            }
            .marquee-track:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="max-w-7xl mx-auto px-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white font-bold text-sm uppercase tracking-widest">Featured Products</span>
            </div>
            <button
              onClick={() => navigateToCategoryPage("All")}
              className="text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-hidden">
            <div className="marquee-track">
              {[...products.filter(p => p.featured && !p.hidden), ...products.filter(p => p.featured && !p.hidden)].map((product, idx) => (
                <button
                  key={`${product.id}-${idx}`}
                  onClick={() => { setSelectedProduct(product); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="flex-shrink-0 mx-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:bg-white/20 transition-all group w-44"
                >
                  <div className="h-28 overflow-hidden bg-white/5">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/uploads/reagent.png"; }}
                    />
                  </div>
                  <div className="p-3 text-left">
                    <div className="text-white text-xs font-semibold line-clamp-2 leading-tight mb-1">{product.name}</div>
                    <div className="text-[#FF9933] text-xs font-bold">{product.price}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

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
          <button
            onClick={() => navigateToCategoryPage("All")}
            className="hidden md:flex items-center gap-1.5 text-sm text-[#149CD8] font-medium hover:gap-2.5 transition-all cursor-pointer border-0 bg-transparent"
          >
            View all categories
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {(siteSettings.categories || PRODUCT_CATEGORIES).map((cat) => (
            <div
              key={cat.title}
              onClick={() => {
                let target = cat.category;
                if (cat.title === "Glass & Plastic Vials") target = "vials";
                else if (cat.title === "Caps, Closures & Pipettes") target = "closures";
                navigateToCategoryPage(target, "All", cat.search);
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

      {/* Catalogue departments */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#FF9933] font-semibold mb-2">
              Browse Catalogue
            </div>
            <h2
              className="text-2xl md:text-3xl font-bold text-foreground"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Product departments
            </h2>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATALOG_DEPARTMENTS.map((department) => (
            <div key={department.title} className="bg-white border border-border rounded-xl p-5">
              <button
                onClick={() => {
                  let target = department.category;
                  if (department.title === "Vials & Bottles") target = "vials";
                  else if (department.title === "Caps & Closures") target = "closures";
                  navigateToCategoryPage(target);
                }}
                className="text-left w-full flex items-center justify-between gap-3 font-bold text-[#003399] mb-4 hover:text-[#FF9933] transition-colors cursor-pointer border-0 bg-transparent"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {department.title}
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </button>
              <div className="space-y-2">
                {department.links.map((link) => (
                  <button
                    key={link}
                    onClick={() => {
                      let target = categoryForLink(department.category, link);
                      if (department.title === "Vials & Bottles") target = "vials";
                      else if (department.title === "Caps & Closures") target = "closures";
                      
                      let subFilter = "All";
                      let searchVal = link;
                      if (target === "vials" || target === "closures" || target === "Diagnostics" || target === "Equipment") {
                        subFilter = link;
                        searchVal = "";
                      }
                      navigateToCategoryPage(target, subFilter, searchVal);
                    }}
                    className="block w-full text-left text-xs text-muted-foreground hover:text-[#FF9933] transition-colors cursor-pointer border-0 bg-transparent"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Business streams */}
      <section className="bg-[#f0f6fb] border-y border-border py-14">
        <div className="max-w-7xl mx-auto px-4 space-y-10">
          {(siteSettings.streams || HOME_STREAMS).map((stream, index) => {
            const previewProducts = streamProducts(stream.category);
            return (
              <div
                key={stream.title}
                className={`grid lg:grid-cols-[0.85fr_1.15fr] gap-6 items-stretch ${
                  index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="bg-white border border-border rounded-xl overflow-hidden">
                  <div className="h-56 overflow-hidden bg-slate-100">
                    <img
                      src={stream.image}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-xs uppercase tracking-widest text-[#FF9933] font-semibold mb-2">
                      Chamrud Supply Stream
                    </div>
                    <h3
                      className="text-2xl font-bold text-foreground mb-3"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {stream.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                      {stream.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {(stream.links || []).map((link) => (
                        <button
                          key={link}
                          onClick={() => {
                            let target = categoryForLink(stream.category, link);
                            if (stream.title.includes("Vials")) {
                              if (link.includes("Cap") || link.includes("Pipette") || link.includes("Closure")) {
                                target = "closures";
                              } else {
                                target = "vials";
                              }
                            }
                            
                            let subFilter = "All";
                            let searchVal = link === "Dropper Pipettes" ? "Dropper Pipette" : link;
                            if (target === "vials" || target === "closures" || target === "Diagnostics" || target === "Equipment") {
                              subFilter = link === "Dropper Pipettes" ? "Dropper Pipettes" : link;
                              searchVal = "";
                            }
                            navigateToCategoryPage(target, subFilter, searchVal);
                          }}
                          className="text-left text-xs font-semibold text-[#003399] bg-[#003399]/5 border border-[#003399]/10 rounded-lg px-3 py-2 hover:border-[#FF9933]/40 hover:text-[#FF9933] transition-colors cursor-pointer"
                        >
                          {link}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  {previewProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-square bg-slate-100 overflow-hidden">
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="text-[10px] text-muted-foreground font-mono mb-1 tracking-wider line-clamp-1">
                          {product.sku}
                        </div>
                        <h4 className="font-semibold text-sm text-foreground leading-snug line-clamp-3 min-h-[3.9rem]">
                          {product.name}
                        </h4>
                        <button
                          onClick={() => addToCart(product)}
                          className="mt-4 w-full inline-flex items-center justify-center gap-1.5 text-xs bg-[#FF9933] text-white px-3 py-2 rounded-lg hover:bg-[#e88820] transition-colors font-semibold cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Add to Basket
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured products */}
      <section id="featured" className="bg-white py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="text-xs uppercase tracking-widest text-[#FF9933] font-semibold mb-2">
              Featured Products
            </div>
            <h2
              className="text-2xl md:text-3xl font-bold text-foreground"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Popular Products in Our Catalog
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              Explore some of our most requested diagnostic kits, reagents, and laboratory consumables.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(() => {
              const featured = products.filter(p => !p.hidden && p.featured);
              const display = featured.length > 0 ? featured.slice(0, 4) : products.filter(p => !p.hidden).slice(0, 4);
              return display.map((product) => (
              <div
                key={product.id}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 bg-slate-100 overflow-hidden relative">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div
                      className={`absolute top-3 left-3 text-[10px] font-semibold border px-2 py-0.5 rounded-full ${BADGE_COLORS[product.badge] || "bg-slate-100 text-slate-700"}`}
                    >
                      {product.badge}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-[10px] text-muted-foreground font-mono mb-1 tracking-wider">
                      {product.sku}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-2 leading-snug line-clamp-2">
                      {product.name}
                    </h3>
                    {(product.sourceCategory || product.description) && (
                      <div className="mb-3">
                        {product.sourceCategory && (
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-[#149CD8] mb-1">
                            {product.sourceCategory}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4 pt-0 border-t border-slate-50 mt-auto flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#003399]">
                      Request quote
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {product.unit}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="text-xs border border-border px-3 py-1.5 rounded-lg hover:border-[#149CD8] hover:text-[#149CD8] transition-colors font-medium cursor-pointer bg-transparent"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => addToCart(product)}
                      className="text-xs bg-[#FF9933] text-white px-3 py-1.5 rounded-lg hover:bg-[#e88820] transition-colors font-medium flex items-center gap-1 cursor-pointer border-0"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>

          <div className="text-center mt-10">
            <button
              onClick={() => navigateToCategoryPage("All")}
              className="inline-flex items-center gap-2 bg-[#003399] hover:bg-[#002266] text-white px-6 py-3 rounded-lg font-semibold transition-all text-sm shadow-sm cursor-pointer border-0"
            >
              Browse Full Catalog
              <ArrowRight className="w-4 h-4" />
            </button>
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
                      src={getImageUrl(post.imageUrl)}
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
      <section id="brands" className="bg-[#f0f6fb] border-y border-border py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Authorised Distributor For
            </div>
          </div>
        </div>
        <div className="relative w-full overflow-hidden flex items-center animate-marquee-hover-pause">
          {/* Faders for smooth fading edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#f0f6fb] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#f0f6fb] to-transparent z-10 pointer-events-none" />
          
          <div className="flex gap-6 animate-marquee py-2 px-4">
            {/* First set of brands */}
            {siteSettings.brands.map((brand, idx) => (
              <div
                key={`brand-1-${idx}`}
                className="bg-card border border-border rounded-xl px-5 py-4 flex flex-col items-center justify-center gap-2 hover:border-[#FF9933]/40 hover:shadow-sm transition-all cursor-pointer select-none flex-shrink-0 min-w-[170px] min-h-[110px]"
              >
                <div className="flex items-center justify-center h-10 flex-shrink-0">
                  {getBrandLogo(brand)}
                </div>
                <div className="text-center">
                  <div className="text-[12px] font-bold text-foreground leading-tight">
                    {brand}
                  </div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Partner
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate set of brands for seamless looping */}
            {siteSettings.brands.map((brand, idx) => (
              <div
                key={`brand-2-${idx}`}
                className="bg-card border border-border rounded-xl px-5 py-4 flex flex-col items-center justify-center gap-2 hover:border-[#FF9933]/40 hover:shadow-sm transition-all cursor-pointer select-none flex-shrink-0 min-w-[170px] min-h-[110px]"
              >
                <div className="flex items-center justify-center h-10 flex-shrink-0">
                  {getBrandLogo(brand)}
                </div>
                <div className="text-center">
                  <div className="text-[12px] font-bold text-foreground leading-tight">
                    {brand}
                  </div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Partner
                  </div>
                </div>
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
          {siteSettings.testimonials.map((t) => (
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
            <a href={`tel:${siteSettings.company.phone}`} className="flex items-center gap-2 border border-white/50 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors text-sm">
              <Phone className="w-4 h-4" />
              Call Us Now
            </a>
          </div>
        </div>
      </section>
      </> }

      {(currentView === "category" || currentView === "diagnostics" || currentView === "vials" || currentView === "closures" || currentView === "equipment") && (
        <section id="category-page" className="bg-[#f0f6fb] min-h-[80vh] pb-16">
          {/* Category Hero Banner */}
          <div className={`relative bg-gradient-to-r ${activeCategoryInfo.color} text-white py-12 md:py-16 overflow-hidden`}>
            <img
              src={activeCategoryInfo.image}
              alt={activeCategoryInfo.title}
              className="absolute inset-0 w-full h-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
            <div className="relative max-w-7xl mx-auto px-4">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-white/60 text-xs mb-4">
                <button
                  onClick={() => {
                    setCurrentView("home");
                    setActiveCategory("All");
                    setSearchQuery("");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-white transition-colors cursor-pointer bg-transparent border-0 text-white/60 text-xs p-0 font-medium"
                >
                  Home
                </button>
                <ChevronRight className="w-3 h-3 text-white/40" />
                <button
                  onClick={() => {
                    setActiveCategory("All");
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="hover:text-white transition-colors cursor-pointer bg-transparent border-0 text-white/60 text-xs p-0 font-medium"
                >
                  Catalog
                </button>
                {activeCategory !== "All" && (
                  <>
                    <ChevronRight className="w-3 h-3 text-white/40" />
                    <span className="text-white font-medium">{activeCategoryInfo.title}</span>
                  </>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {activeCategoryInfo.title}
              </h1>
              <p className="text-white/80 text-sm md:text-base max-w-2xl leading-relaxed mb-0">
                {activeCategoryInfo.description}
              </p>
            </div>
          </div>

          {/* Main Catalog Area */}
          <div className="max-w-7xl mx-auto px-4 mt-8">
            <div className={currentView === "category" ? "grid lg:grid-cols-[260px_1fr] gap-8 items-start" : "w-full"}>
              {/* Sidebar Filters */}
              {currentView === "category" && (
                <aside className="bg-white border border-border rounded-xl p-5 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-[#003399] font-bold mb-3">
                      Departments
                    </h3>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => {
                          setActiveCategory("All");
                          setSearchQuery("");
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer border-0 ${
                          activeCategory === "All"
                            ? "bg-[#003399] text-white"
                            : "text-muted-foreground bg-transparent hover:bg-[#f0f6fb] hover:text-[#003399]"
                        }`}
                      >
                        <span>All Products</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeCategory === "All" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                          {products.filter((p) => !p.hidden).length}
                        </span>
                      </button>

                      {Array.from(new Set(products.map((p) => p.category)))
                        .filter(Boolean)
                        .sort()
                        .map((catName) => {
                          const isSelected = activeCategory === catName;
                          const count = products.filter((p) => !p.hidden && p.category === catName).length;
                          const displayTitle = catName === "Diagnostics" ? "Diagnostic Products" :
                                               catName === "Lab Consumables" ? "Glass & Plastic Vials" :
                                               catName === "Equipment" ? "Readers & Equipment" :
                                               catName === "Hematology" ? "Hematology Reagents" :
                                               catName === "Reagents" ? "Reagents & Controls" : catName;
                          return (
                            <button
                              key={catName}
                              onClick={() => {
                                setActiveCategory(catName);
                                setSearchQuery("");
                                setCurrentPage(1);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer border-0 ${
                                isSelected
                                  ? "bg-[#003399] text-white"
                                  : "text-muted-foreground bg-transparent hover:bg-[#f0f6fb] hover:text-[#003399]"
                              }`}
                            >
                              <span>{displayTitle}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Subcategories */}
                  {activeCategory !== "All" && subCategories.length > 0 && (
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-[#003399] font-bold mb-3">
                        Filter by Type
                      </h3>
                      <div className="space-y-1">
                        {subCategories.map((subName) => {
                          const isSelected = searchQuery === subName;
                          return (
                            <button
                              key={subName}
                              onClick={() => {
                                setSearchQuery(isSelected ? "" : subName);
                                setCurrentPage(1);
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer border-0 ${
                                isSelected
                                  ? "bg-[#FF9933]/15 text-[#FF9933] font-semibold"
                                  : "text-muted-foreground bg-transparent hover:bg-slate-50 hover:text-[#FF9933]"
                              }`}
                            >
                              <span className="truncate">{subName}</span>
                              {isSelected && <X className="w-3 h-3 flex-shrink-0 text-[#FF9933]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </aside>
              )}

              {/* Product Catalog Grid */}
              <div className="space-y-6">
                {/* Horizontal Subcategory pills (only on dedicated department pages) */}
                {currentView !== "category" && (() => {
                  let pills: string[] = [];
                  if (currentView === "diagnostics") {
                    pills = [
                      "All",
                      "Rapid Tests & Devices",
                      "Blood Grouping Reagents",
                      "Infectious Disease Tests",
                      "Drugs of Abuse Tests",
                      "Urinalysis Strips",
                      "COVID & Respiratory"
                    ];
                  } else if (currentView === "vials") {
                    pills = [
                      "All",
                      "5ml Bottles",
                      "10ml / 15ml Bottles",
                      "20ml / 25ml Bottles",
                      "30ml Bottles",
                      "50ml Bottles",
                      "100ml Bottles",
                      "Other Sizes"
                    ];
                  } else if (currentView === "closures") {
                    pills = [
                      "All",
                      "Aluminium Caps",
                      "Atomisers & Spray Caps",
                      "Dropper Pipettes",
                      "Bamboo Range",
                      "Pots & Jars"
                    ];
                  } else if (currentView === "equipment") {
                    pills = [
                      "All",
                      "Readers & Analyzers",
                      "Biochemical Meters",
                      "PCR & Accessories"
                    ];
                  }
                  return (
                    <div className="flex flex-wrap items-center gap-2 pb-2">
                      {pills.map((subName) => {
                        const isSelected = subCategoryFilter === subName;
                        return (
                          <button
                            key={subName}
                            onClick={() => {
                              setSubCategoryFilter(subName);
                              setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#003399] border-[#003399] text-white shadow-sm"
                                : "bg-white border-border text-muted-foreground hover:bg-slate-50 hover:text-[#003399]"
                            }`}
                          >
                            {subName}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
                {/* Controls Bar */}
                <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search within this category..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-[#149CD8]/30 focus:border-[#149CD8]"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setCurrentPage(1);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      Showing <span className="font-semibold text-foreground">{filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-{Math.min(filtered.length, currentPage * itemsPerPage)}</span> of <span className="font-semibold text-foreground">{filtered.length}</span> products
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value as any);
                          setCurrentPage(1);
                        }}
                        className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#149CD8]"
                      >
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="sku-asc">SKU Code</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Active Tags */}
                {searchQuery && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">Active filters:</span>
                    <span className="inline-flex items-center gap-1.5 bg-[#149CD8]/10 text-[#149CD8] border border-[#149CD8]/20 px-2.5 py-1 rounded-full text-xs font-medium">
                      "{searchQuery}"
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setCurrentPage(1);
                        }}
                        className="hover:text-red-500 transition-colors cursor-pointer bg-transparent border-0 p-0 text-[#149CD8] flex items-center"
                      >
                        <X className="w-3 h-3 ml-1" />
                      </button>
                    </span>
                  </div>
                )}

                {/* Products Grid */}
                {paginatedProducts.length === 0 ? (
                  <div className="bg-white rounded-xl border border-border p-12 text-center text-muted-foreground shadow-sm">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="font-semibold text-foreground mb-1 text-base">No products found</p>
                    <p className="text-sm">Try broadening your search query or choosing another category.</p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setActiveCategory("All");
                        setSubCategoryFilter("All");
                        setCurrentPage(1);
                      }}
                      className="mt-4 text-xs font-semibold bg-[#003399] text-white px-4 py-2 rounded-lg hover:bg-[#002266] transition-colors cursor-pointer border-0"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {paginatedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-44 bg-slate-100 overflow-hidden relative">
                            <img
                              src={getImageUrl(product.image)}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div
                              className={`absolute top-3 left-3 text-[10px] font-semibold border px-2 py-0.5 rounded-full ${BADGE_COLORS[product.badge] || "bg-slate-100 text-slate-700"}`}
                            >
                              {product.badge}
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="text-[10px] text-muted-foreground font-mono mb-1 tracking-wider">
                              {product.sku}
                            </div>
                            <h3 className="text-sm font-semibold text-foreground mb-2 leading-snug line-clamp-2">
                              {product.name}
                            </h3>
                            {(product.sourceCategory || product.description) && (
                              <div className="mb-3">
                                {product.sourceCategory && (
                                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[#149CD8] mb-1">
                                    {product.sourceCategory}
                                  </div>
                                )}
                                {product.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {product.description}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-4 pt-0 border-t border-slate-50 mt-auto flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-[#003399]">
                              Request quote
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {product.unit}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedProduct(product)}
                              className="text-xs border border-border px-3 py-1.5 rounded-lg hover:border-[#149CD8] hover:text-[#149CD8] transition-colors font-medium cursor-pointer bg-transparent"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => addToCart(product)}
                              className="text-xs bg-[#FF9933] text-white px-3 py-1.5 rounded-lg hover:bg-[#e88820] transition-colors font-medium flex items-center gap-1 cursor-pointer border-0"
                            >
                              <ShoppingCart className="w-3 h-3" />
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 pt-4">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-border rounded-lg bg-white text-muted-foreground hover:text-foreground hover:border-slate-350 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      const isNear = Math.abs(currentPage - pageNum) <= 1;
                      const isEdge = pageNum === 1 || pageNum === totalPages;
                      
                      if (!isNear && !isEdge) {
                        if (pageNum === 2 || pageNum === totalPages - 1) {
                          return <span key={pageNum} className="text-xs text-muted-foreground px-1">...</span>;
                        }
                        return null;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all cursor-pointer border-0 ${
                            currentPage === pageNum
                              ? "bg-[#003399] text-white"
                              : "bg-white border border-border text-muted-foreground hover:text-foreground hover:border-slate-350"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-border rounded-lg bg-white text-muted-foreground hover:text-foreground hover:border-slate-350 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {currentView === "reagents-list" &&
        <section id="reagents-list-page" className="bg-[#f0f6fb] min-h-[60vh] py-14">
          <div className="max-w-7xl mx-auto px-4">
            {/* Header / Info */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
              <div>
                <button
                  onClick={() => {
                    setCurrentView("home");
                    setTimeout(() => {
                      const el = document.getElementById("home");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }, 50);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#149CD8] font-semibold hover:text-[#003399] transition-colors mb-3 cursor-pointer"
                >
                  ← Back to Main Page
                </button>
                <div className="text-xs uppercase tracking-widest text-[#FF9933] font-semibold mb-2">
                  Quick Directory
                </div>
                <h1
                  className="text-2xl md:text-3xl font-bold text-foreground"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Reagents &amp; Chemicals List
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse laboratory reagents, buffer solutions, culture media, and microbiology reagents.
                </p>
              </div>

              {/* Search filter for reagents list view */}
              <div className="w-full md:w-80">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search reagents by name or SKU..."
                    value={reagentsSearch}
                    onChange={(e) => setReagentsSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#149CD8]/30 focus:border-[#149CD8] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl border border-border overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-border text-xs font-semibold text-[#003399] uppercase tracking-wider">
                    <th className="p-4 w-36">SKU</th>
                    <th className="p-4">Product Name</th>
                    <th className="p-4 w-52">Category</th>
                    <th className="p-4 w-36">Packaging</th>
                    <th className="p-4 w-40 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredReagents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-muted-foreground">
                        No reagents found matching your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredReagents.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="p-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {product.sku}
                        </td>
                        <td className="p-4 font-semibold text-foreground">
                          {product.name}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block text-[10px] font-bold border px-2.5 py-0.5 rounded-full ${
                            product.category === "Microbiology Reagents"
                              ? "bg-purple-50 text-purple-700 border-purple-100"
                              : "bg-cyan-50 text-cyan-700 border-cyan-100"
                          }`}>
                            {product.category}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                          {product.unit}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => addToCart(product)}
                            className="inline-flex items-center gap-1.5 text-xs bg-[#FF9933] text-white px-3.5 py-2 rounded-lg hover:bg-[#e88820] transition-colors font-semibold cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Add to Basket
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards-free List View */}
            <div className="block md:hidden space-y-3">
              {filteredReagents.length === 0 ? (
                <div className="bg-white rounded-xl border border-border p-8 text-center text-muted-foreground text-sm">
                  No reagents found matching your search query.
                </div>
              ) : (
                filteredReagents.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl border border-border p-4 shadow-sm flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-[10px] text-muted-foreground font-mono">{product.sku}</div>
                      <h4 className="font-semibold text-sm text-foreground leading-snug my-1">{product.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full ${
                          product.category === "Microbiology Reagents"
                            ? "bg-purple-50 text-purple-700 border-purple-100"
                            : "bg-cyan-50 text-cyan-700 border-cyan-100"
                        }`}>
                          {product.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{product.unit}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-[#FF9933] text-white p-2.5 rounded-lg hover:bg-[#e88820] transition-colors flex-shrink-0 cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      }

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
            <a href={`tel:${siteSettings.company.phone}`} className="bg-white/10 border border-white/20 rounded-xl p-6 flex flex-col items-center text-center hover:bg-white/20 transition-all group">
              <div className="w-12 h-12 rounded-full bg-[#FF9933] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div className="text-white/60 text-xs uppercase tracking-widest mb-1">Phone</div>
              <div className="text-white font-semibold text-sm">{siteSettings.company.phone}</div>
              {siteSettings.company.phone2 && <div className="text-white/60 text-sm mt-1">{siteSettings.company.phone2}</div>}
            </a>
            <a href={`mailto:${siteSettings.company.email}`} className="bg-white/10 border border-white/20 rounded-xl p-6 flex flex-col items-center text-center hover:bg-white/20 transition-all group">
              <div className="w-12 h-12 rounded-full bg-[#149CD8] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="text-white/60 text-xs uppercase tracking-widest mb-1">Email</div>
              <div className="text-white font-semibold text-sm">{siteSettings.company.email}</div>
            </a>
            <div className="bg-white/10 border border-white/20 rounded-xl p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="text-white/60 text-xs uppercase tracking-widest mb-1">Address</div>
              <div className="text-white font-semibold text-sm">{siteSettings.company.address}</div>
              <div className="text-white/70 text-sm">{siteSettings.company.city}</div>
              <div className="text-[#FF9933] font-semibold text-sm mt-1">{siteSettings.company.country}</div>
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
                <img src="/uploads/chamrud_logo.png" alt="Chamrud Logo" className="w-10 h-10 rounded-lg object-contain shadow-sm bg-white p-0.5" />
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
                  {siteSettings.company.address}, {siteSettings.company.city}, {siteSettings.company.country}
                </div>
                <a href={`tel:${siteSettings.company.phone}`} className="flex items-center gap-2 text-white/50 text-xs hover:text-white/80 transition-colors">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0 text-[#FF9933]" />
                  {siteSettings.company.phone}{siteSettings.company.phone2 ? ` / ${siteSettings.company.phone2}` : ""}
                </a>
                <a href={`mailto:${siteSettings.company.email}`} className="flex items-center gap-2 text-white/50 text-xs hover:text-white/80 transition-colors">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0 text-[#FF9933]" />
                  {siteSettings.company.email}
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
                  { label: "Diagnostic Products", href: "#products" },
                  { label: "Vials & Bottles", href: "#products" },
                  { label: "Caps & Closures", href: "#products" },
                  { label: "Readers & Equipment", href: "#products" },
                  { label: "Reagents", href: "#products" },
                  { label: "Microbiology Reagents", href: "#products" },
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

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-[#003399] text-white">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/60">Product Details</div>
                <div className="font-bold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Chamrud Catalogue
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto">
              <div className="grid md:grid-cols-[0.85fr_1.15fr] gap-0">
                <div className="bg-slate-100 p-6 flex items-center justify-center">
                  <img
                    src={getImageUrl(selectedProduct.image)}
                    alt={selectedProduct.name}
                    className="w-full max-h-[420px] object-contain rounded-xl bg-white border border-border"
                  />
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className={`text-[10px] font-semibold border px-2.5 py-1 rounded-full ${BADGE_COLORS[selectedProduct.badge] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                      {selectedProduct.badge}
                    </span>
                    <span className="text-[10px] font-semibold border px-2.5 py-1 rounded-full bg-[#149CD8]/10 text-[#149CD8] border-[#149CD8]/20">
                      {selectedProduct.category}
                    </span>
                    {selectedProduct.sourceCategory && (
                      <span className="text-[10px] font-semibold border px-2.5 py-1 rounded-full bg-[#FF9933]/10 text-[#FF9933] border-[#FF9933]/20">
                        {selectedProduct.sourceCategory}
                      </span>
                    )}
                  </div>

                  <h2
                    className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-3"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {selectedProduct.name}
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-3 mb-6">
                    <div className="rounded-xl border border-border bg-[#f0f6fb] p-3">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Catalogue Number</div>
                      <div className="font-mono text-xs text-foreground break-words">{selectedProduct.sku}</div>
                    </div>
                    <div className="rounded-xl border border-border bg-[#f0f6fb] p-3">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Pack / Unit</div>
                      <div className="text-xs font-semibold text-foreground">{selectedProduct.unit || "Quote only"}</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-xs uppercase tracking-widest text-[#003399] font-bold mb-2">Product Information</div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {selectedProduct.description || "Detailed product information is available on request from our sales team."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="inline-flex items-center gap-2 bg-[#FF9933] text-white px-5 py-3 rounded-lg hover:bg-[#e88820] transition-colors text-sm font-bold"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Basket
                    </button>
                    {selectedProduct.sourceUrl && (
                      <a
                        href={selectedProduct.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 border border-border px-5 py-3 rounded-lg hover:border-[#149CD8] hover:text-[#149CD8] transition-colors text-sm font-semibold"
                      >
                        Source Page
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <img src={getImageUrl(item.product.image)} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg bg-slate-100" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground truncate">{item.product.sku}</div>
                      <div className="font-semibold text-sm leading-tight line-clamp-2 mb-1">{item.product.name}</div>
                      <div className="text-[#003399] font-semibold text-xs">Request quote</div>
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
          onPostsChange={(updated) => setPosts(updated)}
          onProductsChange={(updated) => setProducts(updated)}
          onSettingsChange={(updated) => setSiteSettings(updated)}
        />
      )}
    </div>
  );
}
