import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req) {
  try {
    const { message } = await req.json();

    console.log("PROBANDO CON HAIKU");

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: message
        }
      ],
    });

    console.log("RESPUESTA OK");

    return Response.json({
      reply: response.content[0].text,
    });

  } catch (error) {
    console.log("ERROR:", error.message);
    console.log("STATUS:", error.status);
    
    return Response.json({
      reply: "Error: " + error.message,
    }, { status: 500 });
  }
}