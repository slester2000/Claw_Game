import { View, Text, Pressable } from 'react-native'

export default function GameStatusBar({
    score,
    resetGame,
    })
{

return(
    <View>
        <Text style ={{color:'white'}}> Score: {score}</Text>
        <Pressable 
        style={{color:'red'}} onPress={resetGame}
        >RESET</Pressable>

    </View>

)}