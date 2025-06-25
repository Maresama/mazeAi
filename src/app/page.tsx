'use client';
import { useState } from 'react';
import styles from './page.module.css';

//4方向
const directions = [
  [-1, 0],
  [0, -1],
  [0, 1],
  [1, 0],
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

  // ゴール手前に通路がなければ1マス破壊
  const gy = HEIGHT - 1;
  const gx = WIDTH - 1;

  maze[gy][gx] = 0;

  // ゴールの上下左右のどこかが通路ならOK
  const connected = directions.some(([dy, dx]) => {
    const ny = gy + dy;
    const nx = gx + dx;
    return ny >= 0 && ny < HEIGHT && nx >= 0 && nx < WIDTH && maze[ny][nx] === 0;
  });

  // もしつながっていなければ、強制的に上のマスを通路にする（例）
  if (!connected && gy > 0) {
    maze[gy - 1][gx] = 0;
  }
  return maze;
};

//１のマスの周り一つを０から１に変更
// const makeMaze = (board: number[][]) => {
//   //コピー
//   const newBoard = board.map((row) => [...row]);

//   for (let y = 0; y < newBoard.length; y++) {
//     for (let x = 0; x < newBoard[0].length; x++) {
//       if (newBoard[y][x] === 1) {
//         //０を入れる箱
//         const candidates: [number, number][] = [];

//         for (const [dx, dy] of directions) {
//           const cx = x + dx;
//           const cy = y + dy;
//           if (
//             cy >= 0 &&
//             cy < newBoard.length &&
//             cx >= 0 &&
//             cx < newBoard[0].length &&
//             newBoard[cy][cx] === 0
//           ) {
//             candidates.push([cx, cy]);
//           }
//         }
//         if (candidates.length > 0) {
//           const [cx, cy] = candidates[Math.floor(Math.random() * candidates.length)];
//           newBoard[cy][cx] = 1;
//         }
//       }
//     }
//   }
//   return newBoard;
// };

export default function Home() {
  const [board, setBoard] = useState(() => makeMaze(WIDTH, HEIGHT));
  console.log(board);
  const handleClick = () => {
    setBoard(makeMaze(WIDTH, HEIGHT));
  };

  return (
    <div className={styles.container}>
      <div className={styles.buttonBoard}>
        <button onClick={handleClick} className={styles.button}>
          <p>start</p>
        </button>
      </div>
      <div className={styles.board}>
        {board.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={styles.cell}
              style={{ backgroundColor: cell === 1 ? '#111111' : '#ffffff' }}
            />
          )),
        )}
      </div>
    </div>
  );
}
