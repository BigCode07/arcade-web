"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GAMES } from "@/lib/games";
import { mergeScores, personalBest } from "@/lib/scores";
import { useSession } from "./session-provider";

const TOP_CLASS = ["top1", "top2", "top3"];
const TABLE_ROWS = 12;

export function HallOfFame() {
  const { user, scores } = useSession();
  const [tab, setTab] = useState(GAMES[0].id);

  const game = GAMES.find((g) => g.id === tab) ?? GAMES[0];
  const ranking = useMemo(() => mergeScores(game, scores), [game, scores]);
  const rows = ranking.slice(0, TABLE_ROWS);
  const mine = useMemo(
    () => (user ? personalBest(game, scores, user) : null),
    [game, scores, user],
  );
  const [first, second, third] = rows;

  return (
    <div className="av-hall fade-in">
      <div className="hall-head">
        <h1>SALÓN DE LA FAMA</h1>
        <p className="pixel" style={{ fontSize: 10 }}>
          LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA
        </p>
      </div>

      <div className="hall-tabs">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            className={"chip" + (tab === g.id ? " active" : "")}
            aria-pressed={tab === g.id}
            onClick={() => setTab(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div className="podium">
        <div className="podium-slot silver">
          <div className="rank-num">02</div>
          <div className="name">{second.name}</div>
          <div className="score">{second.score.toLocaleString("es-ES")}</div>
          <div className="date">{second.date}</div>
        </div>
        <div className="podium-slot gold">
          <div className="pixel" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.18em" }}>
            CAMPEÓN
          </div>
          <div className="rank-num" style={{ fontSize: 36, marginTop: 4 }}>
            01
          </div>
          <div className="name">{first.name}</div>
          <div className="score" style={{ fontSize: 20 }}>
            {first.score.toLocaleString("es-ES")}
          </div>
          <div className="date">{first.date}</div>
        </div>
        <div className="podium-slot bronze">
          <div className="rank-num">03</div>
          <div className="name">{third.name}</div>
          <div className="score">{third.score.toLocaleString("es-ES")}</div>
          <div className="date">{third.date}</div>
        </div>
      </div>

      <div className="hall-table">
        <div className="th">
          <div>RANGO</div>
          <div>JUGADOR</div>
          <div>PUNTUACIÓN</div>
          <div>FECHA</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={`${game.id}-${r.rank}-${r.name}`}
            className={"tr" + (TOP_CLASS[i] ? " " + TOP_CLASS[i] : "")}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="rk">#{String(r.rank).padStart(2, "0")}</div>
            <div className="pl">{r.name}</div>
            <div className="sc">{r.score.toLocaleString("es-ES")}</div>
            <div className="dt">{r.date}</div>
          </div>
        ))}
        {user && (
          <>
            <div className="tr you-label">▸ TU MEJOR MARCA EN {game.title}</div>
            {mine ? (
              <div
                className="tr you"
                style={{ animationDelay: `${rows.length * 50 + 50}ms` }}
              >
                <div className="rk" style={{ color: "var(--yellow)" }}>
                  #{String(mine.rank).padStart(2, "0")}
                </div>
                <div className="pl" style={{ color: "var(--yellow)" }}>
                  {user.name}
                </div>
                <div
                  className="sc"
                  style={{ color: "var(--yellow)", textShadow: "0 0 6px rgba(245,255,0,0.5)" }}
                >
                  {mine.score.toLocaleString("es-ES")}
                </div>
                <div className="dt">{mine.date}</div>
              </div>
            ) : (
              <div
                className="tr you"
                style={{ animationDelay: `${rows.length * 50 + 50}ms` }}
              >
                <div className="pl" style={{ color: "var(--yellow)", gridColumn: "1 / -1" }}>
                  AÚN SIN MARCA
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Link href="/biblioteca" className="btn lg">
          VOLVER A LA BIBLIOTECA
        </Link>
      </div>
    </div>
  );
}
