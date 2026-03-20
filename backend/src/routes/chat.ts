import { Router } from "express";
import controlChat from "../controllers/chatInput";

const chatRouter = Router();

chatRouter.post("/", controlChat)

export default chatRouter;