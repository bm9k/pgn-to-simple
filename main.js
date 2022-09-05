import { readFile, writeFile } from "fs/promises";

import { Chess } from "chess.js";
import path from "path";

export function pgnToSimple(pgnText) {
  const chess = new Chess();
  chess.load_pgn(pgnText);

  const history = chess.history({ verbose: true });

  chess.reset();

  const startPosition = chess.fen();

  const moves = history.map(move => {
    const fromPosition = chess.fen();
    chess.move(move);
    return {
      ...move,
      fromPosition,
      toPosition: chess.fen(),
    };
  });

  return {
    startPosition,
    moves
  }
}

async function loadPgnGames(gamesFile) {
  const text = await readFile(gamesFile, {encoding: "utf-8"});
  return text.split("\n").map(x => x.trim()).filter(x => {
    return !!x && !x.startsWith("#");
  });
}

async function main() {

  
  if (process.argv.length !== 3) {
    console.error("Usage: ./pgn-to-simple {inputFile}");
    process.exit();
  }

  const inputFile = process.argv[2];

  const outputFile = path.format({
    ...path.parse(inputFile),
    base: undefined,
    ext: ".json"
  });

  const games = await loadPgnGames(inputFile);

  const result = games.map(game => pgnToSimple(game));

  await writeFile(outputFile, JSON.stringify(result, null, 2));
}

main();