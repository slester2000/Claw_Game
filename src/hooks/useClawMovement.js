import { useEffect, useState } from "react";
import { MOVE_STEP, HOLD_INTERVAL_MS, CLAW_WIDTH } from "../Constants/constants";

export default function useClawMovement(gameWidth) {
  const [clawX, setClawX] = useState(0);
  const [leftHeld, setLeftHeld] = useState(false);
  const [rightHeld, setRightHeld] = useState(false);

  const moveLeft = () => {
    if (!gameWidth) return;
    const minX = 0;
    setClawX(prev => Math.max(prev - MOVE_STEP, minX));
  };

  const moveRight = () => {
    if (!gameWidth) return;
    const maxX = gameWidth - CLAW_WIDTH;
    setClawX(prev => Math.min(prev + MOVE_STEP, maxX));
  };

  useEffect(() => {
    let interval = null;

    if (leftHeld) interval = setInterval(moveLeft, HOLD_INTERVAL_MS);
    else if (rightHeld) interval = setInterval(moveRight, HOLD_INTERVAL_MS);

    return () => interval && clearInterval(interval);
  }, [leftHeld, rightHeld, gameWidth]);

  return {
    clawX,
    setClawX,
    moveLeft,
    moveRight,
    leftHeld,
    rightHeld,
    setLeftHeld,
    setRightHeld,
  };
}
