"use client";

import { useMemo } from "react";
import type { Game } from "@/lib/games";
import { mergeScores } from "@/lib/scores";
import { useSession } from "./session-provider";

const TOP_CLASS = ["top1", "top2", "top3"];

export function Leaderboard({ game, limit = 10 }: { game: Game; limit?: number }) {
  const { scores } = useSession();
  const rows = useMemo(
    () => mergeScores(game, scores).slice(0, limit),
    [game, scores, limit],
  );

  return (
    <div className="leaderboard">
      <h3>MEJORES PUNTUACIONES</h3>
      {rows.map((r, i) => (
        <div key={`${r.rank}-${r.name}`} className={"lb-row" + (TOP_CLASS[i] ? " " + TOP_CLASS[i] : "")}>
          <div className="rk">#{String(r.rank).padStart(2, "0")}</div>
          <div className="pl">
            {r.name}
            <div style={{ fontSize: 10, color: "var(--ink-faint)", letterSpacing: "0.1em" }}>
              {r.date}
            </div>
          </div>
          <div className="sc">{r.score.toLocaleString("es-ES")}</div>
        </div>
      ))}
    </div>
  );
}
