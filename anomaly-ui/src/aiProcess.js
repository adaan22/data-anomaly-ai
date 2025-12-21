import OpenAI from "openai";

const deployment_name = "gpt-4o-mini";
const sessions = new Map();
const client = new OpenAI({
    baseURL: process.env.AI_ENDPOINT,
    apiKey: process.env.AI_API
});

export function makeClient(csvResult) {

    const resultArray = csvResult.slice(1).split("\n");
    const goodResult = [];
    const anomResult = [];

    for (const line of csvResult) {
        if (line.indexOf(0) == ',') anomResult.push(line);
        else goodResult.push(line);
    }

    goodVal = goodResult.join(", ");
    anomVal = anomResult.join(", ");

    return { goodVal, anomVal };
}

function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      goodVals: [],
      anomVals: [],
      context: "",
      messages: [
        {
          role: "system",
          content:
            "You are an anomaly-analysis assistant. Be concise, practical, and ask clarifying questions when needed.",
        },
      ],
    });
  }
  return sessions.get(sessionId);
}

export function setValuesForSession(sessionId, csvResult, contextText = "") {
    const session = getSession(sessionId);
    
    const { good, anom } = makeClient(csvResult);

    sessions.goodVals = good;
    sessions.anomVals = anom;
    sessions.context = contextText;

    sessions.messages[0] = {
        role: "system",
        content: "You analyze anomalies in data. Provide likely causes, mitigations, and ask clarifying questions when needed.\n"
    };
}

export async function anomalyMsg(sessionId, userMsg) {
    
    const session = getSession(sessionId);

    sessions.messages.push({ role: "user", content: userMsg });
    
    const response = await client.chat.completions.create({
        model: deployment_name,
        messages: sessions.messages,
        temperature: 0.2,
    });

    const assistant = response.choices?.[0]?.message?.content ?? "";
    
    sessions.message.push({ role: "assistant", content: assistant});
    
    return assistant;
}

