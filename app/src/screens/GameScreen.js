import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import Controls from "../../../components/Controls";
import GameStatusBar from '../../../components/GameStatusBar';
import prizeImages from '../../../components/prizeItems';
import Claw from "../../../components/Claw"

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------
const INITIAL_CLAW_Y = 20;
const CLAW_WIDTH = 40;
const CLAW_IMAGE_SIZE = 50;
const PRIZE_WIDTH = 40;
const PRIZE_IMAGE_SIZE = 50;
const PRIZE_FLOOR_OFFSET = 50;
const MOVE_STEP = 10;
const HOLD_INTERVAL_MS = 100;
const MIN_PRIZE_SPACING = 50;

const DROP_DURATION = 1200;
const LIFT_DURATION = 1200;
const GRIP_CLOSE_DURATION = 150;
const GRIP_OPEN_DURATION = 150;
const SHAKE_DURATION = 50;
const SLIDE_DURATION = 500;

// --------------------------------------------------
// ASSETS
// --------------------------------------------------
const makaiName = require('../../../assets/images/makai_neon_transparent.png');
const clawImg = require('../../../assets/images/claw_transparent.png');

const plushTypes = ['giraffe', 'deer', 'kitten'];

// --------------------------------------------------
// HELPER FUNCTIONS
// --------------------------------------------------
function getNonOverlappingX(prizes, gameWidth) {
  const minSpacing = MIN_PRIZE_SPACING;
  let x;
  let isOverlapping = true;

  if (!gameWidth) {
    // Fallback if layout not ready yet
    return 40;
  }

  while (isOverlapping) {
    x = Math.floor(Math.random() * (gameWidth - PRIZE_WIDTH));
    isOverlapping = prizes.some(p => Math.abs(p.x - x) < minSpacing);
  }

  return x;
}

function getRandomPlush() {
  return plushTypes[Math.floor(Math.random() * plushTypes.length)];
}

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------
export default function GameScreen() {
  // -----------------------------
  // SOUND SETUP
  // -----------------------------
  const moveSound = useRef(null);
  const dropSound = useRef(null);
  const grabSound = useRef(null);
  const winSound = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSounds() {
      try {
        if (!isMounted) return;

        moveSound.current = new Audio.Sound();
        dropSound.current = new Audio.Sound();
        grabSound.current = new Audio.Sound();
        winSound.current = new Audio.Sound();

        await moveSound.current.loadAsync(
          require('../../../assets/sounds/move.mp3')
        );
        await dropSound.current.loadAsync(
          require('../../../assets/sounds/drop.mp3')
        );
        await grabSound.current.loadAsync(
          require('../../../assets/sounds/grab.mp3')
        );
        await winSound.current.loadAsync(
          require('../../../assets/sounds/win.mp3')
        );
      } catch (e) {
        console.warn('Error loading sounds:', e);
      }
    }

    loadSounds();

    return () => {
      isMounted = false;

      const unloadPromises = [];

      if (moveSound.current) {
        unloadPromises.push(moveSound.current.unloadAsync());
      }
      if (dropSound.current) {
        unloadPromises.push(dropSound.current.unloadAsync());
      }
      if (grabSound.current) {
        unloadPromises.push(grabSound.current.unloadAsync());
      }
      if (winSound.current) {
        unloadPromises.push(winSound.current.unloadAsync());
      }

      Promise.all(unloadPromises).catch(() => {});
    };
  }, []);
//-----------------------
// prize Wiggle effect
//-----------------------
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(prizeWiggle,{
          toValue:1,
          duration:800,
          useNativeDriver:false
        }),
        Animated.timing(prizeWiggle,{
          toValue:1,
          duration:800,
          useNativeDriver:false,

        }),
      ])
    ).start();
  },[]);
      
  // -----------------------------
  // STATE & REFS
  // -----------------------------
  const [clawX, setClawX] = useState(0);
  const [gameWidth, setGameWidth] = useState(null);
  const [gameHeight, setGameHeight] = useState(null);
  const [score, setScore] = useState(0);
  const [wonPrize, setWonPrize] = useState([]);
  const [leftHeld, setLeftHeld] = useState(false);
  const [rightHeld, setRightHeld] = useState(false);
  const [slidingPrize, setSlidingPrize] = useState(null);
  const [grabbedIndex, setGrabbedIndex] = useState(null);

  const clawY = useRef(new Animated.Value(INITIAL_CLAW_Y)).current;
  const clawGrip = useRef(new Animated.Value(0)).current;
  const clawShake = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const prizeWiggle = useRef(new Animated.Value(0)).current;

  const prizeCounter = useRef(0);

  const [prizes, setPrizes] = useState([
    { x: 40, grabbed: false, type: 'deer' },
    { x: 140, grabbed: false, type: 'giraffe' },
    { x: 240, grabbed: false, type: 'kitten' },
  ]);

  // Derived animation values
  const clawScaleY = clawGrip.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.7],
  });

  const shakeOffset = clawShake.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 5],
  });

  const prizeWiggleRotation =
  prizeWiggle.interpolate({
    inputRange:[0,1],
    outputRange:['-3deg', '3deg']
    });

  // -----------------------------
  // MOVEMENT
  // -----------------------------
  const moveLeft = () => {
    if (gameWidth === null) return;
    const minX = 0;
    setClawX(prev => Math.max(prev - MOVE_STEP, minX));
  };

  const moveRight = () => {
    if (gameWidth === null) return;
    const maxX = gameWidth - CLAW_WIDTH;
    setClawX(prev => Math.min(prev + MOVE_STEP, maxX));
  };

  // Continuous movement when buttons are held
  useEffect(() => {
    let interval = null;

    if (leftHeld) {
      interval = setInterval(() => {
        moveLeft();
      }, HOLD_INTERVAL_MS);
    } else if (rightHeld) {
      interval = setInterval(() => {
        moveRight();
      }, HOLD_INTERVAL_MS);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [leftHeld, rightHeld, gameWidth]);

  // -----------------------------
  // COLLISION & GRAB LOGIC
  // -----------------------------
  const detectCollision = () => {
    const clawLeft = clawX;
    const clawRight = clawX + CLAW_WIDTH;

    const hitIndex = prizes.findIndex(p => {
      const prizeLeft = p.x;
      const prizeRight = p.x + PRIZE_WIDTH;

      const overlap = clawRight > prizeLeft && clawLeft < prizeRight;
      return overlap;
    });

    if (hitIndex !== -1) {
      grabPrize(hitIndex);
    }
  };

  const grabPrize = index => {
    setPrizes(prev => {
      const updated = [...prev];
      updated[index].grabbed = true;
      return updated;
    });
    setGrabbedIndex(index);

    Animated.timing(clawGrip, {
      toValue: 1,
      duration: GRIP_CLOSE_DURATION,
      useNativeDriver: false,
    }).start();
  };

  // -----------------------------
  // LIFT CLAW BACK UP
  // -----------------------------
  const raiseClaw = () => {
    Animated.timing(clawY, {
      toValue: INITIAL_CLAW_Y,
      duration: LIFT_DURATION,
      useNativeDriver: false,
    }).start(() => {
      setGrabbedIndex(prevIndex => {
        if (prevIndex !== null) {
          if (winSound.current) {
            winSound.current.replayAsync().catch(() => {});
          }

          const type = prizes[prevIndex].type;
          setSlidingPrize(type);
          slideAnim.setValue(0);

          setScore(prev => prev + 1);

          Animated.timing(slideAnim, {
            toValue: 1,
            duration: SLIDE_DURATION,
            useNativeDriver: false,
          }).start(() => {
            setWonPrize(prev => [
              ...prev,
              {
                id: prizeCounter.current++,
                type: prizes[prevIndex].type,
              },
            ]);

            setSlidingPrize(null);

            // Respawn that prize at a new location with a random type
            setPrizes(prevPrizes => {
              const updated = [...prevPrizes];
              const newPrizesForX = updated.filter((_, i) => i !== prevIndex);
              const newX = getNonOverlappingX(newPrizesForX, gameWidth);

              updated[prevIndex] = {
                x: newX,
                grabbed: false,
                type: getRandomPlush(),
              };
              return updated;
            });
          });

          Animated.timing(clawGrip, {
            toValue: 0,
            duration: GRIP_OPEN_DURATION,
            useNativeDriver: false,
          }).start();

          return null;
        }

        Animated.timing(clawGrip, {
          toValue: 0,
          duration: GRIP_OPEN_DURATION,
          useNativeDriver: false,
        }).start();

        return prevIndex;
      });
    });
  };

  // -----------------------------
  // DROP CLAW
  // -----------------------------
  const dropClaw = () => {
    if (!gameHeight) return;

    if (dropSound.current) {
      dropSound.current.replayAsync().catch(() => {});
    }

    const bottom = gameHeight - PRIZE_FLOOR_OFFSET;

    Animated.timing(clawY, {
      toValue: bottom,
      duration: DROP_DURATION,
      useNativeDriver: false,
    }).start(() => {
      Animated.sequence([
        Animated.timing(clawShake, {
          toValue: 1,
          duration: SHAKE_DURATION,
          useNativeDriver: false,
        }),
        Animated.timing(clawShake, {
          toValue: 0,
          duration: SHAKE_DURATION,
          useNativeDriver: false,
        }),
      ]).start();

      if (grabSound.current) {
        grabSound.current.replayAsync().catch(() => {});
      }

      Animated.timing(clawGrip, {
        toValue: 1,
        duration: GRIP_CLOSE_DURATION,
        useNativeDriver: false,
      }).start();

      detectCollision();
      raiseClaw();
    });
  };

  // -----------------------------
  // RESET GAME
  // -----------------------------
  const resetGame = () => {
    setScore(0);
    setWonPrize([]);
    setSlidingPrize(null);
    setGrabbedIndex(null);
    setLeftHeld(false);
    setRightHeld(false);
    prizeCounter.current = 0;

    clawY.setValue(INITIAL_CLAW_Y);
    clawGrip.setValue(0);
    clawShake.setValue(0);
    slideAnim.setValue(0);

    if (gameWidth) {
      setClawX(gameWidth / 2 - CLAW_WIDTH / 2);
    }

    setPrizes(prev => {
      const newPrizes = [];
      const count = prev.length || 3;

      for (let i = 0; i < count; i++) {
        const x = getNonOverlappingX(newPrizes, gameWidth);
        newPrizes.push({
          x,
          grabbed: false,
          type: getRandomPlush(),
        });
      }

      return newPrizes;
    });
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <View style={styles.container}>
      {/* TITLE / LOGO */}
      <View style={styles.header}>
        <Image source={makaiName} style={styles.logo} />
        <Text style={styles.title}>Makai Claw Game</Text>
        
        <GameStatusBar 
          score={score}
          resetGame={resetGame}
          />
      </View>

      
      {/* 🟨 GAME AREA (claw, rope, floor prizes, attached prize) */}
      <View
        style={styles.gameArea}
        onLayout={e => {
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

      <Claw
        clawImg ={clawImg}
        clawX ={clawX}
        clawY ={clawY}
        clawScaleY={clawScaleY}
        shakeOffset={shakeOffset}
      />

        {/* FLOOR PRIZES */}
        {gameHeight !== null &&
          prizes.map(
            (p, index) =>
              !p.grabbed && (
                <Animated.Image
                  key={index}
                  source={prizeImages[p.type]}
                  style={[
                    styles.prizeImage,
                    { left: p.x, top: gameHeight - PRIZE_FLOOR_OFFSET,
                      transform: [{
                        rotate:prizeWiggleRotation
                      }]
                     },
                  ]}
                />
              )
          )}

        {/* ATTACHED PRIZE TO CLAW */}
        {grabbedIndex !== null && prizes[grabbedIndex] && (
          <Animated.Image
            source={prizeImages[prizes[grabbedIndex].type]}
            style={[
              styles.prizeImage,
              {
                left: clawX,
                top: Animated.add(clawY, 20),
              },
            ]}
          />
        )}
      </View>

      {/* 🟦 SLIDING PRIZE (OUTSIDE GAME AREA) */}
      {slidingPrize && (
        <Animated.Image
          source={prizeImages[slidingPrize]}
          style={{
            width: PRIZE_IMAGE_SIZE,
            height: PRIZE_IMAGE_SIZE,
            position: 'absolute',
            top: 120,
            left: clawX,
            zIndex: 50,
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
            opacity: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          }}
        />
      )}

      {/* 🟩 WIN ZONE / DRAWER */}
      <View style={styles.drawer}>
        {wonPrize.map(item => (
          <Image
            key={item.id}
            source={prizeImages[item.type]}
            style={styles.drawerImage}
          />
        ))}
      </View>

        <View style={styles.controlsRow}></View>

        <Controls
          onLeftTap={moveLeft}
          onLeftPressIn={() => setLeftHeld(true)}
          onLeftPressOut={() => setLeftHeld(false)}

          onRightTap={moveRight}
          onRightPressIn={() => setRightHeld(true)}
          onRightPressOut={() => setRightHeld(false)}

          onDrop={dropClaw}
        />

      <Text style={styles.versionText}>Version 1.0</Text>
    </View>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 160,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontSize: 24,
    marginBottom: 4,
  },
  score: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 10,
  },
  gameArea: {
    flex: 1,
    backgroundColor: '#222',
    marginHorizontal: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#555',
  },

  prizeImage: {
    width: PRIZE_IMAGE_SIZE,
    height: PRIZE_IMAGE_SIZE,
    position: 'absolute',
    resizeMode: 'contain',
  },
  drawer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingVertical: 10,
    backgroundColor: '#333',
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  drawerImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    margin: 5,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#111',
    paddingBottom: 10,
    paddingTop: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flex: 1,
  },
  button: {
    backgroundColor: '#444',
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  btnText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  resetButton: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#888',
    backgroundColor: '#222',
  },
  resetText: {
    color: '#fff',
    fontSize: 16,
  },
  versionText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 12,
    marginBottom: 6,
  },
});
