import { useState, useEffect, useRef } from "react";
import imgWall from "./assets/imgWall.png";
import imgGoal from "./assets/imgGoal.png";
import imgWorker from "./assets/imgWorker.png";
import imgLuggage from "./assets/imgLuggage.png";

const initialData = [
  [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  [6, 6, 6, 6, 6, 0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  [6, 6, 6, 6, 6, 2, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  [6, 6, 6, 6, 6, 0, 0, 2, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  [6, 6, 6, 0, 0, 2, 0, 0, 2, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  [6, 6, 6, 0, 6, 0, 6, 6, 6, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  [6, 0, 0, 0, 6, 0, 6, 6, 6, 0, 6, 6, 6, 6, 0, 0, 1, 1, 6, 6],
  [6, 0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 6, 6],
  [6, 6, 6, 6, 6, 0, 6, 6, 6, 6, 0, 6, 0, 6, 0, 0, 1, 1, 6, 6],
  [6, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
];

export default function App() {
  const [data, setData] = useState<number[][]>(initialData);
  const [position, setPosition] = useState<{ px: number; py: number }>({ px: 12, py: 8 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const gc = canvasRef.current?.getContext("2d");
    if (gc) {
      repaint(gc);
    }
    const handleKeyDown = (e: KeyboardEvent) => mykeydown(e, gc!);
    const handleClick = (e: MouseEvent) => myclick(e, gc!); // クリックイベントの追加
    window.addEventListener("keydown", handleKeyDown);
    canvasRef.current?.addEventListener("click", handleClick); // canvasにクリックイベントを追加
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      canvasRef.current?.removeEventListener("click", handleClick); // クリーンアップ
    };
  }, [position, data]);

  const mykeydown = (e: KeyboardEvent, gc: CanvasRenderingContext2D | null) => {
    let { px, py } = position;
    let dx0 = px,
      dx1 = px,
      dy0 = py,
      dy1 = py;

    switch (e.keyCode) {
      case 37:
        dx0--;
        dx1 -= 2;
        break;
      case 38:
        dy0--;
        dy1 -= 2;
        break;
      case 39:
        dx0++;
        dx1 += 2;
        break;
      case 40:
        dy0++;
        dy1 += 2;
        break;
    }

    if ((data[dy0][dx0] & 0x2) === 0) {
      setPosition({ px: dx0, py: dy0 });
    } else if ((data[dy0][dx0] & 0x6) === 2) {
      if ((data[dy1][dx1] & 0x2) === 0) {
        const newData = [...data];
        newData[dy0][dx0] ^= 2;
        newData[dy1][dx1] |= 2;
        setData(newData);
        setPosition({ px: dx0, py: dy0 });
      }
    }

    if (gc) repaint(gc);
  };

  const myclick = (e: MouseEvent, gc: CanvasRenderingContext2D | null) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const { px, py } = position;

      if (clickX > px * 40 + 40) {
        // workerImageの右側をクリックした場合
        moveWorker(px + 1, py, px + 2, py, gc);
      } else if (clickX < px * 40) {
        // workerImageの左側をクリックした場合
        moveWorker(px - 1, py, px - 2, py, gc);
      } else if (clickY < py * 40) {
        // workerImageの上側をクリックした場合
        moveWorker(px, py - 1, px, py - 2, gc);
      } else if (clickY > py * 40 + 40) {
        // workerImageの下側をクリックした場合
        moveWorker(px, py + 1, px, py + 2, gc);
      }
    }
  };

  const moveWorker = (dx0: number, dy0: number, dx1: number, dy1: number, gc: CanvasRenderingContext2D | null) => {
    if ((data[dy0][dx0] & 0x2) === 0) {
      setPosition({ px: dx0, py: dy0 });
    } else if ((data[dy0][dx0] & 0x6) === 2) {
      if ((data[dy1][dx1] & 0x2) === 0) {
        const newData = [...data];
        newData[dy0][dx0] ^= 2;
        newData[dy1][dx1] |= 2;
        setData(newData);
        setPosition({ px: dx0, py: dy0 });
      }
    }

    if (gc) repaint(gc);
  };

  const repaint = (gc: CanvasRenderingContext2D) => {
    gc.fillStyle = "black";
    gc.fillRect(0, 0, 800, 440);

    const goalImage = new Image();
    goalImage.src = imgGoal;
    const luggageImage = new Image();
    luggageImage.src = imgLuggage;
    const wallImage = new Image();
    wallImage.src = imgWall;

    for (let y = 0; y < data.length; y++) {
      for (let x = 0; x < data[y].length; x++) {
        if (data[y][x] & 0x1) {
          gc.drawImage(goalImage, x * 40, y * 40, 40, 40);
        }
        if (data[y][x] & 0x2) {
          gc.drawImage(luggageImage, x * 40, y * 40, 40, 40);
        }
        if (data[y][x] === 6) {
          gc.drawImage(wallImage, x * 40, y * 40, 40, 40);
        }
      }
    }

    const workerImage = new Image();
    workerImage.src = imgWorker;
    gc.drawImage(workerImage, position.px * 40, position.py * 40, 40, 40);
  };

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} id="soko" width="800" height="440"></canvas>
      <div className="flex flex-col items-center">
        <div>
          <button
            className="text-2xl px-5 py-2.5"
            onClick={() => mykeydown({ keyCode: 38 } as KeyboardEvent, canvasRef.current?.getContext("2d") ?? null)}
          >
            上
          </button>
        </div>
        <div className="flex justify-center space-x-4">
          <div>
            <button
              className="text-2xl px-5 py-2.5"
              onClick={() => mykeydown({ keyCode: 37 } as KeyboardEvent, canvasRef.current?.getContext("2d") ?? null)}
            >
              左
            </button>
          </div>
          <div>
            <button
              className="text-2xl px-5 py-2.5"
              onClick={() => mykeydown({ keyCode: 39 } as KeyboardEvent, canvasRef.current?.getContext("2d") ?? null)}
            >
              右
            </button>
          </div>
        </div>

        <div>
          <button
            className="text-2xl px-5 py-2.5"
            onClick={() => mykeydown({ keyCode: 40 } as KeyboardEvent, canvasRef.current?.getContext("2d") ?? null)}
          >
            下
          </button>
        </div>
      </div>
    </div>
  );
}
