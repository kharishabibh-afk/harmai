
export async function onRequestPost({ request, env }) {
  try {
    if (!env.AI) {
      return Response.json(
        { error: "Layanan AI gambar belum tersedia." },
        { status: 503 }
      );
    }

    const body = await request.json();

    const safeText = (value, max = 1000) =>
      typeof value === "string"
        ? value.trim().slice(0, max)
        : "";

    const name = safeText(body.characterName, 60);
    const gender = safeText(body.characterGender, 30);
    const description = safeText(body.characterDescription);
    const personality = safeText(body.personality);
    const speechStyle = safeText(body.characterSpeechStyle, 100);
    const instructions = safeText(body.characterInstructions);
    const imagePrompt = safeText(body.characterImagePrompt, 1500);

    if (!name) {
      return Response.json(
        { error: "Nama karakter wajib diisi." },
        { status: 400 }
      );
    }

    const prompt = [
      "Create a high-quality fictional character portrait.",
      `Character name: ${name}.`,
      gender ? `Gender: ${gender}.` : "",
      description ? `Character description: ${description}.` : "",
      personality ? `Personality: ${personality}.` : "",
      speechStyle ? `Speaking style: ${speechStyle}.` : "",
      instructions ? `Additional details: ${instructions}.` : "",
      imagePrompt
        ? `User's visual direction: ${imagePrompt}. Follow this visual direction while preserving the character's identity.`
        : "",
      "Create one distinctive character portrait.",
      "Detailed face, professional digital illustration, clean background.",
      "No text, no watermark."
    ]
      .filter(Boolean)
      .join("\n");

    const result = await env.AI.run(
      "@cf/black-forest-labs/flux-1-schnell",
      {
        prompt: prompt.slice(0, 2048),
        steps: 4
      }
    );

    if (!result || !result.image) {
      return Response.json(
        { error: "AI belum berhasil membuat gambar." },
        { status: 502 }
      );
    }

    const binary = atob(result.image);
    const bytes = Uint8Array.from(
      binary,
      (char) => char.charCodeAt(0)
    );

    return new Response(bytes, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return Response.json(
      { error: "Gagal membuat gambar. Periksa konfigurasi AI." },
      { status: 500 }
    );
  }
}
