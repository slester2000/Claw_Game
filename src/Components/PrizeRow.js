import { Animated, StyleSheet } from 'react-native';
import { PRIZE_IMAGE_SIZE } from '../Constants/constants';




export default function PrizeRow({prizes,prizeImages,gameHeight,prizeWiggleRotation})

{ if (!gameHeight) return null;
  

return(
<>
  {prizes.map((p, index) =>
    !p.grabbed && (
      <Animated.Image
        key={index}
        source={prizeImages[p.type]}
        style={[
          styles.prizeImage,
          { left: p.x, bottom:0
           },
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
    width: PRIZE_IMAGE_SIZE,
    height: PRIZE_IMAGE_SIZE,
    resizeMode: "contain",
    position: 'absolute',
  },
})