import express from "express";

const app = express();

type Transaction = {
  id: string;
  userId: string;
  amount: number;
  description: string;
  date: string;
};

const transactionsByUser: Record<string, Transaction[]> = {
  "123": [
    {
      id: "tx-1",
      userId: "123",
      amount: 59.9,
      description: "Netflix",
      date: "2026-03-01",
    },
    {
      id: "tx-2",
      userId: "123",
      amount: 24.5,
      description: "Uber",
      date: "2026-03-02",
    },
    {
      id: "tx-3",
      userId: "123",
      amount: 89.9,
      description: "iFood",
      date: "2026-03-03",
    },
  ],
  "456": [
    {
      id: "tx-4",
      userId: "456",
      amount: 120,
      description: "Shell",
      date: "2026-03-01",
    },
    {
      id: "tx-5",
      userId: "456",
      amount: 39.9,
      description: "Spotify",
      date: "2026-03-02",
    },
  ],
};

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "bank-mock",
    message: "Bank API mock",
  });
});

app.get("/transactions/:userId", (req, res) => {
  const { userId } = req.params;

  const transactions = transactionsByUser[userId] ?? [];

  res.status(200).json({
    userId,
    transactions,
  });
});

app.listen(3001, () => {
  console.log("Bank mock running on port 3001");
});