 const SYSTEM_PROMPT = `You are the assistant on Taskeen Ullah's portfolio website. Answer only about Taskeen's skills, education, projects, and contact details, using the facts provided. If you don't know, say so and suggest contacting him. Keep answers short and simple. Reply in the same language the visitor uses (English, Urdu, or Roman Urdu).

Facts about Taskeen:
- He is a recent BSCS graduate with a CGPA of 3.96/4.0.
- His role is MERN Stack Developer & Web Designer.
- Skills: HTML, CSS, Tailwind CSS, Bootstrap, JavaScript, React, Node.js, Express.js, Firebase, MongoDB, Firestore, MySQL, SQL Server, React Native, Electron + React, Git, GitHub, Vercel, Netlify, MS Office (Word, Excel, PowerPoint, Access), C++, and C#.
- Projects: Umeed Blood Donation (a blood donation platform connecting donors and patients); Task App (a task management web app); Brilliance Academy (an academy website for courses and students); SSI Bannu (its official website); Hostel Management (a hostel management system); and E-Commerce Store (an online shopping website).
- Contact: taskeenullah373@gmail.com; GitHub https://github.com/taskeenkhan-bscs; LinkedIn https://www.linkedin.com/in/taskoo-wzr.`;

function sendJson(response, status, body) {
  return response.status(status).json(body);
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Use POST to send a chat message." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set for the chat function.");
    return sendJson(response, 500, {
      error: "The chat service is not configured. Set GEMINI_API_KEY on the server.",
    });
  }

  let body = request.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return sendJson(response, 400, { error: "Request body must be valid JSON." });
    }
  }

  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return sendJson(response, 400, {
      error: "Send a non-empty messages array.",
    });
  }

  const messages = body.messages.slice(-10);
  const validMessages = messages.every(
    (message) =>
      message &&
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string" &&
      message.content.trim().length > 0,
  );

  if (!validMessages) {
    return sendJson(response, 400, {
      error: "Each message needs a user or assistant role and non-empty text.",
    });
  }

  if (messages[messages.length - 1].role !== "user") {
    return sendJson(response, 400, {
      error: "The last chat message must be from the user.",
    });
  }

  const contents = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content.trim() }],
  }));
  while (contents[0].role === "model") {
    contents.shift();
  }

  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents,
          generationConfig: {
            maxOutputTokens: 500,
          },
        }),
      },
    );

    let result;
    try {
      result = await apiResponse.json();
    } catch (error) {
      console.error("Gemini returned a non-JSON response.", error);
      return sendJson(response, 502, {
        error: "The AI service returned an unreadable response.",
      });
    }

    if (!apiResponse.ok) {
      const providerMessage =
        result.error && result.error.message
          ? result.error.message
          : "No error details were returned.";
      console.error(
        `Gemini API returned status ${apiResponse.status}: ${providerMessage}`,
      );
      return sendJson(response, apiResponse.status === 429 ? 503 : 502, {
        error: `The AI service request failed (provider status ${apiResponse.status}).`,
      });
    }

    const parts = result.candidates?.[0]?.content?.parts;
    const reply = Array.isArray(parts)
      ? parts
          .filter((part) => typeof part.text === "string")
          .map((part) => part.text)
          .join("\n")
          .trim()
      : "";

    if (!reply) {
      console.error("Gemini returned a response without text content.");
      return sendJson(response, 502, {
        error: "The AI service returned an empty reply.",
      });
    }

    return sendJson(response, 200, { reply });
  } catch (error) {
    console.error("Unable to reach the Gemini API.", error);
    return sendJson(response, 502, {
      error: "The AI service could not be reached. Please try again.",
    });
  }
};
