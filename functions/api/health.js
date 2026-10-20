
export async function onRequestGet() {
  return Response.json({
    app: "Harmai",
    status: "online",
    backend: "connected",
  });
}
