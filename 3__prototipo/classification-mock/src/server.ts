import express from "express";

const app = express();

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "classification-mock",
    message: "Classification API mock"
  });
});

app.listen(3002, () => {
  console.log("Classification mock running on port 3002");
});