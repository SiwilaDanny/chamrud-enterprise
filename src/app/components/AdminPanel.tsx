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
  Star
} from "lucide-react";
import { fetchPosts, savePosts, fetchProducts, saveProducts, uploadImage, getImageUrl, Post, Product } from "../data/api";

const ADMIN_PASSWORD = "chamrud2024";
const AUTH_KEY = "chamrud_admin_auth";

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
}

export default function AdminPanel({ onClose, onPostsChange, onProductsChange }: AdminPanelProps) {
  const [authed, setAuthed] = useState(() => !!localStorage.getItem(AUTH_KEY));
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [authError, setAuthError] = useState("");
  
  const [activeTab, setActiveTab] = useState<"posts" | "products">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [view, setView] = useState<"list" | "newPost" | "newProduct" | "editProduct">("list");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [postForm, setPostForm] = useState({
    title: "",
    body: "",
    imageUrl: "",
    category: "Product" as Post["category"],
  });

  const [productForm, setProductForm] = useState<Partial<Product>>({});

  useEffect(() => {
    if (authed) {
      fetchPosts().then(p => {
        setPosts(p);
        onPostsChange(p);
      });
      fetchProducts().then(setProducts);
    }
  }, [authed]);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  function login() {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "1");
      setAuthed(true);
      setAuthError("");
    } else {
      setAuthError("Incorrect password. Please try again.");
    }
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setPassword("");
    onClose();
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
    const updated = [newPost, ...posts];
    setPosts(updated);
    await savePosts(updated);
    onPostsChange(updated);
    setPostForm({ title: "", body: "", imageUrl: "", category: "Product" });
    setView("list");
    showToast("Post published to homepage!");
  }

  async function deletePost(id: string) {
    const updated = posts.filter((p) => p.id !== id);
    setPosts(updated);
    await savePosts(updated);
    onPostsChange(updated);
    showToast("Post removed.");
  }

  // --- PRODUCTS ---
  async function saveProduct() {
    if (!productForm.name?.trim()) {
      showToast("Product name is required.", false);
      return;
    }
    
    let updated: Product[];
    if (view === "newProduct") {
      const newProduct: Product = {
        id: crypto.randomUUID(),
        name: productForm.name.trim(),
        sku: productForm.sku?.trim() || `SKU-${Date.now()}`,
        price: productForm.price.trim(),
        unit: productForm.unit?.trim() || "per unit",
        category: productForm.category || "Consumables",
        badge: productForm.badge || "In Stock",
        image: productForm.image?.trim() || "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=300&h=300&fit=crop&auto=format"
      };
      updated = [newProduct, ...products];
    } else {
      updated = products.map(p => p.id === productForm.id ? { ...p, ...productForm } as Product : p);
    }
    
    setProducts(updated);
    onProductsChange(updated);
    await saveProducts(updated);
    setView("list");
    showToast(view === "newProduct" ? "Product added!" : "Product updated!");
  }

  async function deleteProduct(id: string) {
    if(!confirm("Are you sure you want to delete this product?")) return;
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    onProductsChange(updated);
    await saveProducts(updated);
    showToast("Product removed.");
  }

  async function toggleProductVisibility(id: string) {
    const updated = products.map(p =>
      p.id === id ? { ...p, hidden: !p.hidden } : p
    );
    setProducts(updated);
    onProductsChange(updated);
    await saveProducts(updated);
    const product = updated.find(p => p.id === id);
    showToast(product?.hidden ? "Product hidden from public." : "Product is now visible.");
  }

  async function toggleProductFeatured(id: string) {
    const updated = products.map(p =>
      p.id === id ? { ...p, featured: !p.featured } : p
    );
    setProducts(updated);
    onProductsChange(updated);
    await saveProducts(updated);
    const product = updated.find(p => p.id === id);
    showToast(product?.featured ? "Added to homepage scroller!" : "Removed from homepage scroller.");
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

  async function handleBulkImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const url = await uploadImage(file);
    setIsUploading(false);
    
    if (url) {
      const updated = products.map(p => 
        selectedProductIds.includes(p.id) ? { ...p, image: url } : p
      );
      setProducts(updated);
      onProductsChange(updated);
      await saveProducts(updated);
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
            <p className="text-sm text-muted-foreground mb-8 text-center max-w-xs">Enter your admin password to manage homepage content and products.</p>
            <div className="w-full max-w-sm space-y-3">
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#003399]/30 focus:border-[#003399] transition-all"
                />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authError && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {authError}</p>}
              <button onClick={login} className="w-full bg-[#003399] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#FF9933] transition-colors">Sign In</button>
            </div>
          </div>
        ) : (
          /* Authed Layout */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tabs */}
            {view === "list" && (
              <div className="flex border-b border-border bg-slate-50 px-6 pt-4 gap-4">
                <button
                  onClick={() => { setActiveTab("posts"); setSelectedProductIds([]); }}
                  className={`pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === "posts" ? "border-[#003399] text-[#003399]" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  Manage Posts
                </button>
                <button
                  onClick={() => { setActiveTab("products"); setSelectedProductIds([]); }}
                  className={`pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === "products" ? "border-[#003399] text-[#003399]" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  Manage Products
                </button>
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
                                <button onClick={() => deleteProduct(product.id)} className="w-7 h-7 rounded-lg bg-slate-100 text-muted-foreground hover:text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
                  <button onClick={saveProduct} className="flex-1 py-3 rounded-xl bg-[#003399] text-white text-sm font-semibold hover:bg-[#0044cc]">{view === "newProduct" ? "Add Product" : "Save Changes"}</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
