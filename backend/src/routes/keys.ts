import { Router } from "express";
import { adminDb } from "../config/firebase";

const router = Router();

// GET /keys — list which providers have keys (return provider names only, never the key values)
router.get("/", async (req, res) => {
  const uid = req.uid!;
  const snap = await adminDb.collection(`users/${uid}/keys`).get();
  const providers = snap.docs.map(d => d.id);
  res.json({ providers });
});

// POST /keys/:provider — save a key
router.post("/:provider", async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: "Key required", code: "VALIDATION_ERROR" });
  await adminDb.doc(`users/${req.uid}/keys/${req.params.provider}`).set({ key, addedAt: new Date() });
  res.json({ success: true });
});

// DELETE /keys/:provider — remove a key
router.delete("/:provider", async (req, res) => {
  await adminDb.doc(`users/${req.uid}/keys/${req.params.provider}`).delete();
  res.json({ success: true });
});

export default router;
