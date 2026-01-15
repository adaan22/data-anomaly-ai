import dotenv from 'dotenv';
dotenv.config({ path: './variables.env' });
import OpenAI from "openai";

const deployment_name = "gpt-4o-mini";
const sessions = new Map();
const client = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${deployment_name}`,
    defaultQuery: { 'api-version': '2024-08-01-preview' },
    defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
});

export function makeClient(csvResult) {
    const resultArray = csvResult.split("\n").slice(1);
    const goodResult = [];
    const anomResult = [];

    for (const line of resultArray) {
        if (!line.trim()) continue; 
        
        const columns = line.split(',');
        if (!columns[0] || columns[0].trim() === '' || columns[0].toLowerCase() === 'null') {
            anomResult.push(columns[1] || '');
        } else {
            goodResult.push(columns[0]);
        }
    }

    const goodVal = goodResult.join(", ");
    const anomVal = anomResult.join(", ");

    return { goodVal, anomVal };
}

function getSession(sessionId) {
    if (!sessions.has(sessionId)) {
        sessions.set(sessionId, {
            goodVals: "",
            anomVals: "",
            context: "",
            messages: [
                {
                    role: "system",
                    content: "You are an anomaly-analysis assistant. Be concise, practical, and ask clarifying questions when needed.",
                },
            ],
        });
    }
    return sessions.get(sessionId);
}

export function setValuesForSession(sessionId, csvResult, contextText = "") {
    const session = getSession(sessionId);
    
    const { goodVal, anomVal } = makeClient(csvResult);

    session.goodVals = goodVal;
    session.anomVals = anomVal;
    session.context = contextText;

    session.messages[0] = {
        role: "system",
        content: `You analyze anomalies in data. The user has provided the following data:

Normal values: ${goodVal}
Anomalous values: ${anomVal}
${contextText ? `Context: ${contextText}` : ''}

Provide likely causes for the anomalies, suggest mitigations, and ask clarifying questions when needed. Be concise and practical.`
    };
}

export async function anomalyMsg(sessionId, userMsg) {
    const session = getSession(sessionId);

    session.messages.push({ role: "user", content: userMsg });

    try {
        const response = await client.chat.completions.create({
            model: deployment_name,
            messages: session.messages,
            temperature: 0.2,
        });

        const assistant = response.choices?.[0]?.message?.content ?? "";
        session.messages.push({ role: "assistant", content: assistant });

        return assistant;
    } catch (error) {
        console.error("OpenAI API Error:", error);
        throw error;
    }
}