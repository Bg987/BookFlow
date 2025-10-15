const axios = require("axios");

exports.getBookByISBN = async (req, res) => {
  const { isbn } = req.params;

  if (!isbn) return res.status(400).json({ message: "ISBN is required" });

  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    );
      console.log(response);
    const data = response.data;

    if (!data.items || data.items.length === 0) {
      return res
        .status(404)
        .json({ message: "Book not found in Google Books" });
    }

    const book = data.items[0].volumeInfo;

    const result = {
      isbn,
      title: book.title || "",
      authors: book.authors || [],
      publishers: book.publisher ? [book.publisher] : [],
      publish_places: [], // Google Books doesn’t provide this
      publish_date: book.publishedDate || "",
      number_of_pages: book.pageCount || 0,
      subjects: book.categories || [],
      cover: {
        small: book.imageLinks?.small || "",
        medium: book.imageLinks?.medium || "",
        large: book.imageLinks?.large || "",
      },
      description: book.description || "",
    };

    res.status(200).json({ data: result });
  } catch (err) {
    console.error("Google Books API error:", err.message);
    res.status(500).json({ message: "Failed to fetch book data" });
  }
};
