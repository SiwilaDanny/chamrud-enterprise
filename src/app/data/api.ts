const API_URL = "http://localhost:3001/api";

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
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
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
    return [];
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
