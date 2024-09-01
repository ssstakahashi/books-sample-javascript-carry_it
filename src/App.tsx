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
  const [data, setData] = useState<number[][]>(initialData); // ゲームデータの状態を管理するためのuseStateフック
  const [position, setPosition] = useState<{ px: number; py: number }>({ px: 12, py: 8 }); // プレイヤーの位置を管理するためのuseStateフック
  const canvasRef = useRef<HTMLCanvasElement>(null); // canvas要素への参照を保持するためのuseRefフック

  useEffect(() => {
    const gc = canvasRef.current?.getContext("2d"); // canvasの2Dコンテキストを取得
    if (gc) {
      repaint(gc); // 初期描画
    }
    const handleKeyDown = (e: KeyboardEvent) => mykeydown(e, gc!); // キーボードイベントハンドラ
    const handleClick = (e: MouseEvent) => myclick(e, gc!); // クリックイベントハンドラ
    window.addEventListener("keydown", handleKeyDown); // キーボードイベントリスナーを追加
    canvasRef.current?.addEventListener("click", handleClick); // canvasにクリックイベントリスナーを追加
    return () => {
      window.removeEventListener("keydown", handleKeyDown); // クリーンアップ時にキーボードイベントリスナーを削除
      canvasRef.current?.removeEventListener("click", handleClick); // クリーンアップ時にクリックイベントリスナーを削除
    };
  }, [position, data]); // positionとdataが変更されるたびにuseEffectが再実行される

  const mykeydown = (e: KeyboardEvent, gc: CanvasRenderingContext2D | null) => {
    let { px, py } = position; // 現在のプレイヤー位置を取得
    let dx0 = px,
      dx1 = px,
      dy0 = py,
      dy1 = py;

    switch (e.key) {
      case "ArrowLeft":
        dx0--;
        dx1 -= 2;
        break;
      case "ArrowUp":
        dy0--;
        dy1 -= 2;
        break;
      case "ArrowRight":
        dx0++;
        dx1 += 2;
        break;
      case "ArrowDown":
        dy0++;
        dy1 += 2;
        break;
    }

    if ((data[dy0][dx0] & 0x2) === 0) {
      setPosition({ px: dx0, py: dy0 }); // プレイヤーの位置を更新
    } else if ((data[dy0][dx0] & 0x6) === 2) {
      if ((data[dy1][dx1] & 0x2) === 0) {
        const newData = [...data]; // 新しいデータ配列を作成
        newData[dy0][dx0] ^= 2; // 荷物の位置を更新
        newData[dy1][dx1] |= 2; // 荷物の新しい位置を設定
        setData(newData); // データを更新
        setPosition({ px: dx0, py: dy0 }); // プレイヤーの位置を更新
      }
    }

    if (gc) repaint(gc); // 再描画
  };

  const myclick = (e: MouseEvent, gc: CanvasRenderingContext2D | null) => {
    const rect = canvasRef.current?.getBoundingClientRect(); // canvasの位置とサイズを取得
    if (rect) {
      const clickX = e.clientX - rect.left; // クリック位置のX座標を計算
      const clickY = e.clientY - rect.top; // クリック位置のY座標を計算
      const { px, py } = position; // 現在のプレイヤー位置を取得

      if (clickX > px * 30 + 30) {
        // workerImageの右側をクリックした場合
        moveWorker(px + 1, py, px + 2, py, gc);
      } else if (clickX < px * 30) {
        // workerImageの左側をクリックした場合
        moveWorker(px - 1, py, px - 2, py, gc);
      } else if (clickY < py * 30) {
        // workerImageの上側をクリックした場合
        moveWorker(px, py - 1, px, py - 2, gc);
      } else if (clickY > py * 30 + 30) {
        // workerImageの下側をクリックした場合
        moveWorker(px, py + 1, px, py + 2, gc);
      }
    }
  };

  const moveWorker = (dx0: number, dy0: number, dx1: number, dy1: number, gc: CanvasRenderingContext2D | null) => {
    if ((data[dy0][dx0] & 0x2) === 0) {
      setPosition({ px: dx0, py: dy0 }); // プレイヤーの位置を更新
    } else if ((data[dy0][dx0] & 0x6) === 2) {
      if ((data[dy1][dx1] & 0x2) === 0) {
        const newData = [...data]; // 新しいデータ配列を作成
        newData[dy0][dx0] ^= 2; // 荷物の位置を更新
        newData[dy1][dx1] |= 2; // 荷物の新しい位置を設定
        setData(newData); // データを更新
        setPosition({ px: dx0, py: dy0 }); // プレイヤーの位置を更新
      }
    }

    if (gc) repaint(gc); // 再描画
  };

  const repaint = (gc: CanvasRenderingContext2D) => {
    gc.fillStyle = "black"; // 背景色を黒に設定
    gc.fillRect(0, 0, 600, 330); // 背景を塗りつぶす

    const goalImage = new Image(); // ゴール画像を作成
    goalImage.src = imgGoal;
    const luggageImage = new Image(); // 荷物画像を作成
    luggageImage.src = imgLuggage;
    const wallImage = new Image(); // 壁画像を作成
    wallImage.src = imgWall;

    for (let y = 0; y < data.length; y++) {
      for (let x = 0; x < data[y].length; x++) {
        if (data[y][x] & 0x1) {
          gc.drawImage(goalImage, x * 30, y * 30, 30, 30); // ゴール画像を描画
        }
        if (data[y][x] & 0x2) {
          gc.drawImage(luggageImage, x * 30, y * 30, 30, 30); // 荷物画像を描画
        }
        if (data[y][x] === 6) {
          gc.drawImage(wallImage, x * 30, y * 30, 30, 30); // 壁画像を描画
        }
      }
    }

    const workerImage = new Image(); // プレイヤー画像を作成
    workerImage.src = imgWorker;
    gc.drawImage(workerImage, position.px * 30, position.py * 30, 30, 30); // プレイヤー画像を描画
  };

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} id="soko" width="600" height="330"></canvas> {/* canvas要素 */}
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
