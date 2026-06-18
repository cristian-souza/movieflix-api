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

app.use(express.json());

app.get("/movies", async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: "asc",
        },
        include: {
            genres: true,
            languages: true,
        },
    });
    res.json(movies);
});

app.post("/movies", async (req, res) => {
    console.log(`Conteúdo do body enviado na requisição : ${req.body.title}`);

    const { title, genre_id, language_id, oscar_count, release_date } =
        req.body;

    try {
        const movieWithSameTitle = await prisma.movie.findFirst({
            where: { title: { equals: title, mode: "insensitive" } },
        });

        if (movieWithSameTitle) {
            return res.status(409).send({
                message: "Já existe um filme cadastrado com esse título",
            });
        }

        await prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date),
            },
        });
    } catch (error) {
        return res.status(500).send({ message: "Falha ao cadastrar o filme" });
    }

    res.status(201).send();
});

app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}`);
});
