import type { Request, Response } from "express";
export default function controlChat(req : Request, res : Response){
    const {model, message} = req.body;
    res.send(model + message);
}