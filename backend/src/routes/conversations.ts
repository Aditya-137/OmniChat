import { Router } from "express";
import { adminDb } from "../config/firebase";
import admin from "firebase-admin";

const router = Router();

// GET /conversations — list conversations (ordered by updatedAt desc, limit 30)
router.get("/", async (req, res) => {
  const snap = await adminDb.collection(`users/${req.uid}/conversations`)
    .orderBy("updatedAt", "desc").limit(30).get();
  const convs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  res.json({ conversations: convs });
});

// POST /conversations — create new conversation
router.post("/", async (req, res) => {
  const { modelId, provider } = req.body;
  const ref = await adminDb.collection(`users/${req.uid}/conversations`).add({
    title: "New conversation",
    modelId, provider,
    messages: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  res.json({ conversationId: ref.id });
});

// GET /conversations/:id — get a conversation with messages
router.get("/:id", async (req, res) => {
  const doc = await adminDb.doc(`users/${req.uid}/conversations/${req.params.id}`).get();
  if (!doc.exists) return res.status(404).json({ error: "Not found", code: "NOT_FOUND" });
  res.json({ id: doc.id, ...doc.data() });
});

// PATCH /conversations/:id — update title, modelId, append messages
router.patch("/:id", async (req, res) => {
  const { title, messages, modelId, provider } = req.body;
  const updates: any = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
  if (title) updates.title = title;
  if (modelId) updates.modelId = modelId;
  if (provider) updates.provider = provider;
  if (messages) updates.messages = messages; // replace entire array
  await adminDb.doc(`users/${req.uid}/conversations/${req.params.id}`).update(updates);
  res.json({ success: true });
});

export default router;
