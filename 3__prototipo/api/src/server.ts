import express from "express";

const app = express();

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "api",
    message: "Hello from API"
  });
});

app.listen(3000, () => {
  console.log("API running on port 3000");
});