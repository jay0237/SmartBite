const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, minlength: 6 },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        isVerified: { type: Boolean, default: false },
        avatar: { type: String, default: "" },
        phone: { type: String, default: "" },
        address: { type: String, default: "" },
        // Favorites — stores dish (Product) ObjectIds
        favorites: {
            dishes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
        },
    },
    { timestamps: true }
);

// Hash password before save — Mongoose v9 async middleware (no next())
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
    return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);
