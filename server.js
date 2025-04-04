const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

let window = [];

const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNzQ2MjU1LCJpYXQiOjE3NDM3NDU5NTUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImY1YzUxNWJlLWY4OWYtNDJmZC04OTgxLTdhNmE4NzM3YTZlNyIsInN1YiI6ImUyMmNzZXUwNzM4QGJlbm5ldHQuZWR1LmluIn0sImVtYWlsIjoiZTIyY3NldTA3MzhAYmVubmV0dC5lZHUuaW4iLCJuYW1lIjoic2FtcmF0aCIsInJvbGxObyI6ImUyMmNzZXUwNzM4IiwiYWNjZXNzQ29kZSI6InJ0Q0haSiIsImNsaWVudElEIjoiZjVjNTE1YmUtZjg5Zi00MmZkLTg5ODEtN2E2YTg3MzdhNmU3IiwiY2xpZW50U2VjcmV0IjoidHlhZnRDelFWWFh4TXFFSCJ9.1u7OAIsmEnXPmBRYChzmcoljU0DYCpaxRJNgk5e286w";
const ID_TO_URL = {
  p: "http://20.244.56.144/evaluation-service/primes",
  f: "http://20.244.56.144/evaluation-service/fibo",
  e: "http://20.244.56.144/evaluation-service/even",
  r: "http://20.244.56.144/evaluation-service/rand",
};
const fetchWithTimeout = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 500,
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });
    return response.data.numbers || [];
  } catch (error) {
    console.error("Fetch error or timeout:", error.message);
    return [];
  }
};

app.get("/numbers/:numberid", async (req, res) => {
  const { numberid } = req.params;
  const url = ID_TO_URL[numberid];

  if (!url) {
    return res.status(400).json({ error: "Invalid number ID" });
  }

  const windowPrevState = [...window];

  const newNumbers = await fetchWithTimeout(url);

  for (const num of newNumbers) {
    if (!window.includes(num)) {
      if (window.length >= WINDOW_SIZE) {
        window.shift(); 
      }
      window.push(num);
    }
  }

  const avg =
    window.length > 0
      ? parseFloat(
          (window.reduce((sum, val) => sum + val, 0) / window.length).toFixed(2)
        )
      : 0;

  res.json({
    windowPrevState,
    windowCurrState: [...window],
    numbers: newNumbers,
    avg,
  });
});

app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
