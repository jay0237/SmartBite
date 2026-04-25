const Restaurant = require("../models/Restaurant");

const sampleRestaurants = [
    {
        name: "Pizzeria Bella",
        image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500&h=300&fit=crop",
        cuisine: ["Italian", "Pizza"],
        rating: 4.8,
        deliveryTime: "25-35 min",
        location: "Downtown, City Center",
        isOpen: true,
        description: "Authentic Italian pizzas made with fresh ingredients and traditional recipes.",
        minOrder: 200,
        deliveryFee: 30,
        menu: [
            {
                title: "Margherita Pizza",
                desc: "Fresh mozzarella, basil, and tomato sauce",
                price: 350,
                image01: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=300&h=300&fit=crop",
                category: "Pizza",
            },
            {
                title: "Pepperoni Pizza",
                desc: "Loaded with pepperoni and mozzarella",
                price: 400,
                image01: "https://images.unsplash.com/photo-1628840042765-356cda07f4ee?w=300&h=300&fit=crop",
                category: "Pizza",
            },
            {
                title: "Garlic Bread",
                desc: "Crispy bread with garlic butter",
                price: 150,
                image01: "https://images.unsplash.com/photo-1599599810694-b5ac4dd64b73?w=300&h=300&fit=crop",
                category: "Starters",
            },
        ],
        totalOrders: 1250,
    },
    {
        name: "Spice Route",
        image: "https://images.unsplash.com/photo-1585521537230-cc2deecda82d?w=500&h=300&fit=crop",
        cuisine: ["Indian", "North Indian"],
        rating: 4.6,
        deliveryTime: "30-40 min",
        location: "Midtown, Restaurant Row",
        isOpen: true,
        description: "Authentic Indian cuisine with traditional recipes and aromatic spices.",
        minOrder: 250,
        deliveryFee: 40,
        menu: [
            {
                title: "Butter Chicken",
                desc: "Tender chicken in creamy tomato sauce",
                price: 450,
                image01: "https://images.unsplash.com/photo-1565557623814-dea6fb1d4e3d?w=300&h=300&fit=crop",
                category: "Main Course",
            },
            {
                title: "Biryani",
                desc: "Fragrant rice with meat and spices",
                price: 350,
                image01: "https://images.unsplash.com/photo-1585521537230-cc2deecda82d?w=300&h=300&fit=crop",
                category: "Main Course",
            },
            {
                title: "Naan",
                desc: "Soft Indian bread",
                price: 80,
                image01: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=300&fit=crop",
                category: "Bread",
            },
        ],
        totalOrders: 980,
    },
    {
        name: "Dragon Wok",
        image: "https://images.unsplash.com/photo-1609501676725-7186f017a4b0?w=500&h=300&fit=crop",
        cuisine: ["Chinese", "Asian"],
        rating: 4.5,
        deliveryTime: "20-30 min",
        location: "East Side, Chinatown",
        isOpen: true,
        description: "Authentic Chinese cuisine with wok-fired dishes and fresh ingredients.",
        minOrder: 200,
        deliveryFee: 25,
        menu: [
            {
                title: "Kung Pao Chicken",
                desc: "Spicy chicken with peanuts",
                price: 320,
                image01: "https://images.unsplash.com/photo-1609501676725-7186f017a4b0?w=300&h=300&fit=crop",
                category: "Main Course",
            },
            {
                title: "Fried Rice",
                desc: "Egg fried rice with vegetables",
                price: 250,
                image01: "https://images.unsplash.com/photo-1609501676725-7186f017a4b0?w=300&h=300&fit=crop",
                category: "Rice",
            },
            {
                title: "Spring Rolls",
                desc: "Crispy rolls with vegetable filling",
                price: 180,
                image01: "https://images.unsplash.com/photo-1609501676725-7186f017a4b0?w=300&h=300&fit=crop",
                category: "Starters",
            },
        ],
        totalOrders: 750,
    },
    {
        name: "Taco Fiesta",
        image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&h=300&fit=crop",
        cuisine: ["Mexican", "Street Food"],
        rating: 4.4,
        deliveryTime: "15-25 min",
        location: "West End, Food Court",
        isOpen: true,
        description: "Authentic Mexican street food with fresh ingredients and bold flavors.",
        minOrder: 150,
        deliveryFee: 20,
        menu: [
            {
                title: "Chicken Tacos",
                desc: "Soft tortillas with grilled chicken",
                price: 280,
                image01: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&h=300&fit=crop",
                category: "Tacos",
            },
            {
                title: "Burrito",
                desc: "Filled with rice, beans, and meat",
                price: 320,
                image01: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&h=300&fit=crop",
                category: "Main Course",
            },
            {
                title: "Guacamole & Chips",
                desc: "Fresh guacamole with crispy chips",
                price: 150,
                image01: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&h=300&fit=crop",
                category: "Starters",
            },
        ],
        totalOrders: 620,
    },
    {
        name: "Sushi Paradise",
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&h=300&fit=crop",
        cuisine: ["Japanese", "Sushi"],
        rating: 4.7,
        deliveryTime: "35-45 min",
        location: "Uptown, Premium District",
        isOpen: true,
        description: "Premium Japanese sushi and authentic Asian cuisine.",
        minOrder: 400,
        deliveryFee: 50,
        menu: [
            {
                title: "California Roll",
                desc: "Crab, avocado, and cucumber",
                price: 450,
                image01: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=300&fit=crop",
                category: "Sushi",
            },
            {
                title: "Salmon Nigiri",
                desc: "Fresh salmon on rice",
                price: 380,
                image01: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=300&fit=crop",
                category: "Sushi",
            },
            {
                title: "Miso Soup",
                desc: "Traditional Japanese soup",
                price: 120,
                image01: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=300&fit=crop",
                category: "Soup",
            },
        ],
        totalOrders: 540,
    },
    {
        name: "Burger Barn",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=300&fit=crop",
        cuisine: ["American", "Burgers"],
        rating: 4.3,
        deliveryTime: "20-30 min",
        location: "South Side, Main Street",
        isOpen: true,
        description: "Juicy burgers and classic American comfort food.",
        minOrder: 200,
        deliveryFee: 30,
        menu: [
            {
                title: "Classic Cheeseburger",
                desc: "Beef patty with cheddar cheese",
                price: 280,
                image01: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop",
                category: "Burgers",
            },
            {
                title: "Bacon Burger",
                desc: "Beef patty with crispy bacon",
                price: 320,
                image01: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop",
                category: "Burgers",
            },
            {
                title: "French Fries",
                desc: "Crispy golden fries",
                price: 120,
                image01: "https://images.unsplash.com/photo-1585238341710-4b4e6416baeb?w=300&h=300&fit=crop",
                category: "Sides",
            },
        ],
        totalOrders: 890,
    },
];

const seedRestaurants = async () => {
    try {
        // Clear existing restaurants
        await Restaurant.deleteMany({});

        // Insert sample restaurants
        const result = await Restaurant.insertMany(sampleRestaurants);
        console.log(`✅ ${result.length} restaurants seeded successfully`);
        return result;
    } catch (error) {
        console.error("❌ Error seeding restaurants:", error.message);
        throw error;
    }
};

module.exports = seedRestaurants;
