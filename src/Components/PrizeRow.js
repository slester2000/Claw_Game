import React from 'react';
import {StyleSheet,Animated} from 'react-native'




export default function PrizeRow({prizes,prizeImages,gameHeight,prizeWiggleRotation})
{ return(
<>
  {prizes.map((p, index) =>
    !p.grabbed && (
      <Animated.Image
        key={index}
        source={prizeImages[p.type]}
        style={[
          styles.prizeImage,
          { left: p.x, top: gameHeight - 50 },
          {transform: [{rotate:prizeWiggleRotation}]}
        ]}
      />
    )
  )}
</>
)
}

const styles = StyleSheet.create({
    prizeImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    position: "absolute",},
})