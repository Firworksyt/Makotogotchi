import { useCallback, useEffect, useRef } from "react";

export type Box = { x: number; y: number };
export type Sequence = { duration: number; boxes: Box[] };
export type Sequences<Keys extends string> = { [K in Keys]: Sequence };

export type SpriteProps<Keys extends string> = {
  src: string;
  width: number;
  height: number;
  sequence: Keys;
  sequences: Sequences<Keys>;
};

const Sprite = <Keys extends string>(props: SpriteProps<Keys extends string ? Keys : never>) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const sprites = useRef<HTMLImageElement | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (window) {
      sprites.current = Object.assign(new Image(), { src: props.src });
    }
  }, [props.src]);

  const clear = useCallback(() => {
    const context = canvas.current?.getContext("2d");
    if (canvas.current && context) {
      context.clearRect(0, 0, canvas.current.width, canvas.current.height);
    }
  }, []);

  const draw = useCallback((frame: number, sequence: Sequence) => {
    const context = canvas.current?.getContext("2d");
    if (canvas.current && context && sprites.current) {
      const box = sequence.boxes[frame];
      context.drawImage(sprites.current, box.x, box.y, props.width, props.height, 0, 0, props.width, props.height);
    }
  }, [props.width, props.height]);

  const loop = useCallback((frame: number, sequence: Sequence) => {
    clear();
    draw(frame, sequence);
    timeout.current = setTimeout(() => loop((frame + 1) % sequence.boxes.length, sequence), sequence.duration);
  }, [clear, draw]);

  useEffect(() => {
    loop(0, props.sequences[props.sequence]);
  }, [loop, props.sequence, props.sequences]);

  return (
    <canvas ref={ canvas } width={ props.width } height={ props.height } />
  )
};

export default Sprite;