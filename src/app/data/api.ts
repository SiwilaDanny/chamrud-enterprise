import catalogData from "../../../db.json";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const API_URL = `${API_BASE_URL}/api`;

export function getImageUrl(imagePath: string) {
  if (!imagePath) return "/uploads/reagent.png";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    try {
      const url = new URL(imagePath);
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        return url.pathname;
      }
    } catch {
      return imagePath;
    }

    return imagePath;
  }

  return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
}

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
  description?: string;
  source?: string;
  sourceUrl?: string;
  sourceCategory?: string;
}

const STATIC_CATALOG = catalogData as { products?: Product[]; posts?: Post[] };

export function getStaticProducts() {
  return STATIC_CATALOG.products || [];
}

export function getStaticPosts() {
  return STATIC_CATALOG.posts || [];
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return getStaticProducts();
  }
}

export async function saveProducts(products: Product[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(products),
    });
    return res.ok;
  } catch (error) {
    console.error("Error saving products:", error);
    return false;
  }
}

export async function uploadImage(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

export interface Post {
  id: string;
  title: string;
  body: string;
  imageUrl: string;
  category: "Product" | "Offer" | "Announcement" | "News";
  createdAt: string;
}

export async function fetchPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${API_URL}/posts`);
    if (!res.ok) throw new Error("Failed to fetch posts");
    return await res.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    return getStaticPosts();
  }
}

export async function savePosts(posts: Post[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(posts),
    });
    return res.ok;
  } catch (error) {
    console.error("Error saving posts:", error);
    return false;
  }
}
