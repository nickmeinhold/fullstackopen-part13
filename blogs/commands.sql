CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  author text,
  url text NOT NULL,
  title text NOT NULL,
  likes integer DEFAULT 0
);

INSERT INTO blogs (author, url, title, likes) VALUES
  ('Dan Abramov', 'https://overreacted.io/goodbye-clean-code/', 'Goodbye, Clean Code', 10),
  ('Martin Fowler', 'https://martinfowler.com/articles/is-quality-worth-cost.html', 'Is High Quality Software Worth the Cost?', 5);
