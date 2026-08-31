/**
 * Extracts a clean text string from LangChain response chunks / content.
 *
 * CRITICAL: This function must NEVER strip whitespace (.trim()) from raw strings
 * or streaming chunks, because doing so destroys inter-token spaces, tabs, and
 * newlines (causing words to concatenate together like "word1word2").
 */
export const extractContentString = (content: string | any[] | any): string => {
  if (content === null || content === undefined) {
    return "";
  }

  // Plain string chunk — preserve EXACT whitespace and casing
  if (typeof content === "string") {
    return content;
  }

  // Array of typed content blocks (Anthropic, LangChain structured chunks)
  if (Array.isArray(content)) {
    const parts = content
      .filter((block: any) => {
        if (!block) return false;
        // Ignore thinking / reasoning blocks and tool calls
        if (block.type && block.type !== "text") return false;
        return true;
      })
      .map((block: any) => {
        if (typeof block === "string") return block;
        const text = block.text ?? block.content ?? "";
        return typeof text === "string" ? text : "";
      });

    return parts.join("");
  }

  // Plain object with a .text property
  if (typeof content === "object") {
    if (typeof content.text === "string") return content.text;
    if (typeof content.content === "string") return content.content;
    return "";
  }

  return String(content);
};
