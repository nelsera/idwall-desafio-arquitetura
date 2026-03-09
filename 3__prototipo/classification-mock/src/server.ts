import express from "express";

const app = express();

app.use(express.json());

type Transaction = {
  id: string;
  userId: string;
  amount: number;
  description: string;
  date: string;
};

type ClassifiedTransaction = Transaction & {
  category: string;
};

function classifyTransaction(description: string): string {
  const normalizedDescription = description.toLowerCase();

  if (normalizedDescription.includes("netflix") || normalizedDescription.includes("spotify")) {
    return "entretenimento";
  }

  if (normalizedDescription.includes("uber") || normalizedDescription.includes("99")) {
    return "transporte";
  }

  if (normalizedDescription.includes("ifood") || normalizedDescription.includes("restaurant")) {
    return "comida";
  }

  if (normalizedDescription.includes("shell") || normalizedDescription.includes("ipiranga")) {
    return "fuel";
  }

  return "other";
}

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "classification-mock",
    message: "Classification API mock",
  });
});

app.post("/classify", (req, res) => {
  const { transactions } = req.body as { transactions?: Transaction[] };

  if (!Array.isArray(transactions)) {
    return res.status(400).json({
      message: "transactions must be an array",
    });
  }

  const classifiedTransactions: ClassifiedTransaction[] = transactions.map((transaction) => ({
    ...transaction,
    category: classifyTransaction(transaction.description),
  }));

  return res.status(200).json({
    transactions: classifiedTransactions,
  });
});

app.listen(3002, () => {
  console.log("Classification mock running on port 3002");
});