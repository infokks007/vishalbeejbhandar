const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const DB_FILE = path.join(__dirname, 'db.json');

// --- Seed Data for local DB file ---
const SEED_PRODUCTS = [
  {
    id: "p1",
    name: "Indofil M-45 Fungicide",
    brand: "Indofil",
    category: "Fungicides",
    price: 250,
    mrp: 290,
    unit: "500g",
    short_desc: "Trusted contact fungicide for broad-spectrum control of crop diseases.",
    description: "Indofil M-45 is a contact fungicide of Mancozeb group, which remains on the plant surface and interferes with biochemical processes of fungi. It is effective against wide range of diseases including blights, downy mildew, leaf spots, and rusts in vegetables, fruits, and field crops.",
    specialities: ["Broad spectrum control", "Provides zinc and manganese nutrition", "Easy dispersion in water", "Excellent sticks-on property"],
    image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=500&q=70",
    stock: 120,
    rating: 4.8,
    featured: true,
    tags: ["fungicide", "blight", "mancozeb", "indofil", "leaf spot", "rust"]
  },
  {
    id: "p2",
    name: "Seminis Abhilash Tomato Seeds",
    brand: "Seminis",
    category: "Vegetable Seeds",
    price: 420,
    mrp: 480,
    unit: "10g",
    short_desc: "High-yielding tomato hybrid with excellent firmness and uniform deep red color.",
    description: "Seminis Abhilash is a premium tomato hybrid seed known for prolific bearing, high yield potential, and exceptional shelf life. It is highly resistant to major tomato diseases and thrives in diverse climatic conditions, making it the favorite of Indian tomato farmers.",
    specialities: ["Fruits are square round and firm", "Average weight: 80-90 grams", "Excellent transportability", "Harvesting starts in 65-70 days"],
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=70",
    stock: 85,
    rating: 4.9,
    featured: true,
    tags: ["tomato", "seeds", "seminis", "hybrid", "vegetable"]
  },
  {
    id: "p3",
    name: "Clause Durga Chilli Seeds",
    brand: "Clause",
    category: "Vegetable Seeds",
    price: 350,
    mrp: 390,
    unit: "10g",
    short_desc: "Highly pungent green-to-red hybrid chilli seeds with high yield.",
    description: "Durga is a premium F1 hybrid hot pepper variety from Clause seeds. It features erect, highly vigorous plants producing attractive, dark green slender fruits that turn brilliant red at maturity. Known for high pungency and excellent fruit quality.",
    specialities: ["High pungency (teekha)", "Fruit length: 8-10 cm", "Excellent tolerance to leaf curl virus", "Prolific continuous harvesting"],
    image: "https://images.unsplash.com/photo-1588252393763-677218025291?w=500&q=70",
    stock: 60,
    rating: 4.7,
    featured: true,
    tags: ["chilli", "seeds", "clause", "hybrid", "vegetable", "hot pepper"]
  },
  {
    id: "p4",
    name: "Indofil Avtar Fungicide",
    brand: "Indofil",
    category: "Fungicides",
    price: 680,
    mrp: 750,
    unit: "500g",
    short_desc: "Systemic and contact fungicide for dual action crop protection.",
    description: "Avtar is a combination fungicide containing Zineb and Hexaconazole. It offers both contact and systemic protection, making it highly effective against difficult-to-control diseases like powdery mildew, rust, and leaf spots.",
    specialities: ["Dual action (systemic + contact)", "Quick absorption by leaves", "Provides protective and curative action", "Improves crop greenness and yield"],
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=500&q=70",
    stock: 45,
    rating: 4.6,
    featured: false,
    tags: ["fungicide", "mildew", "indofil", "avtar", "powdery", "rust"]
  },
  {
    id: "p5",
    name: "Seminis Ankur Cauliflower Seeds",
    brand: "Seminis",
    category: "Vegetable Seeds",
    price: 510,
    mrp: 580,
    unit: "10g",
    short_desc: "Uniform, snow-white compact curds hybrid cauliflower seeds.",
    description: "Ankur is a popular early cauliflower hybrid from Seminis. It forms dense, snow-white curds protected by excellent self-wrapping leaves. Highly suitable for early winter cultivation with outstanding market pricing.",
    specialities: ["Pure white compact curds", "Avg curd weight: 1.0 to 1.5 kg", "Strong self-blanching leaf habit", "Harvest in 60-65 days after transplanting"],
    image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ecf?w=500&q=70",
    stock: 40,
    rating: 4.8,
    featured: true,
    tags: ["cauliflower", "seeds", "seminis", "vegetable", "cole"]
  },
  {
    id: "p6",
    name: "Clause F1 Hybrid Gourd Seeds",
    brand: "Clause",
    category: "Vegetable Seeds",
    price: 180,
    mrp: 210,
    unit: "20g",
    short_desc: "Prolific bottle gourd hybrid seeds producing straight tender green gourds.",
    description: "Clause F1 Hybrid Bottle Gourd produces highly uniform, attractive cylindrical light-green fruits. The plants are vigorous, branching heavily to generate high yields over a long harvesting period.",
    specialities: ["Tender skin with slow seed development", "Avg length: 30-35 cm", "High tolerance to weather fluctuations", "Excellent cooking quality"],
    image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=500&q=70",
    stock: 90,
    rating: 4.5,
    featured: false,
    tags: ["gourd", "seeds", "clause", "hybrid", "vegetable", "cucurbit"]
  },
  {
    id: "p7",
    name: "Indofil Z-78 Fungicide",
    brand: "Indofil",
    category: "Fungicides",
    price: 310,
    mrp: 350,
    unit: "500g",
    short_desc: "Zinc-based broad spectrum protective fungicide.",
    description: "Indofil Z-78 contains Zineb, a coordinator of zinc ions and ethylene bisdithiocarbamate. It acts as a protective shield on foliage, preventing spore germination while supplying essential Zinc nutrition to plants.",
    specialities: ["Contains 15% Zinc element", "Broad spectrum protective action", "Safe for most crops", "Controls downy mildew and leaf spots"],
    image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=500&q=70",
    stock: 70,
    rating: 4.5,
    featured: false,
    tags: ["fungicide", "indofil", "z-78", "zinc", "protection"]
  },
  {
    id: "p8",
    name: "Seminis Virat Cabbage Seeds",
    brand: "Seminis",
    category: "Vegetable Seeds",
    price: 460,
    mrp: 520,
    unit: "10g",
    short_desc: "High uniformity, bluish-green compact hybrid cabbage seeds.",
    description: "Seminis Virat is a premium F1 cabbage hybrid with high field standing ability. It produces attractive round, dense heads with a beautiful bluish-green color and sweet, tender taste suitable for fresh market sales.",
    specialities: ["Highly compact and uniform heads", "Head weight: 1.2 to 1.8 kg", "Outstanding field holding capacity (20-25 days)", "Tolerance to Black Rot"],
    image: "https://images.unsplash.com/photo-1587334206501-12f638dfd544?w=500&q=70",
    stock: 55,
    rating: 4.7,
    featured: false,
    tags: ["cabbage", "seeds", "seminis", "vegetable", "cole"]
  },
  {
    id: "p9",
    name: "Premium Urea Fertilizer (N-46%)",
    brand: "Other",
    category: "Fertilizers",
    price: 299,
    mrp: 350,
    unit: "50kg",
    short_desc: "High-grade nitrogen fertilizer to boost vegetative growth and green foliage.",
    description: "Our Premium Urea contains 46% nitrogen. It is highly soluble in water and soil, providing immediate nitrogen availability to crops to ensure fast vegetative growth, strong stems, and lush green leaves.",
    specialities: ["46% Nitrogen content", "100% water-soluble prills", "Suitable for all crops", "Promotes fast growth and branching"],
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=70",
    stock: 300,
    rating: 4.8,
    featured: true,
    tags: ["fertilizer", "urea", "nitrogen", "growth"]
  },
  {
    id: "p10",
    name: "Single Super Phosphate (SSP)",
    brand: "Other",
    category: "Fertilizers",
    price: 450,
    mrp: 500,
    unit: "50kg",
    short_desc: "Phosphate fertilizer enriched with Sulphur and Calcium for root development.",
    description: "Single Super Phosphate (SSP) supplies critical Phosphorus (16%), Sulphur (11%), and Calcium (21%). It is essential for strong root establishment, early crop maturity, and robust seed production.",
    specialities: ["Triple nutrient boost (P, S, Ca)", "Enhances root structure", "Improves oil content in oilseeds", "Improves soil structure"],
    image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=500&q=70",
    stock: 150,
    rating: 4.6,
    featured: false,
    tags: ["fertilizer", "phosphate", "ssp", "root", "sulphur"]
  },
  {
    id: "p11",
    name: "Potassium Nitrate (13-0-45)",
    brand: "Other",
    category: "Plant Nutrition",
    price: 180,
    mrp: 220,
    unit: "1kg",
    short_desc: "Fully water-soluble foliar spray fertilizer for fruit and flower booster.",
    description: "NOP Potassium Nitrate provides soluble Nitrogen (13%) and Potassium (45%). It is ideal for fruit sizing, color development, flower retention, and improving crop resistance to drought and disease stresses.",
    specialities: ["100% water-soluble foliar fertilizer", "High potassium content (45%)", "Boosts fruit size, taste and color", "Reduces flower drop"],
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=70",
    stock: 110,
    rating: 4.7,
    featured: false,
    tags: ["nutrition", "potassium", "nitrate", "foliar", "fertilizer"]
  },
  {
    id: "p12",
    name: "Micro-Nutrient Liquid Booster",
    brand: "Other",
    category: "Plant Nutrition",
    price: 240,
    mrp: 290,
    unit: "250ml",
    short_desc: "Concentrated micronutrient formula to cure leaf yellowing and nutrient deficiencies.",
    description: "This crop booster is a concentrated formulation of EDTA-chelated micronutrients including Zinc, Iron, Manganese, Copper, Boron, and Molybdenum. It ensures rapid absorption through leaf spraying, quickly resolving deficiency symptoms.",
    specialities: ["Edta chelated formula", "Cures yellowing and stunted growth", "Compatible with most pesticides", "Highly cost-effective"],
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&q=70",
    stock: 80,
    rating: 4.9,
    featured: true,
    tags: ["nutrition", "micronutrient", "zinc", "boron", "yellowing", "booster"]
  }
];

function hashPass(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return 'h' + Math.abs(h);
}

const SEED_USERS = [
  { id: "u1", name: "Store Owner", email: "admin@vbb.com", password: hashPass("Abhay@1985"), phone: "8804428490", provider: "email", role: "admin" },
  { id: "u2", name: "Rajesh Kumar", email: "rajesh@gmail.com", password: hashPass("farmer"), phone: "9876543210", provider: "email", role: "customer" },
  { id: "u3", name: "Vikram Singh", email: "vikram@gmail.com", password: hashPass("1234"), phone: "8804428490", provider: "email", role: "customer" }
];

const SEED_LEDGER = [
  { id: "L1", customer_id: "u2", customer_name: "Rajesh Kumar", customer_phone: "9876543210", customer_email: "rajesh@gmail.com", date: "2026-05-25", bill_no: "VBB-2026-101", description: "Purchased Indofil M-45 Fungicide & Clause Seeds", debit: 4500, credit: 2500, due: 2000 },
  { id: "L2", customer_id: "u2", customer_name: "Rajesh Kumar", customer_phone: "9876543210", customer_email: "rajesh@gmail.com", date: "2026-05-28", bill_no: "VBB-2026-108", description: "Paid outstanding dues for May bill", debit: 0, credit: 2000, due: 0 },
  { id: "L3", customer_id: "u3", customer_name: "Vikram Singh", customer_phone: "8804428490", customer_email: "vikram@gmail.com", date: "2026-06-01", bill_no: "VBB-2026-112", description: "Purchased Seminis Abhilash Tomato Seeds & Urea", debit: 3400, credit: 3400, due: 0 }
];

const SEED_ORDERS = [
  {
    id: "o1",
    customer_name: "Rajesh Kumar",
    customer_email: "rajesh@gmail.com",
    customer_phone: "9876543210",
    items: [
      { id: "p1", name: "Indofil M-45 Fungicide", price: 250, qty: 2, unit: "500g" },
      { id: "p2", name: "Seminis Abhilash Tomato Seeds", price: 420, qty: 1, unit: "10g" }
    ],
    total: 920,
    status: "Delivered",
    address: "Naya Bhojpur, Buxar, Bihar",
    created_at: Date.now() - 5 * 24 * 60 * 60 * 1000
  },
  {
    id: "o2",
    customer_name: "Vikram Singh",
    customer_email: "vikram@gmail.com",
    customer_phone: "8804428490",
    items: [
      { id: "p5", name: "Seminis Ankur Cauliflower Seeds", price: 510, qty: 4, unit: "10g" }
    ],
    total: 2040,
    status: "Processing",
    address: "Dumraon, Buxar, Bihar",
    created_at: Date.now() - 1 * 24 * 60 * 60 * 1000
  }
];

const SEED_MESSAGES = [
  { id: "m1", name: "Ramesh Sharma", email: "ramesh@gmail.com", phone: "9988776655", subject: "Bulk enquiry for Urea", message: "Hi, I need 50 bags of Urea fertilizer for my wheat crop. Do you provide doorstep delivery to Dumraon?", status: "new", created_at: Date.now() - 2 * 24 * 60 * 60 * 1000 }
];

const SEED_COUPONS = [
  { id: "c1", code: "WELCOME10", discount_type: "percentage", discount_value: 10, min_order: 500, expiry: "2026-12-31", max_uses: 500, used_count: 23, active: true },
  { id: "c2", code: "KISAN50", discount_type: "fixed", discount_value: 50, min_order: 300, expiry: "2026-09-30", max_uses: 200, used_count: 12, active: true },
  { id: "c3", code: "MONSOON20", discount_type: "percentage", discount_value: 20, min_order: 1000, expiry: "2026-08-31", max_uses: 100, used_count: 0, active: true }
];

// --- DB helpers ---
function getDb() {
  if (!fs.existsSync(DB_FILE)) {
    const defaultDb = {
      products: SEED_PRODUCTS,
      users: SEED_USERS,
      ledger: SEED_LEDGER,
      orders: SEED_ORDERS,
      messages: SEED_MESSAGES,
      coupons: SEED_COUPONS
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf8');
    return defaultDb;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return { products: [], users: [], ledger: [], orders: [], messages: [], coupons: [] };
  }
}

function saveDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

// --- Body parser helper ---
function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body));
    req.on('error', err => reject(err));
  });
}

// --- Request Handler ---
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = parsedUrl.pathname;
  
  // Normalize paths to ignore prefix if served behind a proxy subpath
  if (pathname.includes('/tables/')) {
    pathname = pathname.substring(pathname.indexOf('/tables/'));
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API Endpoint: /tables/:table ---
  if (pathname.startsWith('/tables/')) {
    res.setHeader('Content-Type', 'application/json');
    const parts = pathname.split('/').filter(Boolean); // [tables, tableName, id]
    const table = parts[1];
    const id = parts[2];

    const db = getDb();
    if (!db[table]) {
      db[table] = []; // Initialize table on the fly
    }

    try {
      if (req.method === 'GET') {
        if (id) {
          const row = db[table].find(r => String(r.id) === String(id));
          if (!row) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: `Row ${id} not found in ${table}` }));
            return;
          }
          res.writeHead(200);
          res.end(JSON.stringify(row));
        } else {
          let list = db[table];
          const searchVal = parsedUrl.searchParams.get('search');
          if (searchVal) {
            const query = searchVal.toLowerCase();
            list = list.filter(item => 
              Object.values(item).some(val => String(val).toLowerCase().includes(query))
            );
          }
          res.writeHead(200);
          res.end(JSON.stringify({ data: list }));
        }
        return;
      }

      if (req.method === 'POST') {
        const bodyText = await getBody(req);
        const data = JSON.parse(bodyText || '{}');
        const newId = table.charAt(0) + Math.random().toString(36).substring(2, 9);
        const newRow = {
          id: newId,
          created_at: Date.now(),
          ...data
        };
        db[table].push(newRow);
        saveDb(db);
        res.writeHead(201);
        res.end(JSON.stringify(newRow));
        return;
      }

      if (req.method === 'PUT' || req.method === 'PATCH') {
        if (!id) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Missing row ID for update' }));
          return;
        }
        const index = db[table].findIndex(r => String(r.id) === String(id));
        if (index === -1) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: `Row ${id} not found in ${table}` }));
          return;
        }
        const bodyText = await getBody(req);
        const data = JSON.parse(bodyText || '{}');
        db[table][index] = {
          ...db[table][index],
          ...data,
          id: db[table][index].id // Keep ID constant
        };
        saveDb(db);
        res.writeHead(200);
        res.end(JSON.stringify(db[table][index]));
        return;
      }

      if (req.method === 'DELETE') {
        if (!id) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Missing row ID for deletion' }));
          return;
        }
        const index = db[table].findIndex(r => String(r.id) === String(id));
        if (index === -1) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: `Row ${id} not found in ${table}` }));
          return;
        }
        db[table].splice(index, 1);
        saveDb(db);
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok' }));
        return;
      }
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Database operation failed', message: err.message }));
      return;
    }
  }

  // --- Static File Server ---
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(__dirname, reqPath);

  // Guard against directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Access Denied');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('404 File Not Found');
      } else {
        res.writeHead(500);
        res.end('500 Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌿 Vishal Beej Bhandar local server is active!`);
  console.log(`🌐 Store URL:     http://localhost:${PORT}/index.html`);
  console.log(`🛠️  Admin Panel:   http://localhost:${PORT}/admin.html`);
  console.log(`🗄️  Database URL:  http://localhost:${PORT}/tables/products`);
  console.log(`======================================================\n`);
});
