import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../config/firebase";
import { storage } from "../utils/storage";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { ChatMessage, ConversationSummary, StoredConversation } from "../types";

interface ConversationContextType {
  conversations: ConversationSummary[];
  currentConversationId: string | null;
  isLoading: boolean;
  setCurrentConversationId: (id: string | null) => void;
  createNewConversation: (modelId: string, provider: string) => string;
  loadConversation: (id: string) => Promise<ChatMessage[]>;
  saveMessages: (conversationId: string, messages: ChatMessage[], modelId: string, provider: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  clearCurrentConversation: () => void;
}

const ConversationContext = createContext<ConversationContextType>(null!);
const LOCAL_CACHE_KEY = "omni_conversations";
const FIRESTORE_MAX_MESSAGES = 200;

export const generateTitle = (text: string): string => {
  const clean = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[`*#_~[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) return "New conversation";
  if (clean.length <= 40) return clean;

  const sub = clean.slice(0, 40);
  const lastSpace = sub.lastIndexOf(" ");
  if (lastSpace > 15) {
    return sub.slice(0, lastSpace) + "...";
  }
  return sub + "...";
};

export const ConversationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getLocalCacheKey = useCallback(() => {
    return user ? `${LOCAL_CACHE_KEY}_${user.uid}` : LOCAL_CACHE_KEY;
  }, [user]);

  const getConversationsCollectionRef = useCallback(() => {
    if (!user) return null;
    return collection(db, "users", user.uid, "conversations");
  }, [user]);

  const getConversationDocRef = useCallback((convId: string) => {
    if (!user) return null;
    return doc(db, "users", user.uid, "conversations", convId);
  }, [user]);

  const getLocalConversations = useCallback((): StoredConversation[] => {
    return storage.getItem<StoredConversation[]>(getLocalCacheKey()) || [];
  }, [getLocalCacheKey]);

  const saveLocalConversations = useCallback((convs: StoredConversation[]) => {
    storage.setItem(getLocalCacheKey(), convs);
  }, [getLocalCacheKey]);

  const fetchFromFirestore = useCallback(async (): Promise<StoredConversation[]> => {
    const colRef = getConversationsCollectionRef();
    if (!colRef) return [];

    try {
      const snapshot = await getDocs(colRef);
      const convs: StoredConversation[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        convs.push({
          id: docSnap.id,
          title: data.title ?? "Untitled",
          modelId: data.modelId ?? "",
          provider: data.provider ?? "",
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : (data.updatedAt ?? Date.now()),
          messages: data.messages ?? [],
        });
      });

      convs.sort((a, b) => b.updatedAt - a.updatedAt);
      saveLocalConversations(convs);
      return convs;
    } catch (err) {
      console.error("[Firestore] Failed to fetch conversations, falling back to local:", err);
      return getLocalConversations();
    }
  }, [getConversationsCollectionRef, saveLocalConversations, getLocalConversations]);

  const refreshConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = user ? await fetchFromFirestore() : getLocalConversations();
      const summaries: ConversationSummary[] = all
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((c) => ({
          id: c.id,
          title: c.title,
          modelId: c.modelId,
          provider: c.provider,
          updatedAt: c.updatedAt,
          messageCount: c.messages.length,
        }));

      setConversations(summaries);
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchFromFirestore, getLocalConversations]);

  const createNewConversation = useCallback((modelId: string, provider: string): string => {
    const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setCurrentConversationId(id);
    return id;
  }, []);

  const loadConversation = useCallback(async (id: string): Promise<ChatMessage[]> => {
    if (user) {
      const docRef = getConversationDocRef(id);
      if (docRef) {
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCurrentConversationId(id);
            return (data.messages ?? []) as ChatMessage[];
          }
        } catch (err) {
          console.error("[Firestore] Failed to load conversation:", err);
        }
      }
    }

    const all = getLocalConversations();
    const conv = all.find((c) => c.id === id);
    if (!conv) return [];
    setCurrentConversationId(id);
    return conv.messages;
  }, [user, getConversationDocRef, getLocalConversations]);

  const saveMessages = useCallback(async (
    conversationId: string,
    messages: ChatMessage[],
    modelId: string,
    provider: string
  ) => {
    const all = getLocalConversations();
    const existingIndex = all.findIndex((c) => c.id === conversationId);
    let conv: StoredConversation;

    if (existingIndex >= 0) {
      const existing = all[existingIndex];
      existing.messages = messages;
      existing.updatedAt = Date.now();
      existing.modelId = modelId;
      existing.provider = provider;
      if ((existing.title === "New conversation" || !existing.title) && messages.length > 0) {
        const firstUser = messages.find((m) => m.role === "user");
        if (firstUser) {
          existing.title = generateTitle(firstUser.content);
        }
      }
      conv = existing;
      all[existingIndex] = conv;
    } else {
      const firstUser = messages.find((m) => m.role === "user");
      const title = firstUser ? generateTitle(firstUser.content) : "New conversation";
      conv = {
        id: conversationId,
        title,
        modelId,
        provider,
        updatedAt: Date.now(),
        messages,
      };
      all.push(conv);
    }

    saveLocalConversations(all);

    // Optimistic in-memory update for instant UI feedback without full collection refetch
    setConversations((prev) => {
      const summary: ConversationSummary = {
        id: conv.id,
        title: conv.title,
        modelId: conv.modelId,
        provider: conv.provider,
        updatedAt: conv.updatedAt,
        messageCount: conv.messages.length,
      };
      const filtered = prev.filter((c) => c.id !== conv.id);
      return [summary, ...filtered].sort((a, b) => b.updatedAt - a.updatedAt);
    });

    if (user) {
      const docRef = getConversationDocRef(conv.id);
      if (docRef) {
        // Cap messages array in Firestore to prevent 1MB document limit overflow
        const firestoreMessages = conv.messages.length > FIRESTORE_MAX_MESSAGES
          ? conv.messages.slice(-FIRESTORE_MAX_MESSAGES)
          : conv.messages;

        setDoc(docRef, {
          title: conv.title,
          modelId: conv.modelId,
          provider: conv.provider,
          updatedAt: Timestamp.fromMillis(conv.updatedAt),
          messages: firestoreMessages,
          messageCount: conv.messages.length,
        }).catch((err) => console.error("[Firestore] Save failed:", err));
      }
    }
  }, [user, getLocalConversations, saveLocalConversations, getConversationDocRef]);

  const deleteConversation = useCallback(async (id: string) => {
    const all = getLocalConversations();
    saveLocalConversations(all.filter((c) => c.id !== id));

    // Optimistic removal
    setConversations((prev) => prev.filter((c) => c.id !== id));

    if (user) {
      const docRef = getConversationDocRef(id);
      if (docRef) {
        deleteDoc(docRef).catch((err) => console.error("[Firestore] Delete failed:", err));
      }
    }

    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  }, [user, getLocalConversations, saveLocalConversations, getConversationDocRef, currentConversationId]);

  const clearCurrentConversation = useCallback(() => {
    setCurrentConversationId(null);
  }, []);

  useEffect(() => {
    if (user) {
      refreshConversations();
    } else {
      setConversations([]);
      setCurrentConversationId(null);
      setIsLoading(false);
    }
  }, [user, refreshConversations]);

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        currentConversationId,
        isLoading,
        setCurrentConversationId,
        createNewConversation,
        loadConversation,
        saveMessages,
        deleteConversation,
        refreshConversations,
        clearCurrentConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => useContext(ConversationContext);
