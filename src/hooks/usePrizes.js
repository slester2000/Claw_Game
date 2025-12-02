import { useState, useRef } from "react";
import {
  PRIZE_WIDTH,
  MIN_PRIZE_SPACING,
} from "../Constants/constants";

export default function usePrizes(gameWidth) {
  const prizeCounter = useRef(0);

  const getNonOverlappingX = (prizes, width) => {
    const minSpacing = MIN_PRIZE_SPACING;
    let x;
    let isOverlapping = true;

    if (!width) return 40;

    while (isOverlapping) {
      x = Math.floor(Math.random() * (width - PRIZE_WIDTH));
      isOverlapping = prizes.some(p => Math.abs(p.x - x) < minSpacing);
    }
    return x;
  };

  const plushTypes = ["giraffe", "deer", "kitten"];
  const randomPlush = () =>
    plushTypes[Math.floor(Math.random() * plushTypes.length)];

  const [prizes, setPrizes] = useState([
    { x: 40, grabbed: false, type: "deer" },
    { x: 120, grabbed: false, type: "giraffe" },
    { x: 240, grabbed: false, type: "kitten" },
  ]);

  const [grabbedIndex, setGrabbedIndex] = useState(null);
  const [slidingPrize, setSlidingPrize] = useState(null);
  const [wonPrize, setWonPrize] = useState([]);
  const [score, setScore] = useState(0);

  const detectCollision = (clawX, clawWidth) => {
    const clawLeft = clawX;
    const clawRight = clawX + clawWidth;

    const hitIndex = prizes.findIndex(p => {
      const prizeLeft = p.x;
      const prizeRight = p.x + PRIZE_WIDTH;
      return clawRight > prizeLeft && clawLeft < prizeRight;
    });

    if (hitIndex !== -1) {
      setPrizes(prev => {
        const updated = [...prev];
        updated[hitIndex].grabbed = true;
        return updated;
      });
      setGrabbedIndex(hitIndex);
    }
  };

  const respawnPrize = index => {
    setPrizes(prev => {
      const updated = [...prev];
      const others = updated.filter((_, i) => i !== index);
      const newX = getNonOverlappingX(others, gameWidth);
      updated[index] = { x: newX, grabbed: false, type: randomPlush() };
      return updated;
    });
  };

  const awardPrize = index => {
    const type = prizes[index].type;

    setWonPrize(prev => [
      ...prev,
      { id: prizeCounter.current++, type },
    ]);

    setScore(prev => prev + 1);
    setSlidingPrize(type);
  };

  return {
    prizes,
    grabbedIndex,
    slidingPrize,
    wonPrize,
    score,
    detectCollision,
    setSlidingPrize,
    setGrabbedIndex,
    respawnPrize,
    awardPrize,
  };
}
