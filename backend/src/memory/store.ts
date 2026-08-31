let chatHistory = new Map<string, string[]>();

const getChat = (chatID : string) : string[] | undefined => {
    return chatHistory.get(chatID)
}

const appendMessage = (chatID : string, message : string) : void => {
    let messages = chatHistory.get(chatID) ?? [];
    messages.push(message);
    chatHistory.set(chatID, messages);
}

const deleteChat = (chatID : string) : boolean => {
    return chatHistory.delete(chatID);
}

export {getChat, appendMessage, deleteChat}