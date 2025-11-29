import React from 'react';
import { Animated } from 'react-native';

export default function Claw({
  clawImg,
  clawX,
  clawY,
  clawScaleY,
  shakeOffset,
})

{
    return(
        //ROPE//
    <>
        <Animated.View
          style={{width: 4,
            backgroundColor: 'silver',
            position: 'absolute',
            top: 0,
            zIndex: 0,
            height: clawY,
            left: clawX + 23,}}
            
        />

        {/*claw Image */}
        <Animated.Image
          source={clawImg}
          style={{width: 50,
              height: 50,
              position: "absolute",
              left: clawX,
              top: clawY,
              transform: [{ scaleY: clawScaleY }, { translateX: shakeOffset }],
            }}
        />
    </>
    )
}


    
