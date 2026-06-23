import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import express from "express";
import { createRequire } from "module";
import fs from "fs";
import swaggerUi from "swagger-ui-express";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("./generated/client");

let swaggerDocument;
try {
  const swaggerPath = new URL("../swagger.json", import.meta.url);
  const content = fs.readFileSync(swaggerPath, "utf8");
  swaggerDocument = JSON.parse(content || "{}");
} catch (err) {
  swaggerDocument = {};
}

const app = express();
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
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

  const { title, genre_id, language_id, oscar_count, release_date } = req.body;

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

app.put("/movies/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const movie = await prisma.movie.findUnique({
      where: {
        id,
      },
    });

    if (!movie) {
      return res.status(404).send({ message: "Filme não encontrado" });
    }

    const data = { ...req.body };
    data.release_date = data.release_dtae
      ? new Date(data.release_date)
      : undefined;

    await prisma.movie.update({
      where: {
        id,
      },
      data: data,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Falha ao atualizar o registro do filme" });
  }
  res.status(200).send();
});

app.delete("/movies/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const movie = await prisma.movie.findUnique({
      where: {
        id,
      },
    });

    if (!movie) {
      return res.status(404).send({ message: "Filme não encontrado" });
    }

    await prisma.movie.delete({ where: { id } });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Falha ao deletar o registro do filme" });
  }

  res.status(200).send();
});

app.get("/movies/:genreName", async (req, res) => {
  try {
    const moviesFilteredByGenreName = await prisma.movie.findMany({
      include: {
        genres: true,
        languages: true,
      },
      where: {
        genres: {
          name: { equals: req.params.genreName, mode: "insensitive" },
        },
      },
    });

    res.status(200).send(moviesFilteredByGenreName);
  } catch (error) {
    res.status(500).send({ message: "Falha ao filtrar filmes pelo gênero" });
  }
});

app.listen(port, () => {
  console.log(`Servidor em execução em http://localhost:${port}`);
});
