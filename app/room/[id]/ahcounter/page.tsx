export default async function Page(props: PageProps<"/room/[id]/ahcounter">) {
  const { id } = await props.params;

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded border border-white/10 p-4">
        <p className="text-xs text-white/60">Room {id}</p>
        <h1 className="text-lg">Ah-Counter</h1>
      </div>
    </main>
  );
}
