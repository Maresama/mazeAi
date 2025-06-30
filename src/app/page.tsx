'use client';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

//4方向

const directions = [
  [-1, 0], // 0: 上（north）
  [0, 1], // 1: 右（east）
  [1, 0], // 2: 下（south）
  [0, -1], // 3: 左（west）
];

const WIDTH = 21;
const HEIGHT = 21;
//１（壁）で埋めておく
const makeMaze = (WIDTH: number, HEIGHT: number): number[][] => {
  const maze: number[][] = Array.from({ length: HEIGHT }, () => Array<number>(WIDTH).fill(1));

  // スタートを左上に固定
  const startX = 0;
  const startY = 0;
  maze[startY][startX] = 0;
  //ゴールを右下に固定
  const goalX = WIDTH - 1;
  const goalY = HEIGHT - 1;
  maze[goalY][goalX] = 0;
  //壁を壊して道の候補地の箱
  const wall: [number, number][] = [];

  const destroyWall = (y: number, x: number) => {
    for (const [dy, dx] of directions) {
      const ny = y + dy;
      const nx = x + dx;
      if (ny >= 0 && ny < HEIGHT && nx >= 0 && nx < WIDTH && maze[ny][nx] === 1) {
        wall.push([ny, nx]);
      }
    }
  };
  destroyWall(startY, startX);

  while (wall.length > 0) {
    const idx = Math.floor(Math.random() * wall.length);
    const [wy, wx] = wall[idx];
    wall.splice(idx, 1);

    const makeRord: [number, number][] = [];
    for (const [dy, dx] of directions) {
      const nx = wx + dx;
      const ny = wy + dy;
      if (ny >= 0 && ny < HEIGHT && nx >= 0 && nx < WIDTH && maze[ny][nx] === 0) {
        makeRord.push([ny, nx]);
      }
    }
    if (makeRord.length === 1) {
      maze[wy][wx] = 0;
      const [py, px] = makeRord[0];
      const betweenY = (wy + py) >> 1;
      const betweenX = (wx + px) >> 1;
      maze[betweenY][betweenX] = 0;
      destroyWall(wy, wx);
    }
  }
  maze[HEIGHT - 2][WIDTH - 2] = 0;

  // ゴールの上下左右のどこかが通路ならOK
  const connected = directions.some(([dy, dx]) => {
    const ny = goalY + dy;
    const nx = goalX + dx;
    return ny >= 0 && ny < HEIGHT && nx >= 0 && nx < WIDTH && maze[ny][nx] === 0;
  });

  // もしつながっていなければ、強制的に上のマスを通路にする（例）
  if (!connected && goalY > 0) {
    maze[goalY - 1][goalX] = 0;
  }
  return maze;
};

// 左手法の方向の優先順（左→前→右→後ろ）
const priorityDirections = (currentDir: number): number[] => {
  return [
    (currentDir + 3) % 4, // 左
    currentDir, // 前
    (currentDir + 1) % 4, // 右
    (currentDir + 2) % 4, // 後ろ
  ];
};
//左手法
const leftHandStep = (
  pos: [number, number],
  currentDir: number,
  board: number[][],
): { nextPos: [number, number]; nextCurrentDir: number } => {
  const options = priorityDirections(currentDir);
  for (const d of options) {
    const [dy, dx] = directions[d];
    const [y, x] = pos;
    const ny = y + dy;
    const nx = x + dx;
    if (ny >= 0 && ny < board[0].length && nx >= 0 && nx < board[0].length && board[ny][nx] === 0) {
      return {
        nextPos: [ny, nx],
        nextCurrentDir: d,
      };
    }
  }

  return { nextPos: pos, nextCurrentDir: currentDir };
};

export default function Home() {
  const [started, setStarted] = useState(false);
  const [board, setBoard] = useState(() => makeMaze(WIDTH, HEIGHT));
  const [playerPos, setPlayerPos] = useState<[number, number]>([0, 0]);
  const [playerDir, setPlayerDir] = useState<number>(1); // 初期向き：右
  console.log(board);

  const handleClick = () => {
    const newBoard = makeMaze(WIDTH, HEIGHT);
    setBoard(newBoard);
    setPlayerPos([0, 0]);
    setPlayerDir(1);
    setStarted(true);
  };

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      const { nextPos, nextCurrentDir } = leftHandStep(playerPos, playerDir, board);
      setPlayerPos(nextPos);
      setPlayerDir(nextCurrentDir);
      if (nextPos[0] === HEIGHT - 1 && nextPos[1] === WIDTH - 1) {
        clearInterval(interval);
        setStarted(false);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [started, playerPos, playerDir, board]);

  return (
    <div className={styles.container}>
      <div className={styles.buttonBoard}>
        <button onClick={handleClick} className={styles.button}>
          <p>start</p>
        </button>
      </div>
      {started ? (
        <div className={styles.board}>
          {board.map((row, y) =>
            row.map((cell, x) => {
              const isPlayer = playerPos[0] === y && playerPos[1] === x;
              const directionClass = ['up', 'right', 'down', 'left'][playerDir];
              return (
                <div
                  key={`${x}-${y}`}
                  className={styles.cell}
                  style={{
                    backgroundColor:
                      x === 0 && y === 0
                        ? 'green'
                        : x === WIDTH - 1 && y === HEIGHT - 1
                          ? 'red'
                          : cell === 1
                            ? '#111'
                            : '#fff',
                  }}
                >
                  <div className={`triangle ${directionClass}`} />
                </div>
              );
            }),
          )}
        </div>
      ) : (
        <p>ボタンを押して迷路を生成してください</p>
      )}
    </div>
  );
}
