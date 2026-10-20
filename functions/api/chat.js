
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

    if (!Array.isArray(body.messages) || !body.messages.length) {
      return Response.json(
        { error: "Pesan belum tersedia." },
        { status: 400 }
      );
    }

    const messages = body.messages
      .filter(
        (m) =>
          m &&
          ["user", "assistant"].includes(m.role) &&
          typeof m.content === "string" &&
          m.content.trim()
      )
      .slice(-10)
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 2000),
      }));

    if (
      !messages.length ||
      messages[messages.length - 1].role !== "user"
    ) {
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
              "Jawab menggunakan bahasa pengguna. " +
              "Bersikap natural, hangat, dan konsisten dengan karakter. " +
              "Jangan mengaku memiliki ingatan yang tidak diberikan.",
          },
          ...messages,
        ],
      }
    );

    const reply =
      typeof result?.response === "string"
        ? result.response
        : typeof result?.choices?.[0]?.message?.content === "string"
          ? result.choices[0].message.content
          : null;

    if (!reply || !reply.trim()) {
      return Response.json(
        { error: "AI tidak menghasilkan teks jawaban." },
        { status: 502 }
      );
    }

    return Response.json({ reply: reply.trim() });
  } catch (error) {
    console.error(
      "Harmai AI error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return Response.json(
      { error: "Gagal memproses pesan AI. Coba lagi nanti." },
      { status: 500 }
    );
  }
}
