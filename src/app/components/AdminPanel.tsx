import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Lock,
  LogOut,
  ImageIcon,
  Tag,
  FileText,
  Package,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Edit2,
  Upload,
  Star,
  BarChart3,
  MessageSquare,
  TrendingUp,
  Settings,
  RefreshCw
} from "lucide-react";
import { fetchPosts, savePosts, fetchProducts, saveProducts, uploadImage, getImageUrl, deletePost as apiDeletePost, deleteProduct as apiDeleteProduct, savePost, saveProduct, fetchSettings, saveSetting, fetchInquiries, deleteInquiry as apiDeleteInquiry, Post, Product, Inquiry, SiteSettings, DEFAULT_SETTINGS } from "../data/api";
import { supabase } from "../../lib/supabase";


const CATEGORY_COLORS: Record<Post["category"], string> = {
  Product: "bg-[#149CD8]/10 text-[#149CD8] border-[#149CD8]/30",
  Offer: "bg-[#FF9933]/10 text-[#FF9933] border-[#FF9933]/30",
  Announcement: "bg-purple-100 text-purple-700 border-purple-200",
  News: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

interface AdminPanelProps {
  onClose: () => void;
  onPostsChange: (posts: Post[]) => void;
  onProductsChange: (products: Product[]) => void;
  onSettingsChange?: (settings: SiteSettings) => void;
}

export default function AdminPanel({ onClose, onPostsChange, onProductsChange, onSettingsChange }: AdminPanelProps) {
  const [authed, setAuthed] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isAdminChecking, setIsAdminChecking] = useState(false);
  const [profiles, setProfiles] = useState<{ id: string; email: string; full_name: string; role: string; created_at: string }[]>([]);
  
  const [activeTab, setActiveTab] = useState<"dashboard" | "posts" | "products" | "settings" | "inquiries" | "users">("dashboard");
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [view, setView] = useState<"list" | "newPost" | "newProduct" | "editProduct">("list");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // ── Inquiries state ──
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // ── Settings state ──
  const [settingsForm, setSettingsForm] = useState<SiteSettings["company"]>(DEFAULT_SETTINGS.company);
  const [brandsForm, setBrandsForm] = useState<string[]>(DEFAULT_SETTINGS.brands);
  const [newBrand, setNewBrand] = useState("");
  const [testimonialsForm, setTestimonialsForm] = useState<SiteSettings["testimonials"]>(DEFAULT_SETTINGS.testimonials);
  const [streamsForm, setStreamsForm] = useState<SiteSettings["streams"]>(DEFAULT_SETTINGS.streams);
  const [categoriesForm, setCategoriesForm] = useState<SiteSettings["categories"]>(DEFAULT_SETTINGS.categories);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({ name: "", role: "", text: "", rating: 5 });

  const [postForm, setPostForm] = useState({
    title: "",
    body: "",
    imageUrl: "",
    category: "Product" as Post["category"],
  });

  const [productForm, setProductForm] = useState<Partial<Product>>({});

  // Restore session on mount and listen for auth changes
  useEffect(() => {
    async function checkSession(session: any) {
      if (!session) {
        setAuthed(false);
        return;
      }
      setIsAdminChecking(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error || !data || data.role !== "admin") {
          setAuthError("Access Denied: You do not have administrator permissions.");
          await supabase.auth.signOut();
          setAuthed(false);
        } else {
          setAuthed(true);
          setAuthError("");
        }
      } catch (err) {
        setAuthError("Error checking administrator permissions.");
        await supabase.auth.signOut();
        setAuthed(false);
      } finally {
        setIsAdminChecking(false);
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authed) {
      fetchPosts().then(p => { setPosts(p); onPostsChange(p); });
      fetchProducts().then(setProducts);
      fetchInquiries().then(setInquiries);
      fetchSettings().then(s => {
        setSettingsForm(s.company);
        setBrandsForm(s.brands);
        setTestimonialsForm(s.testimonials);
        setStreamsForm(s.streams || DEFAULT_SETTINGS.streams);
        setCategoriesForm(s.categories || DEFAULT_SETTINGS.categories);
      });
      // Fetch user profiles
      supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          if (data) setProfiles(data);
        });
    }
  }, [authed]);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function login() {
    if (!adminEmail.trim() || !password.trim()) {
      setAuthError("Please enter your email and password.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: adminEmail.trim(),
      password: password.trim(),
    });
    if (error) {
      setAuthError("Invalid email or password. Please try again.");
    } else {
      setAuthError("");
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    onClose();
  }

  async function toggleUserRole(userId: string, currentRole: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id === userId) {
      showToast("Cannot revoke your own administrator role.", false);
      return;
    }
    const newRole = currentRole === "admin" ? "member" : "admin";
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      showToast("Failed to update user role.", false);
    } else {
      setProfiles(arr => arr.map(p => p.id === userId ? { ...p, role: newRole } : p));
      showToast("User role updated successfully!");
    }
  }

  // --- POSTS ---
  async function addPost() {
    if (!postForm.title.trim() || !postForm.body.trim()) {
      showToast("Title and description are required.", false);
      return;
    }
    const newPost: Post = {
      id: crypto.randomUUID(),
      title: postForm.title.trim(),
      body: postForm.body.trim(),
      imageUrl: postForm.imageUrl.trim(),
      category: postForm.category,
      createdAt: new Date().toISOString(),
    };
    const ok = await savePost(newPost);
    if (!ok) { showToast("Failed to publish post.", false); return; }
    const updated = [newPost, ...posts];
    setPosts(updated);
    onPostsChange(updated);
    setPostForm({ title: "", body: "", imageUrl: "", category: "Product" });
    setView("list");
    showToast("Post published to homepage!");
  }

  async function deletePost(id: string) {
    const ok = await apiDeletePost(id);
    if (!ok) { showToast("Failed to delete post.", false); return; }
    const updated = posts.filter((p) => p.id !== id);
    setPosts(updated);
    onPostsChange(updated);
    showToast("Post removed.");
  }

  // --- PRODUCTS ---
  async function handleSaveProduct() {
    if (!productForm.name?.trim()) {
      showToast("Product name is required.", false);
      return;
    }

    let upserted: Product;
    if (view === "newProduct") {
      upserted = {
        id: crypto.randomUUID(),
        name: productForm.name.trim(),
        sku: productForm.sku?.trim() || `SKU-${Date.now()}`,
        price: productForm.price?.trim() || "",
        unit: productForm.unit?.trim() || "per unit",
        category: productForm.category || "Consumables",
        badge: productForm.badge || "In Stock",
        image: productForm.image?.trim() || "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=300&h=300&fit=crop&auto=format",
      };
    } else {
      upserted = { ...products.find(p => p.id === productForm.id)!, ...productForm } as Product;
    }

    const ok = await saveProduct(upserted);
    if (!ok) { showToast("Failed to save product.", false); return; }

    const updated = view === "newProduct"
      ? [upserted, ...products]
      : products.map(p => p.id === upserted.id ? upserted : p);
    setProducts(updated);
    onProductsChange(updated);
    setView("list");
    showToast(view === "newProduct" ? "Product added!" : "Product updated!");
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const ok = await apiDeleteProduct(id);
    if (!ok) { showToast("Failed to delete product.", false); return; }
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    onProductsChange(updated);
    showToast("Product removed.");
  }

  async function toggleProductVisibility(id: string) {
    const target = products.find(p => p.id === id);
    if (!target) return;
    const toggled = { ...target, hidden: !target.hidden };
    const ok = await saveProduct(toggled);
    if (!ok) { showToast("Failed to update visibility.", false); return; }
    const updated = products.map(p => p.id === id ? toggled : p);
    setProducts(updated);
    onProductsChange(updated);
    showToast(toggled.hidden ? "Product hidden from public." : "Product is now visible.");
  }

  async function toggleProductFeatured(id: string) {
    const target = products.find(p => p.id === id);
    if (!target) return;
    const toggled = { ...target, featured: !target.featured };
    const ok = await saveProduct(toggled);
    if (!ok) { showToast("Failed to update featured status.", false); return; }
    const updated = products.map(p => p.id === id ? toggled : p);
    setProducts(updated);
    onProductsChange(updated);
    showToast(toggled.featured ? "Added to homepage scroller!" : "Removed from homepage scroller.");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, type: "post" | "product") {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const url = await uploadImage(file);
    setIsUploading(false);
    
    if (url) {
      if (type === "post") {
        setPostForm(f => ({ ...f, imageUrl: url }));
      } else {
        setProductForm(f => ({ ...f, image: url }));
      }
      showToast("Image uploaded successfully!");
    } else {
      showToast("Failed to upload image.", false);
    }
  }

  async function handleSettingImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: "stream" | "category", index: number) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const url = await uploadImage(file);
    setIsUploading(false);
    
    if (url) {
      if (type === "stream") {
        setStreamsForm(arr => arr.map((item, idx) => idx === index ? { ...item, image: url } : item));
      } else {
        setCategoriesForm(arr => arr.map((item, idx) => idx === index ? { ...item, image: url } : item));
      }
      showToast("Image uploaded successfully!");
    } else {
      showToast("Failed to upload image.", false);
    }
  }

  async function handleBulkImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const url = await uploadImage(file);
    setIsUploading(false);

    if (url) {
      const toUpdate = products
        .filter(p => selectedProductIds.includes(p.id))
        .map(p => ({ ...p, image: url }));
      const ok = await saveProducts(toUpdate);
      if (!ok) { showToast("Failed to bulk-update images.", false); return; }
      const updated = products.map(p =>
        selectedProductIds.includes(p.id) ? { ...p, image: url } : p
      );
      setProducts(updated);
      onProductsChange(updated);
      setSelectedProductIds([]);
      showToast(`Successfully updated image for ${selectedProductIds.length} products!`);
    } else {
      showToast("Failed to upload bulk image.", false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[300] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.ok ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#003399] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF9933] flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Chamrud Admin Panel
              </div>
              <div className="text-white/50 text-[10px] uppercase tracking-widest">
                Store & Content Manager
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {authed && (
              <button onClick={logout} className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            )}
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors ml-2">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {!authed ? (
          /* Login screen */
          <div className="flex-1 flex flex-col items-center justify-center p-10">
            <div className="w-16 h-16 rounded-2xl bg-[#003399]/10 flex items-center justify-center mb-5">
              <Lock className="w-7 h-7 text-[#003399]" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Admin Access</h2>
            <p className="text-sm text-muted-foreground mb-8 text-center max-w-xs">Sign in with your Supabase admin account.</p>
            <div className="w-full max-w-sm space-y-3">
              <input
                type="email"
                placeholder="Admin email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#003399]/30 focus:border-[#003399] transition-all"
              />
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#003399]/30 focus:border-[#003399] transition-all"
                />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authError && <p className="text-red-500 text-xs flex items-center gap-1 mb-2"><AlertCircle className="w-3.5 h-3.5" /> {authError}</p>}
              <button
                onClick={login}
                disabled={isAdminChecking}
                className="w-full bg-[#003399] disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#FF9933] transition-colors cursor-pointer"
              >
                {isAdminChecking ? "Verifying Permissions..." : "Sign In"}
              </button>
            </div>
          </div>
        ) : (
          /* Authed Layout */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tabs */}
            {view === "list" && (
              <div className="flex border-b border-border bg-slate-50 px-4 pt-3 gap-1 overflow-x-auto">
                {([
                  { key: "dashboard", label: "Dashboard", active: "border-[#003399] text-[#003399]" },
                  { key: "products",  label: "Products",  active: "border-[#003399] text-[#003399]" },
                  { key: "posts",     label: "Posts",     active: "border-[#003399] text-[#003399]" },
                  { key: "inquiries", label: "Inquiries", active: "border-emerald-500 text-emerald-600" },
                  { key: "settings",  label: "Settings",  active: "border-[#FF9933] text-[#FF9933]" },
                  { key: "users",     label: "Users",     active: "border-purple-500 text-purple-600" },
                ] as { key: typeof activeTab; label: string; active: string }[]).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setSelectedProductIds([]); }}
                    className={`pb-3 px-2 text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
                      activeTab === tab.key ? tab.active : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    {tab.key === "inquiries" && inquiries.length > 0 && (
                      <span className="ml-1.5 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{inquiries.length}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* ── DASHBOARD TAB ── */}
            {view === "list" && activeTab === "dashboard" && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Refresh row */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-[#FF9933] font-semibold mb-0.5">Admin Dashboard</div>
                    <div className="text-lg font-bold text-[#003399]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Welcome back</div>
                  </div>
                  <button
                    onClick={() => {
                      fetchProducts().then(setProducts);
                      fetchPosts().then(p => { setPosts(p); onPostsChange(p); });
                      fetchInquiries().then(setInquiries);
                    }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#003399] transition-colors border border-border rounded-lg px-3 py-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Total Products",
                      value: products.length,
                      icon: <Package className="w-5 h-5" />,
                      color: "bg-[#003399]/8 text-[#003399]",
                      bar: "bg-[#003399]",
                    },
                    {
                      label: "Visible",
                      value: products.filter(p => !p.hidden).length,
                      icon: <Eye className="w-5 h-5" />,
                      color: "bg-emerald-50 text-emerald-600",
                      bar: "bg-emerald-500",
                    },
                    {
                      label: "Hidden",
                      value: products.filter(p => p.hidden).length,
                      icon: <EyeOff className="w-5 h-5" />,
                      color: "bg-amber-50 text-amber-600",
                      bar: "bg-amber-500",
                    },
                    {
                      label: "Featured",
                      value: products.filter(p => p.featured).length,
                      icon: <Star className="w-5 h-5" />,
                      color: "bg-yellow-50 text-yellow-600",
                      bar: "bg-yellow-400",
                    },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white border border-border rounded-xl p-4 shadow-sm">
                      <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-bold text-foreground mb-0.5">{stat.value}</div>
                      <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-0.5">{posts.length}</div>
                    <div className="text-xs text-muted-foreground font-medium">Posts Published</div>
                  </div>
                  <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-0.5">{inquiries.length}</div>
                    <div className="text-xs text-muted-foreground font-medium">Inquiries Received</div>
                  </div>
                  <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-[#149CD8]/10 text-[#149CD8] flex items-center justify-center mb-3">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-0.5">{products.filter(p => p.featured && !p.hidden).length}</div>
                    <div className="text-xs text-muted-foreground font-medium">Featured & Visible</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Quick Actions</div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Add Product", icon: <Package className="w-4 h-4" />, action: () => { setProductForm({}); setView("newProduct"); } },
                      { label: "New Post",    icon: <FileText className="w-4 h-4" />, action: () => setView("newPost") },
                      { label: "Inquiries",   icon: <MessageSquare className="w-4 h-4" />, action: () => setActiveTab("inquiries") },
                      { label: "Site Settings", icon: <Settings className="w-4 h-4" />, action: () => setActiveTab("settings") },
                    ].map(a => (
                      <button key={a.label} onClick={a.action} className="flex items-center gap-2 p-3 bg-white border border-border rounded-xl text-sm font-semibold text-foreground hover:border-[#149CD8]/50 hover:text-[#003399] transition-all shadow-sm">
                        <span className="text-[#FF9933]">{a.icon}</span> {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Latest Inquiries preview */}
                {inquiries.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Recent Inquiries</div>
                      <button onClick={() => setActiveTab("inquiries")} className="text-xs text-[#149CD8] hover:underline">View all</button>
                    </div>
                    <div className="space-y-2">
                      {inquiries.slice(0, 3).map(inq => (
                        <div key={inq.id} className="bg-white border border-border rounded-xl p-3 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#003399]/10 flex items-center justify-center flex-shrink-0 text-[#003399] text-xs font-bold">{inq.name?.[0]?.toUpperCase() || "?"}</div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-foreground">{inq.name} <span className="text-muted-foreground font-normal">· {inq.email}</span></div>
                            <div className="text-xs text-muted-foreground truncate mt-0.5">{inq.message}</div>
                          </div>
                          <div className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">{new Date(inq.receivedAt).toLocaleDateString("en-ZM", { day: "numeric", month: "short" })}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── INQUIRIES TAB ── */}
            {view === "list" && activeTab === "inquiries" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between flex-shrink-0">
                  <div className="text-xs text-muted-foreground">{inquiries.length} inquir{inquiries.length !== 1 ? "ies" : "y"} received</div>
                  <button onClick={() => fetchInquiries().then(setInquiries)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#003399] border border-border rounded-lg px-3 py-1.5 transition-colors">
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
                  {inquiries.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No inquiries yet.</p>
                    </div>
                  ) : (
                    inquiries.map(inq => (
                      <div key={inq.id} className="bg-white border border-border rounded-xl p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="font-semibold text-sm text-foreground">{inq.name}</div>
                            <div className="text-xs text-[#149CD8]">{inq.email}</div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="text-[10px] text-muted-foreground">{new Date(inq.receivedAt).toLocaleDateString("en-ZM", { day: "numeric", month: "short", year: "numeric" })}</div>
                            <button
                              onClick={async () => {
                                if (!confirm("Delete this inquiry?")) return;
                                const ok = await apiDeleteInquiry(inq.id);
                                if (ok) setInquiries(arr => arr.filter(i => i.id !== inq.id));
                                else showToast("Failed to delete.", false);
                              }}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-600 text-muted-foreground flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {inq.subject && <div className="text-xs font-semibold text-muted-foreground mb-1">Subject: {inq.subject}</div>}
                        <p className="text-sm text-foreground leading-relaxed">{inq.message}</p>
                        <a href={`mailto:${inq.email}?subject=Re: ${inq.subject || "Your Inquiry"}`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#003399] hover:text-[#FF9933] transition-colors">
                          Reply via Email →
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* List Views */}
            {view === "list" && activeTab === "posts" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between flex-shrink-0">
                  <div className="text-xs text-muted-foreground">{posts.length} post{posts.length !== 1 ? "s" : ""} published</div>
                  <button onClick={() => setView("newPost")} className="flex items-center gap-2 bg-[#FF9933] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#e88820] transition-colors">
                    <Plus className="w-4 h-4" /> New Post
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-3">
                  {posts.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground"><Package className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No posts yet. Add your first post!</p></div>
                  ) : (
                    posts.map((post) => (
                      <div key={post.id} className="flex gap-4 p-4 bg-white rounded-xl border border-border hover:border-[#149CD8]/30 transition-all shadow-sm">
                        {post.imageUrl ? (
                          <img src={getImageUrl(post.imageUrl)} alt={post.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0"><ImageIcon className="w-5 h-5 text-muted-foreground" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category]}`}>{post.category}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(post.createdAt).toLocaleDateString("en-ZM", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </div>
                          <div className="font-semibold text-sm text-foreground truncate">{post.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{post.body}</div>
                        </div>
                        <button onClick={() => deletePost(post.id)} className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-red-100 hover:text-red-600 text-muted-foreground flex items-center justify-center transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {view === "list" && activeTab === "products" && (() => {
              const filtered = products.filter((p) => {
                const q = productSearch.toLowerCase();
                return (
                  p.name.toLowerCase().includes(q) ||
                  (p.sku && p.sku.toLowerCase().includes(q)) ||
                  (p.category && p.category.toLowerCase().includes(q))
                );
              });
              return (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-shrink-0 border-b border-border bg-slate-50/50">
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && filtered.every(p => selectedProductIds.includes(p.id))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            const toAdd = filtered.map(p => p.id);
                            setSelectedProductIds(prev => Array.from(new Set([...prev, ...toAdd])));
                          } else {
                            const toRemove = filtered.map(p => p.id);
                            setSelectedProductIds(prev => prev.filter(id => !toRemove.includes(id)));
                          }
                        }}
                        className="w-4 h-4 rounded text-[#003399] border-gray-300 focus:ring-[#003399] cursor-pointer"
                        title="Select All Filtered"
                      />
                      <div className="text-xs text-muted-foreground font-semibold whitespace-nowrap">{filtered.length} of {products.length} product{products.length !== 1 ? "s" : ""}</div>
                      <input
                        type="text"
                        placeholder="Search by name, SKU, or category..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full max-w-xs px-3 py-1.5 rounded-lg border border-border bg-white text-xs focus:outline-none focus:border-[#003399] transition-all"
                      />
                    </div>
                    <button onClick={() => { setProductForm({}); setView("newProduct"); }} className="flex items-center gap-2 bg-[#FF9933] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#e88820] transition-colors self-end sm:self-auto">
                      <Plus className="w-4 h-4" /> New Product
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 pt-3">
                    {filtered.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No products found matching "{productSearch}"</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map((product) => {
                          const isSelected = selectedProductIds.includes(product.id);
                          return (
                            <div key={product.id} className={`flex gap-3 p-4 bg-white rounded-xl border shadow-sm items-center transition-all ${product.hidden ? "border-amber-200 opacity-60" : "border-border"} ${isSelected ? "border-[#003399] ring-2 ring-[#003399]/15" : ""}`}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProductIds([...selectedProductIds, product.id]);
                                  } else {
                                    setSelectedProductIds(selectedProductIds.filter(id => id !== product.id));
                                  }
                                }}
                                className="w-4 h-4 rounded text-[#003399] border-gray-300 focus:ring-[#003399] cursor-pointer flex-shrink-0"
                              />
                              <div className="relative flex-shrink-0">
                                <img src={getImageUrl(product.image)} className="w-12 h-12 rounded bg-slate-100 object-cover" />
                                {product.hidden && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                                    <EyeOff className="w-2.5 h-2.5 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="font-semibold text-sm text-foreground truncate">{product.name}</div>
                                  {product.hidden && (
                                    <span className="text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">Hidden</span>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">{product.category} · {product.sku}</div>
                                <div className="text-sm font-bold text-[#003399] mt-1">{product.price} <span className="text-[10px] text-muted-foreground font-normal">{product.unit}</span></div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => toggleProductFeatured(product.id)}
                                  title={product.featured ? "Remove from homepage scroller" : "Add to homepage scroller"}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                    product.featured
                                      ? "bg-yellow-100 text-yellow-500 hover:bg-yellow-200"
                                      : "bg-slate-100 text-muted-foreground hover:text-yellow-500 hover:bg-yellow-100"
                                  }`}
                                >
                                  <Star className={`w-3.5 h-3.5 ${product.featured ? "fill-yellow-500" : ""}`} />
                                </button>
                                <button
                                  onClick={() => toggleProductVisibility(product.id)}
                                  title={product.hidden ? "Make visible" : "Hide from public"}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                    product.hidden
                                      ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                                      : "bg-slate-100 text-muted-foreground hover:text-amber-600 hover:bg-amber-100"
                                  }`}
                                >
                                  {product.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>
                                <button onClick={() => { setProductForm(product); setView("editProduct"); }} className="w-7 h-7 rounded-lg bg-slate-100 text-muted-foreground hover:text-[#003399] hover:bg-[#003399]/10 flex items-center justify-center transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDeleteProduct(product.id)} className="w-7 h-7 rounded-lg bg-slate-100 text-muted-foreground hover:text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {/* Bulk Actions Banner */}
                  {selectedProductIds.length > 0 && (
                    <div className="bg-[#003399] text-white px-6 py-3 flex items-center justify-between flex-shrink-0 border-t border-border shadow-2xl">
                      <div className="text-xs font-semibold">
                        {selectedProductIds.length} product{selectedProductIds.length !== 1 ? "s" : ""} selected
                      </div>
                      <div className="flex items-center gap-3">
                        <label className={`cursor-pointer bg-[#FF9933] hover:bg-[#e88820] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                          <Upload className="w-3.5 h-3.5" />
                          {isUploading ? "Uploading..." : "Upload Image to Selected"}
                          {!isUploading && (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleBulkImageUpload}
                              className="hidden"
                            />
                          )}
                        </label>
                        <button
                          onClick={() => setSelectedProductIds([])}
                          className="text-white/80 hover:text-white text-xs font-semibold"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── Settings Tab ── */}
            {view === "list" && activeTab === "settings" && (
              <div className="flex-1 overflow-y-auto p-6 space-y-8">

                {/* Company Info */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-[#003399]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Company Information</h3>
                    <button
                      onClick={async () => {
                        setIsSavingSettings(true);
                        const ok = await saveSetting("company", settingsForm);
                        setIsSavingSettings(false);
                        if (ok) {
                          const next: SiteSettings = { company: settingsForm, brands: brandsForm, testimonials: testimonialsForm, streams: streamsForm, categories: categoriesForm };
                          onSettingsChange?.(next);
                          showToast("Company info saved!");
                        } else { showToast("Failed to save.", false); }
                      }}
                      disabled={isSavingSettings}
                      className="flex items-center gap-1.5 bg-[#003399] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#0044cc] disabled:opacity-50 transition-colors"
                    >
                      {isSavingSettings ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {([
                      { key: "phone", label: "Phone (primary)", placeholder: "+260772071404" },
                      { key: "phone2", label: "Phone (secondary)", placeholder: "+260966669767" },
                      { key: "email", label: "Email", placeholder: "sales@chamrud.com" },
                      { key: "whatsapp", label: "WhatsApp Number", placeholder: "260772071404" },
                      { key: "address", label: "Street Address", placeholder: "15 Enock Kavu Road" },
                      { key: "city", label: "City / Area", placeholder: "Rhodes Park, Lusaka" },
                      { key: "country", label: "Country", placeholder: "Zambia" },
                      { key: "hours", label: "Business Hours", placeholder: "Mon–Fri 08:00–17:00 CAT" },
                    ] as { key: keyof SiteSettings["company"]; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 block">{label}</label>
                        <input
                          type="text"
                          value={settingsForm[key]}
                          placeholder={placeholder}
                          onChange={e => setSettingsForm(f => ({ ...f, [key]: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-white text-sm focus:border-[#003399] outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-[#003399]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Authorised Brands</h3>
                    <button
                      onClick={async () => {
                        setIsSavingSettings(true);
                        const ok = await saveSetting("brands", brandsForm);
                        setIsSavingSettings(false);
                        if (ok) {
                          onSettingsChange?.({ company: settingsForm, brands: brandsForm, testimonials: testimonialsForm, streams: streamsForm, categories: categoriesForm });
                          showToast("Brands saved!");
                        } else { showToast("Failed to save.", false); }
                      }}
                      disabled={isSavingSettings}
                      className="flex items-center gap-1.5 bg-[#003399] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#0044cc] disabled:opacity-50 transition-colors"
                    >
                      Save Brands
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {brandsForm.map((brand, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-[#003399]/8 border border-[#003399]/20 text-[#003399] text-xs font-semibold px-3 py-1.5 rounded-full">
                        {brand}
                        <button onClick={() => setBrandsForm(b => b.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 ml-1 font-bold leading-none">×</button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBrand}
                      placeholder="Add brand name…"
                      onChange={e => setNewBrand(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && newBrand.trim()) { setBrandsForm(b => [...b, newBrand.trim()]); setNewBrand(""); }}}
                      className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:border-[#003399] outline-none"
                    />
                    <button
                      onClick={() => { if (newBrand.trim()) { setBrandsForm(b => [...b, newBrand.trim()]); setNewBrand(""); }}}
                      className="bg-[#FF9933] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#e88820] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Testimonials */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-[#003399]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Testimonials</h3>
                    <button
                      onClick={async () => {
                        setIsSavingSettings(true);
                        const ok = await saveSetting("testimonials", testimonialsForm);
                        setIsSavingSettings(false);
                        if (ok) {
                          onSettingsChange?.({ company: settingsForm, brands: brandsForm, testimonials: testimonialsForm, streams: streamsForm, categories: categoriesForm });
                          showToast("Testimonials saved!");
                        } else { showToast("Failed to save.", false); }
                      }}
                      disabled={isSavingSettings}
                      className="flex items-center gap-1.5 bg-[#003399] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#0044cc] disabled:opacity-50 transition-colors"
                    >
                      Save Testimonials
                    </button>
                  </div>
                  <div className="space-y-3 mb-4">
                    {testimonialsForm.map((t, i) => (
                      <div key={i} className="border border-border rounded-xl p-4 bg-slate-50 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="grid grid-cols-2 gap-2 flex-1">
                            <input type="text" value={t.name} placeholder="Name" onChange={e => setTestimonialsForm(arr => arr.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} className="px-2 py-1.5 rounded-lg border border-border text-xs focus:border-[#003399] outline-none" />
                            <input type="text" value={t.role} placeholder="Role / Organisation" onChange={e => setTestimonialsForm(arr => arr.map((x, idx) => idx === i ? { ...x, role: e.target.value } : x))} className="px-2 py-1.5 rounded-lg border border-border text-xs focus:border-[#003399] outline-none" />
                          </div>
                          <button onClick={() => setTestimonialsForm(arr => arr.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 text-lg font-bold leading-none mt-1">×</button>
                        </div>
                        <textarea rows={2} value={t.text} placeholder="Testimonial text…" onChange={e => setTestimonialsForm(arr => arr.map((x, idx) => idx === i ? { ...x, text: e.target.value } : x))} className="w-full px-2 py-1.5 rounded-lg border border-border text-xs focus:border-[#003399] outline-none resize-none" />
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Rating:</span>
                          {[1,2,3,4,5].map(n => <button key={n} onClick={() => setTestimonialsForm(arr => arr.map((x, idx) => idx === i ? { ...x, rating: n } : x))} className={`text-lg leading-none ${t.rating >= n ? "text-amber-400" : "text-slate-200"}`}>★</button>)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border border-dashed border-border rounded-xl p-4 space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Add Testimonial</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={newTestimonial.name} placeholder="Name" onChange={e => setNewTestimonial(f => ({ ...f, name: e.target.value }))} className="px-2 py-1.5 rounded-lg border border-border text-xs focus:border-[#003399] outline-none" />
                      <input type="text" value={newTestimonial.role} placeholder="Role / Organisation" onChange={e => setNewTestimonial(f => ({ ...f, role: e.target.value }))} className="px-2 py-1.5 rounded-lg border border-border text-xs focus:border-[#003399] outline-none" />
                    </div>
                    <textarea rows={2} value={newTestimonial.text} placeholder="Testimonial text…" onChange={e => setNewTestimonial(f => ({ ...f, text: e.target.value }))} className="w-full px-2 py-1.5 rounded-lg border border-border text-xs focus:border-[#003399] outline-none resize-none" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(n => <button key={n} onClick={() => setNewTestimonial(f => ({ ...f, rating: n }))} className={`text-lg ${newTestimonial.rating >= n ? "text-amber-400" : "text-slate-200"}`}>★</button>)}
                      </div>
                      <button
                        onClick={() => {
                          if (!newTestimonial.name.trim() || !newTestimonial.text.trim()) return;
                          setTestimonialsForm(arr => [...arr, { ...newTestimonial }]);
                          setNewTestimonial({ name: "", role: "", text: "", rating: 5 });
                        }}
                        className="flex items-center gap-1.5 bg-[#FF9933] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#e88820] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Supply Streams */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-[#003399]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Chamrud Supply Streams</h3>
                    <button
                      onClick={async () => {
                        setIsSavingSettings(true);
                        const ok = await saveSetting("streams", streamsForm);
                        setIsSavingSettings(false);
                        if (ok) {
                          onSettingsChange?.({ company: settingsForm, brands: brandsForm, testimonials: testimonialsForm, streams: streamsForm, categories: categoriesForm });
                          showToast("Supply streams saved!");
                        } else { showToast("Failed to save.", false); }
                      }}
                      disabled={isSavingSettings}
                      className="flex items-center gap-1.5 bg-[#003399] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#0044cc] disabled:opacity-50 transition-colors"
                    >
                      Save Streams
                    </button>
                  </div>
                  <div className="space-y-4">
                    {streamsForm.map((s, idx) => (
                      <div key={idx} className="border border-border rounded-xl p-4 bg-slate-50 space-y-3">
                        <div className="font-bold text-xs text-foreground uppercase tracking-widest">{s.title}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-4 items-center">
                          <div className="relative group/img aspect-[4/3] rounded-lg overflow-hidden border border-border bg-slate-100 flex items-center justify-center">
                            <img src={getImageUrl(s.image)} className="w-full h-full object-cover" />
                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-[10px] text-white font-semibold cursor-pointer transition-opacity">
                              Upload
                              <input type="file" accept="image/*" className="hidden" onChange={e => handleSettingImageUpload(e, "stream", idx)} />
                            </label>
                          </div>
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={s.description}
                              placeholder="Description"
                              onChange={e => setStreamsForm(arr => arr.map((item, i) => i === idx ? { ...item, description: e.target.value } : item))}
                              className="w-full px-2 py-1.5 rounded-lg border border-border text-xs focus:border-[#003399] outline-none resize-none"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Image URL:</span>
                              <input
                                type="text"
                                value={s.image}
                                onChange={e => setStreamsForm(arr => arr.map((item, i) => i === idx ? { ...item, image: e.target.value } : item))}
                                className="flex-1 px-2 py-1 rounded border border-border text-xs focus:border-[#003399] outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product Categories */}
                <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-[#003399]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Product Categories</h3>
                    <button
                      onClick={async () => {
                        setIsSavingSettings(true);
                        const ok = await saveSetting("categories", categoriesForm);
                        setIsSavingSettings(false);
                        if (ok) {
                          onSettingsChange?.({ company: settingsForm, brands: brandsForm, testimonials: testimonialsForm, streams: streamsForm, categories: categoriesForm });
                          showToast("Product categories saved!");
                        } else { showToast("Failed to save.", false); }
                      }}
                      disabled={isSavingSettings}
                      className="flex items-center gap-1.5 bg-[#003399] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#0044cc] disabled:opacity-50 transition-colors"
                    >
                      Save Categories
                    </button>
                  </div>
                  <div className="space-y-4">
                    {categoriesForm.map((c, idx) => (
                      <div key={idx} className="border border-border rounded-xl p-4 bg-slate-50 space-y-3">
                        <div className="font-bold text-xs text-foreground uppercase tracking-widest">{c.title}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-4 items-center">
                          <div className="relative group/img aspect-[4/3] rounded-lg overflow-hidden border border-border bg-slate-100 flex items-center justify-center">
                            <img src={getImageUrl(c.image)} className="w-full h-full object-cover" />
                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-[10px] text-white font-semibold cursor-pointer transition-opacity">
                              Upload
                              <input type="file" accept="image/*" className="hidden" onChange={e => handleSettingImageUpload(e, "category", idx)} />
                            </label>
                          </div>
                          <div className="space-y-2">
                            <textarea
                              rows={2}
                              value={c.description}
                              placeholder="Description"
                              onChange={e => setCategoriesForm(arr => arr.map((item, i) => i === idx ? { ...item, description: e.target.value } : item))}
                              className="w-full px-2 py-1.5 rounded-lg border border-border text-xs focus:border-[#003399] outline-none resize-none"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Count:</span>
                                <input
                                  type="text"
                                  value={c.count}
                                  onChange={e => setCategoriesForm(arr => arr.map((item, i) => i === idx ? { ...item, count: e.target.value } : item))}
                                  className="w-full px-2 py-1 rounded border border-border text-xs focus:border-[#003399] outline-none"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold font-mono">Color:</span>
                                <input
                                  type="text"
                                  value={c.color}
                                  onChange={e => setCategoriesForm(arr => arr.map((item, i) => i === idx ? { ...item, color: e.target.value } : item))}
                                  className="w-full px-2 py-1 rounded border border-border text-xs focus:border-[#003399] outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Image URL:</span>
                              <input
                                type="text"
                                value={c.image}
                                onChange={e => setCategoriesForm(arr => arr.map((item, i) => i === idx ? { ...item, image: e.target.value } : item))}
                                className="flex-1 px-2 py-1 rounded border border-border text-xs focus:border-[#003399] outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Users Tab ── */}
            {view === "list" && activeTab === "users" && (
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 bg-white border-b border-border">
                  <div className="text-xs text-muted-foreground">{profiles.length} user{profiles.length !== 1 ? "s" : ""} registered</div>
                  <button
                    onClick={() => {
                      supabase
                        .from("profiles")
                        .select("*")
                        .order("created_at", { ascending: false })
                        .then(({ data }) => {
                          if (data) setProfiles(data);
                        });
                    }}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#003399] border border-border rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {profiles.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <Lock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No profiles found.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Registered At</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {profiles.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/50">
                              <td className="p-4 font-semibold text-foreground">{p.full_name || "—"}</td>
                              <td className="p-4 text-muted-foreground">{p.email}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold ${
                                  p.role === "admin"
                                    ? "bg-red-100 text-red-700 border border-red-200"
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}>
                                  {p.role}
                                </span>
                              </td>
                              <td className="p-4 text-muted-foreground">{new Date(p.created_at).toLocaleDateString("en-ZM", { day: "numeric", month: "short", year: "numeric" })}</td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => toggleUserRole(p.id, p.role)}
                                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all border cursor-pointer ${
                                    p.role === "admin"
                                      ? "bg-white text-slate-700 border-border hover:bg-slate-100"
                                      : "bg-[#003399] text-white border-transparent hover:bg-[#002266]"
                                  }`}
                                >
                                  {p.role === "admin" ? "Demote to Member" : "Promote to Admin"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* New Post View */}
            {view === "newPost" && (
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-white flex-shrink-0">
                  <button onClick={() => setView("list")} className="text-xs text-[#149CD8] hover:underline">← Back</button>
                  <span className="text-muted-foreground text-xs">/</span>
                  <span className="text-sm font-semibold text-foreground">New Post</span>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Category</label>
                    <div className="flex flex-wrap gap-2">
                      {(["Product", "Offer", "Announcement", "News"] as Post["category"][]).map((cat) => (
                        <button key={cat} onClick={() => setPostForm((f) => ({ ...f, category: cat }))} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${postForm.category === cat ? "bg-[#FF9933] text-white border-[#FF9933]" : "bg-white text-muted-foreground border-border hover:border-[#FF9933] hover:text-[#FF9933]"}`}>{cat}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Title *</label>
                    <input type="text" placeholder="Post title..." value={postForm.title} onChange={(e) => setPostForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-[#003399]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Description *</label>
                    <textarea rows={4} placeholder="Post body..." value={postForm.body} onChange={(e) => setPostForm((f) => ({ ...f, body: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-[#003399] resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Image URL</span>
                      <label className={`cursor-pointer flex items-center gap-1.5 text-xs font-medium text-[#149CD8] hover:text-[#003399] transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Upload className="w-3.5 h-3.5" />
                        {isUploading ? 'Uploading...' : 'Upload File'}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "post")} />
                      </label>
                    </label>
                    <input type="url" placeholder="https://..." value={postForm.imageUrl} onChange={(e) => setPostForm((f) => ({ ...f, imageUrl: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-[#003399]" />
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-border bg-white flex gap-3 flex-shrink-0">
                  <button onClick={() => setView("list")} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground">Cancel</button>
                  <button onClick={addPost} className="flex-1 py-3 rounded-xl bg-[#FF9933] text-white text-sm font-semibold hover:bg-[#e88820] flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Publish Post</button>
                </div>
              </div>
            )}

            {/* Product Form View (New/Edit) */}
            {(view === "newProduct" || view === "editProduct") && (
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-white flex-shrink-0">
                  <button onClick={() => setView("list")} className="text-xs text-[#149CD8] hover:underline">← Back</button>
                  <span className="text-muted-foreground text-xs">/</span>
                  <span className="text-sm font-semibold text-foreground">{view === "newProduct" ? "Add New Product" : "Edit Product"}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Name *</label>
                      <input type="text" value={productForm.name || ""} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border bg-white text-sm focus:border-[#003399] outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Price *</label>
                      <input type="text" placeholder="e.g. K 650" value={productForm.price || ""} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} className="w-full px-3 py-2 rounded-lg border bg-white text-sm focus:border-[#003399] outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Unit</label>
                      <input type="text" placeholder="e.g. per 40" value={productForm.unit || ""} onChange={e => setProductForm(f => ({ ...f, unit: e.target.value }))} className="w-full px-3 py-2 rounded-lg border bg-white text-sm focus:border-[#003399] outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Category</label>
                      <select value={productForm.category || "Diagnostics"} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 rounded-lg border bg-white text-sm focus:border-[#003399] outline-none">
                        <option value="Diagnostics">Diagnostics</option>
                        <option value="Reagents">Reagents</option>
                        <option value="Lab Consumables">Lab Consumables</option>
                        <option value="Microbiology Reagents">Microbiology Reagents</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Badge</label>
                      <select value={productForm.badge || "In Stock"} onChange={e => setProductForm(f => ({ ...f, badge: e.target.value }))} className="w-full px-3 py-2 rounded-lg border bg-white text-sm focus:border-[#003399] outline-none">
                        <option value="In Stock">In Stock</option>
                        <option value="Best Seller">Best Seller</option>
                        <option value="New">New</option>
                        <option value="CE Marked">CE Marked</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">SKU</label>
                      <input type="text" value={productForm.sku || ""} onChange={e => setProductForm(f => ({ ...f, sku: e.target.value }))} className="w-full px-3 py-2 rounded-lg border bg-white text-sm focus:border-[#003399] outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 flex items-center justify-between">
                        <span>Product Image</span>
                        <label className={`cursor-pointer flex items-center gap-1.5 bg-[#149CD8] text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-[#003399] transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                          <Upload className="w-3 h-3" />
                          {isUploading ? 'Uploading...' : 'Upload Image'}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "product")} />
                        </label>
                      </label>
                      {productForm.image && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-border bg-slate-50 flex items-center justify-center h-36">
                          <img
                            src={getImageUrl(productForm.image)}
                            alt="Product preview"
                            className="h-full w-full object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/uploads/reagent.png"; }}
                          />
                        </div>
                      )}
                      <input type="url" value={productForm.image || ""} onChange={e => setProductForm(f => ({ ...f, image: e.target.value }))} placeholder="https://... or upload a file above" className="w-full px-3 py-2 rounded-lg border bg-white text-sm focus:border-[#003399] outline-none" />
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-border bg-white flex gap-3 flex-shrink-0">
                  <button onClick={() => setView("list")} className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground">Cancel</button>
                  <button onClick={handleSaveProduct} className="flex-1 py-3 rounded-xl bg-[#003399] text-white text-sm font-semibold hover:bg-[#0044cc]">{view === "newProduct" ? "Add Product" : "Save Changes"}</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
