import {View,StyleSheet, _View} from 'react-native';
import GameScreen from '../src/screens/GameScreen';

export default function Index(){
  return(
    <View style={styles.container}>
      <GameScreen />
    </View>
  );
}

const styles=StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:"#111",
  },
});
