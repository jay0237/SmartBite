require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Product = require("../models/Product");

const products = [
    { title: "Classic Cheeseburger", price: 299, category: "Burger", image01: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80", image02: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80", image03: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=500&q=80", desc: "A juicy 100% beef patty topped with melted cheddar cheese, fresh lettuce, and our signature Smart Bite sauce.", isFeatured: true },
    { title: "Spicy Crispy Chicken Burger", price: 349, category: "Burger", image01: "https://images.unsplash.com/photo-1615719413546-198b25453f85?auto=format&fit=crop&w=500&q=80", image02: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=500&q=80", image03: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80", desc: "Golden-fried spicy chicken breast, spicy mayo, pickles, and crisp lettuce on a toasted bun." },
    { title: "BBQ Bacon Burger", price: 379, category: "Burger", image01: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=500&q=80", image02: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80", image03: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80", desc: "Smoky BBQ sauce, crispy bacon strips, caramelized onions, and a thick beef patty on a brioche bun." },
    { title: "Margherita Pizza", price: 349, category: "Pizza", image01: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80", image02: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80", image03: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80", desc: "Classic Italian pizza with double mozzarella, fresh basil, and tangy tomato sauce.", isFeatured: true },
    { title: "Chicken Tikka Pizza", price: 399, category: "Pizza", image01: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80", image02: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80", image03: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80", desc: "Tender chicken tikka pieces, red onion, and fresh coriander on a creamy tikka masala base." },
    { title: "Mexican Green Wave Pizza", price: 379, category: "Pizza", image01: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80", image02: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80", image03: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80", desc: "Spicy jalapenos, crisp capsicum, and onions with a generous layer of hot Mexican herbs." },
    { title: "Premium Sushi Platter", price: 799, category: "Sushi", image01: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80", image02: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=500&q=80", image03: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?auto=format&fit=crop&w=500&q=80", desc: "A deluxe assortment of fresh salmon, tuna nigiri, and signature rolls.", isFeatured: true },
    { title: "Dragon Roll Sushi", price: 549, category: "Sushi", image01: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?auto=format&fit=crop&w=500&q=80", image02: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80", image03: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?auto=format&fit=crop&w=500&q=80", desc: "Shrimp tempura inside, topped with avocado slices and a drizzle of spicy mayo." },
    { title: "Loaded Nachos", price: 199, category: "Snacks", image01: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=500&q=80", image02: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=500&q=80", image03: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=500&q=80", desc: "Crispy tortilla chips loaded with melted cheese, jalapeños, sour cream, guacamole, and salsa." },
    { title: "Garlic Bread with Dip", price: 129, category: "Snacks", image01: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=500&q=80", image02: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=500&q=80", image03: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=500&q=80", desc: "Toasted garlic butter bread served with a creamy marinara dipping sauce." },
    { title: "Grilled Chicken Wrap", price: 249, category: "Snacks", image01: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=80", image02: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=80", image03: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=80", desc: "Tender grilled chicken, fresh veggies, and garlic sauce wrapped in a warm flour tortilla." },
    { title: "Tropical Mango Smoothie", price: 149, category: "Drinks", image01: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=500&q=80", image02: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=500&q=80", image03: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=500&q=80", desc: "A refreshing blend of sweet mangoes and tropical juices." },
    { title: "Iced Caramel Macchiato", price: 129, category: "Drinks", image01: "https://images.unsplash.com/photo-1461023058943-0708e5bc4b14?auto=format&fit=crop&w=500&q=80", image02: "https://images.unsplash.com/photo-1461023058943-0708e5bc4b14?auto=format&fit=crop&w=500&q=80", image03: "https://images.unsplash.com/photo-1461023058943-0708e5bc4b14?auto=format&fit=crop&w=500&q=80", desc: "Chilled espresso served over ice with milk and caramel syrup." },
    { title: "Fresh Lemonade", price: 89, category: "Drinks", image01: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=500&q=80", image02: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=500&q=80", image03: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=500&q=80", desc: "Freshly squeezed lemons with mint and honey, served over crushed ice." },
    { title: "Chocolate Lava Cake", price: 179, category: "Desserts", image01: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80", image02: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80", image03: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80", desc: "Warm chocolate cake with a gooey molten center, served with vanilla ice cream." },
    { title: "Strawberry Cheesecake", price: 199, category: "Desserts", image01: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=500&q=80", image02: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=500&q=80", image03: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=500&q=80", desc: "Creamy New York-style cheesecake topped with fresh strawberry compote." },
];

const seed = async () => {
    await connectDB();

    // Clear existing
    await User.deleteMany();
    await Product.deleteMany();

    // Create admin
    await User.create({
        name: "Admin User",
        email: "admin@smartbite.com",
        password: "admin123",
        role: "admin",
        isVerified: true,
    });

    // Seed products
    await Product.insertMany(products);

    console.log("✅ Database seeded successfully!");
    console.log("   Admin: admin@smartbite.com / admin123");
    process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
