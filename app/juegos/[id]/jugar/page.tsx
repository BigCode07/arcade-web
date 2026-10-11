import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GamePlayer } from "@/components/game-player";
import { findGame, GAMES } from "@/lib/games";

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/juegos/[id]/jugar">): Promise<Metadata> {
  const { id } = await params;
  const game = findGame(id);
  if (!game) return {};
  return { title: `Jugando ${game.title} · Arcade Vault` };
}

// `params` solo se lee dentro de <Suspense>: el shell estático no depende de la URL.
export default function PlayPage(props: PageProps<"/juegos/[id]/jugar">) {
  return (
    <Suspense fallback={<div className="av-player" aria-busy="true" />}>
      <Player params={props.params} />
    </Suspense>
  );
}

async function Player({
  params,
}: {
  params: PageProps<"/juegos/[id]/jugar">["params"];
}) {
  const { id } = await params;
  const game = findGame(id);
  if (!game) notFound();

  return <GamePlayer game={game} />;
}
