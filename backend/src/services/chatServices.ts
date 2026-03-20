import { main } from "../adapters/groq"
const divert = (model : any, message : string) => {
    if (model === 'groq'){
        return main(message);
    }
}

export default divert;