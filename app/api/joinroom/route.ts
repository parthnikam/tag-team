export async function POST() {
  return Response.json(
    { error: "Role joining is handled by the room role server action." },
    { status: 410 },
  );
}
