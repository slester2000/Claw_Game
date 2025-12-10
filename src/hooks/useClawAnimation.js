import { useRef,useEffect } from "react";
import { Animated } from "react-native";
import {
  INITIAL_CLAW_Y,
  GRIP_CLOSE_DURATION,
  GRIP_OPEN_DURATION,
  DROP_DURATION,
  LIFT_DURATION,
  SHAKE_DURATION,
  SLIDE_DURATION,
  PRIZE_FLOOR_OFFSET,
  CLAW_WIDTH
} from "../Constants/constants";

export default function useClawAnimation({
  gameHeight,
  detectCollision,
  awardPrize,
  respawnPrize,
  setSlidingPrize,
  grabbedIndexRef,
  setGrabbedIndex,
  sounds,
  onComplete,
  clawX,
}) {
  const clawY = useRef(new Animated.Value(INITIAL_CLAW_Y)).current;
  const clawGrip = useRef(new Animated.Value(0)).current;
  const clawShake = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const prizeWiggle = useRef(new Animated.Value(0)).current;

  const dropClaw = () => {
    if (!gameHeight) return;
    console.log(clawX)

    sounds?.drop?.();

    const bottom = gameHeight - PRIZE_FLOOR_OFFSET; //update bottom floor height,

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

      sounds?.grab?.();

      Animated.timing(clawGrip, {
        toValue: 1,
        duration: GRIP_CLOSE_DURATION,
        useNativeDriver: false,
      }).start();

      detectCollision(clawX,CLAW_WIDTH);
      console.log('dropClaw clawX:', clawX)
      

      raiseClaw(clawX);
    });
  };

  const raiseClaw = (clawX) => {
    Animated.timing(clawY, {
      toValue: INITIAL_CLAW_Y,
      duration: LIFT_DURATION,
      useNativeDriver: false,
    }).start(() => {
      if (grabbedIndexRef.current !== null) {

        const index =grabbedIndexRef.current;

        awardPrize(index);
        slideAnim.setValue(0);
      
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: SLIDE_DURATION,
          useNativeDriver: false,
        }).start(() => {
          respawnPrize(index);
          setSlidingPrize(null);
          setGrabbedIndex(null)
        });

        sounds?.win?.();

        Animated.timing(clawGrip, {
          toValue: 0,
          duration: GRIP_OPEN_DURATION,
          useNativeDriver: false,
        }).start(() =>{
          onComplete && onComplete();
        });

        setGrabbedIndex(null);
        return;
      }

      // No prize? Just open claw
      Animated.timing(clawGrip, {
        toValue: 0,
        duration: GRIP_OPEN_DURATION,
        useNativeDriver: false,
      }).start(() => {
        onComplete && onComplete();
      });
    });
  };

  useEffect(() =>{
    Animated.loop(
        Animated.sequence([
            Animated.timing(prizeWiggle,{
                toValue:1,
                duration:800,
                useNativeDriver:false,
            }),
            Animated.timing(prizeWiggle,{
                toValue:0,
                duration:800,
                useNativeDriver:false,
            })
        ])
    ).start();
  })

  return {
    clawY,
    clawGrip,
    clawShake,
    slideAnim,
    prizeWiggle,
    dropClaw,
  };
}
