import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Models
import Vendor from "../models/Vendor.js";
import Menu from "../models/Menu.js";

// Constants (copied values to avoid import issues from React code directly in node)
const INITIAL_APPETIZERS = [
  {
    title: 'Paneer Tikka',
    description: 'Crispy and tangy paneer with complex Indian spices.',
    price: 450,
    image: 'https://images.unsplash.com/photo-1567184109411-b28f2703b142?q=80&w=800&auto=format&fit=crop',
    category: 'Appetizers',
    spiciness: 2
  },
  {
    title: 'Vegetable Borani',
    description: 'Creamy and rich vegetable appetizer with complex spices.',
    price: 380,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800&auto=format&fit=crop',
    category: 'Appetizers',
    spiciness: 1
  },
  {
    title: 'Crispy Samosa',
    description: 'Flaky pastry filled with spiced potatoes and peas.',
    price: 150,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop',
    category: 'Appetizers',
    spiciness: 1
  },
  {
    title: 'Gobi Manchurian',
    description: 'Crispy cauliflower florets tossed in a spicy soy-garlic sauce.',
    price: 320,
    image: 'https://images.unsplash.com/photo-1606491956689-2ea8c5119c85?q=80&w=800&auto=format&fit=crop',
    category: 'Appetizers',
    spiciness: 2
  },
  {
    title: 'Onion Bhaji',
    description: 'Crispy onion fritters seasoned with gram flour and spices.',
    price: 180,
    image: 'https://images.unsplash.com/photo-1626132646529-500637532537?q=80&w=800&auto=format&fit=crop',
    category: 'Appetizers',
    spiciness: 1
  },
  {
    title: 'Chicken 65',
    description: 'Spicy, deep-fried chicken tempered with curry leaves.',
    price: 420,
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=800&auto=format&fit=crop',
    category: 'Appetizers',
    spiciness: 3
  }
];

const INITIAL_MAINS = [
  {
    title: 'Spicy Chicken Tikka Masala',
    description: 'Fiery and rich curry with complex spices.',
    price: 450,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800&auto=format&fit=crop',
    category: 'Mains (Curries)',
    isFeatured: true,
    spiciness: 3
  },
  {
    title: 'Tangy Paneer Lababdar',
    description: 'Creamy tomato paneer with a tangy twist.',
    price: 450,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=800&auto=format&fit=crop',
    category: 'Mains (Curries)',
    spiciness: 2
  },
  {
    title: 'Vegetable Biryani',
    description: 'Fiery and rich curry with tangy spices.',
    price: 450,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=800&auto=format&fit=crop',
    category: 'Mains (Curries)',
    spiciness: 2
  }
];

const INITIAL_SIDES = [
  {
    title: 'Garlic Naan',
    description: 'Soft and buttery naan with a hint of garlic.',
    price: 50,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop',
    category: 'Sides (Naan, Roti)'
  },
  {
    title: 'Extra Tangy Sauce',
    description: 'Our signature tangy sauce for an extra kick.',
    price: 30,
    image: 'https://images.unsplash.com/photo-1585325701165-351af9ad665e?q=80&w=800&auto=format&fit=crop',
    category: 'Sides (Naan, Roti)'
  }
];

const INITIAL_DRINKS = [
  {
    title: 'Mango Lassi',
    description: 'Creamy yogurt drink with sweet mango pulp.',
    price: 120,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=800&auto=format&fit=crop',
    category: 'Drinks'
  },
  {
    title: 'Masala Chai',
    description: 'Authentic Indian spiced tea.',
    price: 60,
    image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?q=80&w=800&auto=format&fit=crop',
    category: 'Drinks'
  }
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/spice-haven";

    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for Seeding");

    // Clear previous data
    await Vendor.deleteMany({});
    await Menu.deleteMany({});
    console.log("Cleared old Vendors and Menus.");

    // 1. Create a Vendor
    const vendor = await Vendor.create({
      name: "Spice Haven Demo",
      ownerName: "Admin",
      phone: "1234567890",
      email: "demo@spicehaven.com",
      location: "Demo Street",
      isActive: true
    });
    console.log(`Created Vendor: ${vendor.name} (${vendor._id})`);

    // 2. Combine menu items
    const allItems = [
      ...INITIAL_APPETIZERS,
      ...INITIAL_MAINS,
      ...INITIAL_SIDES,
      ...INITIAL_DRINKS
    ];

    // 3. Create the Menu linked to Vendor
    const menu = await Menu.create({
      vendorId: vendor._id,
      items: allItems
    });
    console.log(`Created Menu with ${menu.items.length} items.`);

    console.log("Seeding complete!");
    process.exit(0);

  } catch (error) {
    console.error("Error Seeding DB:", error);
    process.exit(1);
  }
};

seedDB();
