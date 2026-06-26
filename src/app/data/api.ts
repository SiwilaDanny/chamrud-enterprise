import { supabase } from "../../lib/supabase";

// ─── Image URL helper ────────────────────────────────────────────────────────
// Handles Supabase Storage URLs, legacy /uploads/ paths, and external URLs.
export function getImageUrl(imagePath: string): string {
  if (!imagePath) return "/uploads/reagent.png";

  // Already an absolute URL (Supabase Storage, external CDN, etc.)
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    try {
      const url = new URL(imagePath);
      // Strip localhost origin — keep only the path for local dev compatibility
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        return url.pathname;
      }
    } catch {
      return imagePath;
    }
    return imagePath;
  }

  // Relative path (legacy /uploads/…)
  return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: string;
  unit: string;
  category: string;
  badge: string;
  image: string;
  hidden?: boolean;
  featured?: boolean;
  description?: string;
  source?: string;
  sourceUrl?: string;
  sourceCategory?: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  imageUrl: string;
  category: "Product" | "Offer" | "Announcement" | "News";
  createdAt: string;
}



// ─── Supabase row ↔ Product shape adapters ───────────────────────────────────
// Supabase uses snake_case; our frontend uses camelCase.
function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id:             String(row.id),
    name:           String(row.name),
    sku:            String(row.sku ?? ""),
    price:          String(row.price ?? ""),
    unit:           String(row.unit ?? ""),
    category:       String(row.category ?? ""),
    badge:          String(row.badge ?? ""),
    image:          String(row.image ?? ""),
    hidden:         Boolean(row.hidden),
    featured:       Boolean(row.featured),
    description:    row.description != null ? String(row.description) : undefined,
    source:         row.source != null ? String(row.source) : undefined,
    sourceUrl:      row.source_url != null ? String(row.source_url) : undefined,
    sourceCategory: row.source_category != null ? String(row.source_category) : undefined,
  };
}

function productToRow(p: Product) {
  return {
    id:              p.id,
    name:            p.name,
    sku:             p.sku,
    price:           p.price,
    unit:            p.unit,
    category:        p.category,
    badge:           p.badge,
    image:           p.image,
    hidden:          p.hidden ?? false,
    featured:        p.featured ?? false,
    description:     p.description ?? null,
    source:          p.source ?? null,
    source_url:      p.sourceUrl ?? null,
    source_category: p.sourceCategory ?? null,
  };
}

function rowToPost(row: Record<string, unknown>): Post {
  return {
    id:        String(row.id),
    title:     String(row.title),
    body:      String(row.body ?? ""),
    imageUrl:  String(row.image_url ?? ""),
    category:  (row.category as Post["category"]) ?? "Product",
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function postToRow(p: Post) {
  return {
    id:         p.id,
    title:      p.title,
    body:       p.body,
    image_url:  p.imageUrl,
    category:   p.category,
    created_at: p.createdAt,
  };
}

// ─── PRODUCTS ───────────────────────────────────────────────────────────────
// Read via backend proxy so the Supabase key never reaches the browser.
export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data as Record<string, unknown>[]).map(rowToProduct);
  } catch (error) {
    console.error("[api] fetchProducts error:", error);
    return [];
  }
}

/**
 * Save a single product (upsert). Used for add/edit operations.
 */
export async function saveProduct(product: Product): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("products")
      .upsert(productToRow(product), { onConflict: "id" });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[api] saveProduct error:", error);
    return false;
  }
}

/**
 * Save multiple products at once (bulk upsert — used by admin panel
 * operations that update the whole list, e.g. visibility toggle).
 */
export async function saveProducts(products: Product[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("products")
      .upsert(products.map(productToRow), { onConflict: "id" });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[api] saveProducts error:", error);
    return false;
  }
}

/**
 * Delete a product by id.
 */
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[api] deleteProduct error:", error);
    return false;
  }
}

// ─── POSTS ───────────────────────────────────────────────────────────────────
// Read via backend proxy so the Supabase key never reaches the browser.
export async function fetchPosts(): Promise<Post[]> {
  try {
    const res = await fetch("/api/posts");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data as Record<string, unknown>[]).map(rowToPost);
  } catch (error) {
    console.error("[api] fetchPosts error:", error);
    return [];
  }
}

/**
 * Upsert a single post.
 */
export async function savePost(post: Post): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("posts")
      .upsert(postToRow(post), { onConflict: "id" });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[api] savePost error:", error);
    return false;
  }
}

/**
 * Save an entire posts array (bulk upsert, keeps backward compat with
 * AdminPanel which passes the full updated array).
 */
export async function savePosts(posts: Post[]): Promise<boolean> {
  try {
    // Upsert all posts that should exist
    const { error } = await supabase
      .from("posts")
      .upsert(posts.map(postToRow), { onConflict: "id" });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[api] savePosts error:", error);
    return false;
  }
}

/**
 * Delete a single post by id.
 */
export async function deletePost(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[api] deletePost error:", error);
    return false;
  }
}

// ─── IMAGE UPLOAD ─────────────────────────────────────────────────────────────
const BUCKET = "chamrud-images";

export async function uploadImage(file: File): Promise<string | null> {
  try {
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    return data.publicUrl;
  } catch (error) {
    console.error("[api] uploadImage error:", error);
    // Graceful fallback: try the local Express endpoint if Supabase fails
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("local upload failed");
      const json = await res.json();
      return json.url as string;
    } catch {
      return null;
    }
  }
}

// ─── INQUIRIES ───────────────────────────────────────────────────────────────
export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  receivedAt: string;
}

function rowToInquiry(row: Record<string, unknown>): Inquiry {
  return {
    id:         String(row.id),
    name:       String(row.name ?? ""),
    email:      String(row.email ?? ""),
    subject:    row.subject != null ? String(row.subject) : undefined,
    message:    String(row.message ?? ""),
    receivedAt: String(row.received_at ?? new Date().toISOString()),
  };
}

export async function fetchInquiries(): Promise<Inquiry[]> {
  try {
    const { data, error } = await supabase
      .from("inquiries").select("*").order("received_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToInquiry);
  } catch (e) { console.error("[api] fetchInquiries:", e); return []; }
}

export async function saveInquiry(inquiry: Omit<Inquiry, "id" | "receivedAt">): Promise<boolean> {
  try {
    const { error } = await supabase.from("inquiries").insert({
      name: inquiry.name, email: inquiry.email,
      subject: inquiry.subject ?? null, message: inquiry.message,
    });
    if (error) throw error;
    return true;
  } catch (e) { console.error("[api] saveInquiry:", e); return false; }
}

export async function deleteInquiry(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("inquiries").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (e) { console.error("[api] deleteInquiry:", e); return false; }
}

export interface StreamItem {
  title: string;
  description: string;
  category: string;
  image: string;
  links?: string[];
}

export interface CategoryItem {
  title: string;
  description: string;
  image: string;
  count: string;
  color: string;
  category: string;
  search: string;
}

export interface SiteSettings {
  company: {
    phone: string; phone2: string; email: string; whatsapp: string;
    address: string; city: string; country: string; hours: string;
  };
  brands: string[];
  testimonials: Array<{ name: string; role: string; text: string; rating: number }>;
  streams: StreamItem[];
  categories: CategoryItem[];
}

export const DEFAULT_SETTINGS: SiteSettings = {
  company: {
    phone: "+260772071404", phone2: "+260966669767",
    email: "sales@chamrud.com", whatsapp: "260772071404",
    address: "15 Enock Kavu Road", city: "Rhodes Park, Lusaka",
    country: "Zambia", hours: "Mon–Fri 08:00–17:00 CAT",
  },
  brands: ["Thermo Fisher Scientific","Eppendorf","Bio-Rad","RapidLabs","Accurate","Viva Test","Beckman Coulter"],
  testimonials: [
    { name: "Fairview Hospital", role: "Procurement — Lusaka, Zambia", rating: 5,
      text: "Chamrud Enterprise consistently delivers quality reagents on time. Their dedicated service and attention to our supply needs makes them our preferred supplier." },
    { name: "Kanyama General Hospital", role: "Medical Supplies — Lusaka, Zambia", rating: 5,
      text: "We have been sourcing medical consumables and diagnostic kits from Chamrud for several years. Competitive pricing and a reliable supply chain every time." },
    { name: "Royal Hospital", role: "Laboratory Department — Lusaka, Zambia", rating: 5,
      text: "The breadth of their catalogue is excellent. From basic lab supplies to pharmaceuticals — Chamrud Enterprise is our single-source supplier of choice in Zambia." },
  ],
  streams: [
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
  ],
  categories: [
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
  ],
};

// Read via backend proxy so the Supabase key never reaches the browser.
export async function fetchSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch("/api/settings");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as Array<{ key: string; value: unknown }>;
    const map: Record<string, unknown> = {};
    for (const row of data) map[row.key] = row.value;
    return {
      company:      (map.company      as SiteSettings["company"])      ?? DEFAULT_SETTINGS.company,
      brands:       (map.brands       as string[])                     ?? DEFAULT_SETTINGS.brands,
      testimonials: (map.testimonials as SiteSettings["testimonials"]) ?? DEFAULT_SETTINGS.testimonials,
      streams:      (map.streams      as SiteSettings["streams"])      ?? DEFAULT_SETTINGS.streams,
      categories:   (map.categories   as SiteSettings["categories"])   ?? DEFAULT_SETTINGS.categories,
    };
  } catch (e) { console.error("[api] fetchSettings:", e); return DEFAULT_SETTINGS; }
}

export async function saveSetting(key: string, value: unknown): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("site_settings").upsert({ key, value }, { onConflict: "key" });
    if (error) throw error;
    return true;
  } catch (e) { console.error("[api] saveSetting:", e); return false; }
}
