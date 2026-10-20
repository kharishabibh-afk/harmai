
export async function onRequestPost({ request, env }) {
  try {
    if (!env.AI) {
      return Response.json(
        { error: "Workers AI binding belum aktif." },
        { status: 503 }
      );
    }

    const body = await request.json();

    const characterName =
      typeof body.characterName === "string"
        ? body.characterName.slice(0, 60)
        : "Harmai";

    const personality =
      typeof body.personality === "string"
        ? body.personality.slice(0, 500)
        : "Ramah, hangat, dan natural.";

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json(
        { error: "Pesan belum tersedia." },
        { status: 400 }
      );
    }

    const messages = body.messages
      .filter(
        (message) =>
          message &&
          ["user", "assistant"].includes(message.role) &&
          typeof message.content === "string" &&
          message.content.trim().length > 0
      )
      .slice(-10)
      .map((message) => ({
        role: message.role,
        content: message.content.slice(0, 2000),
      }));

    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return Response.json(
        { error: "Pesan pengguna tidak valid." },
        { status: 400 }
      );
    }

    const result = await env.AI.run(
      "@cf/zai-org/glm-4.7-flash",
      {
        messages: [
          {
            role: "system",
            content:
              `Namamu ${characterName}. Kepribadianmu: ${personality}. ` +
              "Jawab dalam bahasa yang digunakan pengguna. " +
              "Bersikaplah natural, hangat, dan konsisten dengan karaktermu. " +
              "Jangan mengaku memiliki ingatan atau pengalaman yang tidak diberikan kepadamu.",
          },
          ...messages,
        ],
      }
    );

    if (!result || typeof result.response !== "string") {
      return Response.json(
        { error: "AI belum menghasilkan jawaban." },
        { status: 502 }
      );
    }

    return Response.json({ reply: result.response });
  } catch (error) {
    console.error("Harmai AI error:", error);

    const detail =
      error instanceof Error
        ? error.message
        : String(error);

    return Response.json(
      {
        error: "Gagal memproses pesan AI.",
        detail: detail.slice(0, 500),
      },
      { status: 500 }
    );
  }
