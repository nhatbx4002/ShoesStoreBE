import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import index from "./routes/index.js";
import prisma from "./libs/prisma.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", index);

app.get("/", (req, res) => {
    res.json({ message: "Shoe Store BE is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    try {
        await prisma.$connect();
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
});

process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    await prisma.$disconnect();
    process.exit(0);
});
