import type { Request, Response } from "express";
import divert from "../services/chatServices"
export default async function controlChat(req : Request, res : Response){
    const {model, message} = req.body;
    const response = await divert(model, message);
    console.log("TYPE:", typeof response);
    console.log("RAW:", response);
    console.log("STRING:", JSON.stringify(response));
    res.json(response);
}