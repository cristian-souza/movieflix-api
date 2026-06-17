INSERT INTO genres (name)
SELECT genre.name
FROM (
  VALUES
    (1, 'Ação'),
    (2, 'Suspense'),
    (3, 'Aventura'),
    (4, 'Terror'),
    (5, 'Drama'),
    (6, 'Comédia'),
    (7, 'Romance')
) AS genre(sort_order, name)
WHERE NOT EXISTS (
  SELECT 1 FROM genres WHERE genres.name = genre.name
)
ORDER BY genre.sort_order;

INSERT INTO languages (name)
SELECT language.name
FROM (
  VALUES
    (1, 'Português'),
    (2, 'Inglês'),
    (3, 'Espanhol'),
    (4, 'Japonês'),
    (5, 'Francês')
) AS language(sort_order, name)
WHERE NOT EXISTS (
  SELECT 1 FROM languages WHERE languages.name = language.name
)
ORDER BY language.sort_order;

INSERT INTO movies (title, release_date, genre_id, language_id, oscar_count)
SELECT movie.title, movie.release_date::date, genre.id, language.id, movie.oscar_count
FROM (
  VALUES
    ('A grande aposta', '2016-01-14', 'Aventura', 'Francês', 10),
    ('A rede social', '2010-12-03', 'Drama', 'Inglês', 1),
    ('A grande aposta', '2016-01-14', 'Ação', 'Inglês', NULL),
    ('Parasita', '2019-05-30', 'Drama', 'Inglês', NULL),
    ('Uma mente brilhante', '2002-02-15', 'Aventura', 'Inglês', NULL),
    ('O jogo da imitação', '2014-09-28', 'Aventura', 'Inglês', NULL),
    ('Gênio indomável', '1998-02-20', 'Ação', 'Inglês', NULL),
    ('Cisne negro', '2011-02-04', 'Drama', 'Inglês', 1),
    ('Duna', '2021-10-21', 'Ação', 'Inglês', NULL),
    ('Turma da mônica: lições', '2021-12-30', 'Aventura', 'Português', NULL),
    ('Minha mãe é uma peça 3', '2019-12-26', 'Comédia', 'Português', NULL),
    ('High Life', '2018-11-07', 'Ação', 'Francês', NULL),
    ('Mademoiselle vingança', '2018-09-12', 'Romance', 'Francês', 1)
) AS movie(title, release_date, genre_name, language_name, oscar_count)
JOIN genres AS genre ON genre.name = movie.genre_name
JOIN languages AS language ON language.name = movie.language_name
WHERE NOT EXISTS (
  SELECT 1
  FROM movies
  WHERE movies.title = movie.title
    AND movies.release_date = movie.release_date::date
    AND movies.genre_id = genre.id
    AND movies.language_id = language.id
);
