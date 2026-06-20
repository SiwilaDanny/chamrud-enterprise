import fs from "fs";

const DB_FILE = "db.json";
const PAGE_FILES = Array.from({ length: 20 }, (_, index) => `/tmp/rapid-all-products-p${index + 1}.json`);
const CATEGORY_FILES = ["/tmp/rapid-categories-p1.json", "/tmp/rapid-categories-p2.json"];
const RAPID_SOURCE = "Rapid Labs";
const ROOT_CATEGORY_MAP = {
  "Diagnostic Products": "Diagnostics",
  Readers: "Equipment",
  PCR: "Diagnostics",
  "SARS Cov 2 Molecular Transport Media": "Diagnostics",
  "Glass & Plastic Vials & Bottles": "Lab Consumables",
  "Glass Boston Bottles": "Lab Consumables",
  "Caps and Closures": "Lab Consumables",
  "Dropper/Pipette Assemblies": "Lab Consumables",
  "Shop Pots & Jars": "Lab Consumables",
  "Shop by Industry": "Lab Consumables",
  "Other Products & Services": "Lab Consumables",
  "Special Offers": "Lab Consumables",
  Uncategorised: "Lab Consumables",
  "5ml Bottles": "Lab Consumables",
  "10ml Bottles": "Lab Consumables",
  "15ml Bottles": "Lab Consumables",
  "20ml Bottles": "Lab Consumables",
  "30ml Bottles": "Lab Consumables",
  "50ml Bottles": "Lab Consumables",
  "100ml Bottles": "Lab Consumables",
  "Bamboo Range": "Lab Consumables",
  Candle: "Lab Consumables",
};

function stripHtml(value = "") {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;|&ndash;/g, "-")
    .replace(/&#038;|&amp;/g, "&")
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function decodeText(value = "") {
  return stripHtml(value)
    .replace(/&#8211;|&ndash;/g, "-")
    .replace(/&#038;|&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function stripPriceText(value = "") {
  return value
    .replace(/[£$€]\s?\d+(?:[.,]\d+)?(?:\s*(?:per|each|\/)\s*[a-z]+)?/gi, "")
    .replace(/\bK\s?\d+(?:[.,]\d+)?\b/gi, "")
    .replace(/\b(?:price|priced at|cost)\s*[:\-]?\s*(?:on request|[£$€K]?\s?\d+(?:[.,]\d+)?)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getSourceCategory(product) {
  const categories = (product.categories || [])
    .map((category) => decodeText(category.name))
    .filter((name) => name && name !== "Diagnostic Products");

  return categories[0] || "Rapid Labs Products";
}

function getPack(description) {
  const match = description.match(
    /\bPack:\s*(.*?)(?:\s+(?:Specimen|Format|Reading Time|CE Status|Cat\. NO\.|Product Features):|$)/i,
  );
  return match ? `Pack: ${match[1].trim()}` : "Quote only";
}

function normalize(value = "") {
  return decodeText(value)
    .toLowerCase()
    .replace(/sku:/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(test|tests|rapid|cassette|cassettes|strip|strips|device|devices|pack|box|ea|eac)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildCategoryHelpers(categories) {
  const byId = new Map(categories.map((category) => [category.id, category]));

  function ancestors(categoryId) {
    const chain = [];
    let current = byId.get(categoryId);
    while (current) {
      chain.push(current);
      current = byId.get(current.parent);
    }
    return chain;
  }

  function hasAncestor(categoryId, ancestorId) {
    return ancestors(categoryId).some((category) => category.id === ancestorId);
  }

  return { ancestors, hasAncestor };
}

const rapidCategories = CATEGORY_FILES.flatMap((file) => JSON.parse(fs.readFileSync(file, "utf8")));
const categoryHelpers = buildCategoryHelpers(rapidCategories);

function isVeterinaryProduct(product) {
  const categoryIds = (product.categories || []).map((category) => category.id);
  const hasVeterinaryCategory = categoryIds.some((id) =>
    categoryHelpers.hasAncestor(id, 157) || [7056, 7057, 7058].includes(id),
  );
  const text = [
    product.name,
    product.description,
    product.short_description,
    (product.categories || []).map((category) => category.name).join(" "),
  ].join(" ");

  return hasVeterinaryCategory || /\b(veterinary|canine|feline|companion animal|large animal|equine)\b/i.test(stripHtml(text));
}

function appCategoryFor(product) {
  const roots = (product.categories || [])
    .flatMap((category) => categoryHelpers.ancestors(category.id))
    .filter((category) => category.parent === 0)
    .map((category) => decodeText(category.name));
  const mapped = roots.map((root) => ROOT_CATEGORY_MAP[root]).find(Boolean);
  if (mapped) return mapped;

  const text = [product.name, product.description, product.short_description, getSourceCategory(product)].join(" ");
  if (/\b(reader|analyzer|analyser|instrument)\b/i.test(text)) return "Equipment";
  if (/\b(reagent|media|agar|serum|buffer|stain|control)\b/i.test(text)) return "Reagents";
  if (/\b(test|diagnostic|rapid|covid|serology|pcr)\b/i.test(text)) return "Diagnostics";
  return "Lab Consumables";
}

function toChamrudProduct(product) {
  const description = stripPriceText(stripHtml(product.description || product.short_description || ""));
  const image = product.images?.[0]?.thumbnail || product.images?.[0]?.src || "/uploads/reagent.png";
  const sku = product.sku ? `SKU: ${decodeText(product.sku)}` : `RL-${product.id}`;

  return {
    id: `rapidlabs_${product.id}`,
    name: decodeText(product.name),
    sku,
    price: "",
    unit: getPack(description),
    category: appCategoryFor(product),
    badge: "Rapid Labs",
    image,
    description,
    source: RAPID_SOURCE,
    sourceUrl: product.permalink,
    sourceCategory: getSourceCategory(product),
  };
}

function rapidCoversLocalProduct(localProduct, rapidProducts) {
  if (localProduct.category === "Diagnostics") return true;

  const localName = normalize(localProduct.name);
  const localSku = normalize(localProduct.sku);
  if (!localName) return false;

  const localTokens = new Set(localName.split(" ").filter((token) => token.length > 2));
  return rapidProducts.some((rapidProduct) => {
    const rapidName = normalize(rapidProduct.name);
    const rapidSku = normalize(rapidProduct.sku);
    if (localSku && rapidSku && localSku === rapidSku) return true;
    if (rapidName === localName || rapidName.includes(localName)) return true;
    if (localTokens.size < 2) return false;
    const rapidTokens = new Set(rapidName.split(" "));
    const overlap = [...localTokens].filter((token) => rapidTokens.has(token)).length;
    return overlap / localTokens.size >= 0.8;
  });
}

const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
const importedRawProducts = PAGE_FILES.flatMap((file) => JSON.parse(fs.readFileSync(file, "utf8")));
const rapidProducts = importedRawProducts.filter((product) => !isVeterinaryProduct(product)).map(toChamrudProduct);
const existingProducts = (db.products || [])
  .filter((product) => product.source !== RAPID_SOURCE)
  .filter((product) => !rapidCoversLocalProduct(product, rapidProducts))
  .map((product) => {
    const text = `${product.name || ""} ${product.sku || ""}`;
    let category = product.category;
    let sourceCategory = product.sourceCategory;
    if (/abx.*(minclean|minilyse|minidil)|\b(minclean|minilyse|minidil)\b/i.test(text)) {
      category = "Hematology";
      sourceCategory = "ABX Hematology Reagents";
    } else if (/abx\s*c\s?200|abx\s*c200/i.test(text)) {
      category = "Reagents";
      sourceCategory = "ABX C200 Chemistry Reagents";
    }
    return { ...product, category, sourceCategory, price: "", hidden: false };
  });

db.products = [...existingProducts, ...rapidProducts];

fs.writeFileSync(DB_FILE, `${JSON.stringify(db, null, 2)}\n`);

console.log(`Imported ${rapidProducts.length} Rapid Labs products into ${DB_FILE}.`);
console.log(`Kept ${existingProducts.length} Chamrud-only products.`);
