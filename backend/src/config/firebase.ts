import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

let adminAuth: any = null;
let adminDb: any = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.resolve(__dirname, "../../../serviceAccountKey.json");

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }
  adminAuth = admin.auth();
  adminDb = admin.firestore();
  console.log("[Firebase Admin] Initialized with service account.");
} else {
  console.warn("[Firebase Admin] serviceAccountKey.json not found — /keys and /conversations routes will not work.");
}

export { adminAuth, adminDb };
