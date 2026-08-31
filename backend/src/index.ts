import express from "express";
import chatRoutes from "./routes/chat";
import modelRoutes from "./routes/model";
import keysRouter from "./routes/keys";
import conversationsRouter from "./routes/conversations";
import cors from "cors";
import { verifyToken } from "./middlewares/auth";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/chat", chatRoutes);
app.use("/models", modelRoutes);
app.use("/keys", verifyToken, keysRouter);
app.use("/conversations", verifyToken, conversationsRouter);


app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(3000);