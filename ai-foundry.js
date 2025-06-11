import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

import dotenv from 'dotenv';

dotenv.config();
const client = new ModelClient(
    process.env.AZURE_INFERENCE_SDK_ENDPOINT ?? "https://toshi-mbrlbviu-eastus2.services.ai.azure.com/models", new AzureKeyCredential(process.env.AZURE_INFERENCE_API_KEY ?? "YOUR_KEY_HERE"));

var messages = [
    { role: "developer", content: "You are an helpful assistant" },
    { role: "user", content: "What are 3 things to see in Seattle?" },
];

var response = await client.path("chat/completions").post({
    body: {
        messages: messages,
        max_completion_tokens: 800,
        temperature: 1,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        model: "gpt-4.1",
    },
});

console.log(JSON.stringify(response));
