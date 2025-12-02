import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";

import Claw from "../../src/Components/Claw";
import Controls from "../../src/Components/Controls";
import Drawer from "../../src/Components/Drawer";
import GameStatusBar from "../../src/Components/GameStatusBar";
import PrizeRow from "../../src/Components/PrizeRow";

import {
  CLAW_WIDTH,
  INITIAL_CLAW_Y,
  PRIZE_IMAGE_SIZE,
} from "../../src/Constants/constants";
import prizeImages from "../../src/Constants/prizeItems";

import useClawAnimation from "../../src/hooks/useClawAnimation";
import useClawMovement from "../../src/hooks/useClawMovement";
import usePrizes from "../../src/hooks/usePrizes";

// -----------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------
export default function GameScreen() {
  const [gameWidth, setGameWidth] = useState(null);
  const [gameHeight, setGameHeight] = useState(null);

  // -----------------------------------------------------
  // SOUND INITIALIZATION
  // -----------------------------------------------------
  const moveSound = useRef(null);
  const dropSound = useRef(null);
  const grabSound = useRef(null);
  const winSound = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function loadSounds() {
      if (!mounted) return;

      moveSound.current = new Audio.Sound();
      dropSound.current = new Audio.Sound();
      grabSound.current = new Audio.Sound();
      winSound.current = new Audio.Sound();

      await moveSound.current.loadAsync(require("../../assets/sounds/move.mp3"));
      await dropSound.current.loadAsync(require("../../assets/sounds/drop.mp3"));
      await grabSound.current.loadAsync(require("../../assets/sounds/grab.mp3"));
      await winSound.current.loadAsync(require("../../assets/sounds/win.mp3"));
    }

    loadSounds();
    return () => (mounted = false);
  }, []);

  // -----------------------------------------------------
  // CUSTOM HOOKS
  // -----------------------------------------------------

  // 🟦 1. Claw Movement
  const {
    clawX,
    setClawX,
    moveLeft,
    moveRight,
    leftHeld,
    rightHeld,
    setLeftHeld,
    setRightHeld,
  } = useClawMovement(gameWidth);

  // 🟨 2. Prize Logic
  const {
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
  } = usePrizes(gameWidth);

  // 🟥 3. Claw Animation
  const {
    clawY,
    clawGrip,
    clawShake,
    slideAnim,
    prizeWiggle,
    dropClaw,
  } = useClawAnimation(
    gameHeight,
    detectCollision,
    awardPrize,
    respawnPrize,
    setSlidingPrize,
    grabbedIndex,
    setGrabbedIndex,
    {
      drop: () => dropSound.current?.replayAsync(),
      grab: () => grabSound.current?.replayAsync(),
      win: () => winSound.current?.replayAsync(),
    }
  );

  // Prize wiggle visual rotation
  const prizeWiggleRotation = prizeWiggle.interpolate({
    inputRange: [0, 1],
    outputRange: ["-3deg", "3deg"],
  });

  // -----------------------------------------------------
  // RESET GAME
  // -----------------------------------------------------
  const resetGame = () => {
    setSlidingPrize(null);
    setGrabbedIndex(null);

    clawY.setValue(INITIAL_CLAW_Y);
    clawGrip.setValue(0);
    clawShake.setValue(0);
    slideAnim.setValue(0);

    if (gameWidth) {
      setClawX(gameWidth / 2 - CLAW_WIDTH / 2);
    }

    respawnPrize(0);
    respawnPrize(1);
    respawnPrize(2);
  };

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/makai_neon_transparent.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Makai Claw Game</Text>

        <GameStatusBar score={score} resetGame={resetGame} />
      </View>

      {/* Game Area */}
      <View
        style={styles.gameArea}
        onLayout={(e) => {
          const width = e.nativeEvent.layout.width;
          const height = e.nativeEvent.layout.height;
          setGameWidth(width);
          setGameHeight(height);

          setClawX(width / 2 - CLAW_WIDTH / 2);

          Animated.timing(clawY, {
            toValue: INITIAL_CLAW_Y,
            duration: 500,
            useNativeDriver: false,
          }).start();
        }}
      >
        {/* Claw */}
        <Claw
          clawImg={require("../../assets/images/claw_transparent.png")}
          clawX={clawX}
          clawY={clawY}
          clawScaleY={clawGrip.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.7],
          })}
          shakeOffset={clawShake.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 5],
          })}
        />

        {/* Prizes */}
        <PrizeRow
          prizes={prizes}
          prizeImages={prizeImages}
          gameHeight={gameHeight}
          prizeWiggleRotation={prizeWiggleRotation}
        />

        {/* Attached Prize */}
        {grabbedIndex !== null && prizes[grabbedIndex] && (
          <Animated.Image
            source={prizeImages[prizes[grabbedIndex].type]}
            style={[
              styles.prizeImage,
              { left: clawX, top: Animated.add(clawY, 20) },
            ]}
          />
        )}
      </View>

      {/* Sliding Prize Animation */}
      {slidingPrize && (
        <Animated.Image
          source={prizeImages[slidingPrize]}
          style={{
            width: PRIZE_IMAGE_SIZE,
            height: PRIZE_IMAGE_SIZE,
            position: "absolute",
            top: 120,
            left: clawX,
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 60],
                }),
              },
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 40],
                }),
              },
              {
                scale: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1.5, 1],
                }),
              },
            ],
            opacity: slideAnim,
          }}
        />
      )}

      {/* Drawer */}
      <Drawer wonPrize={wonPrize} prizeImages={prizeImages} />

      {/* Controls */}
      <Controls
        onLeftTap={moveLeft}
        onLeftPressIn={() => setLeftHeld(true)}
        onLeftPressOut={() => setLeftHeld(false)}
        onRightTap={moveRight}
        onRightPressIn={() => setRightHeld(true)}
        onRightPressOut={() => setRightHeld(false)}
        onDrop={() => dropClaw(clawX)}
      />

      <Text style={styles.version}>Version 1.0</Text>
    </View>
  );
}

// -----------------------------------------------------
// STYLES
// -----------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: "#000",
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 160,
    height: 60,
    resizeMode: "contain",
    marginBottom: 4,
  },
  title: {
    color: "white",
    fontSize: 24,
    marginBottom: 4,
  },
  gameArea: {
    flex: 1,
    backgroundColor: "#222",
    marginHorizontal: 20,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#555",
  },
  prizeImage: {
    width: PRIZE_IMAGE_SIZE,
    height: PRIZE_IMAGE_SIZE,
    position: "absolute",
    resizeMode: "contain",
  },
  version: {
    textAlign: "center",
    color: "#777",
    fontSize: 12,
    marginBottom: 6,
  },
});
