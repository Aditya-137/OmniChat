import { Router } from "express";
import { controlChat } from "../controllers/chatInput";
import { controlChatStream } from "../controllers/chatStream";

const chatRouter = Router();

chatRouter.post("/", controlChat);
chatRouter.post("/stream", controlChatStream);

export default chatRouter;