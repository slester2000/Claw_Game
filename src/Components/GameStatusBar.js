import { View, Text, Pressable, StyleSheet } from 'react-native'

export default function GameStatusBar({
    score,
    resetGame,
    })
{

return(
 <View style={styles.container}>
  <Text style={styles.scoreText}>Score: {score}</Text>

  <Pressable style={styles.resetButton} onPress={resetGame}>
    <Text style={styles.resetText}>RESET</Text>
  </Pressable>
</View>
 
 
)}

const styles= StyleSheet.create({
    container: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
},

scoreText: {
  color: "white",
  fontSize: 18,
},

resetButton: {
  backgroundColor: "#333",
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 6,
},

resetText: {
  color: "white",
  fontSize: 16,
},

}
)