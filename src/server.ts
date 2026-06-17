import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import express from "express";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("./generated/client");

const app = express();
const port = 3000;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL não foi definida no arquivo .env");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

app.get("/movies", async (_, res) => {
        const movies = await prisma.movie.findMany({
            orderBy: {
                title: "asc",
            },
            include: {
                genres: true,
                languages: true,
            }
        });
        res.json(movies);
});
    

app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`);
});
