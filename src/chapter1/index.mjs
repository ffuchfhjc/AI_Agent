import { ChatOpenAI } from '@langchain/openai';
import { config } from 'dotenv';
config();
const { MODEL_NAME, API_KEY, BASE_URL } = process.env;

const model = new ChatOpenAI({
    modelName: MODEL_NAME,
    apiKey: API_KEY,
    configuration: {
        baseURL: BASE_URL,
    },
});

const response = await model.invoke("介绍下自己");
console.log(response.content);