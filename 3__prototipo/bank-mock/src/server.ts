import express from "express";

const app = express();

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "bank-mock",
    message: "Bank API mock"
  });
});

app.listen(3001, () => {
  console.log("Bank mock running on port 3001");
});