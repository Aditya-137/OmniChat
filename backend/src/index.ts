import express from "express";
import chatRoutes from "./routes/chat";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(3000);