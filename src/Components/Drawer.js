import React from 'react';
import {View,Image,StyleSheet} from 'react-native'


export default function Drawer({wonPrize, prizeImages}){

return(
<View style={styles.drawer}>
        {wonPrize.map(item => (
          <Image
            key={item.id}
            source={prizeImages[item.type]}
            style={styles.drawerImage}
          />
        ))}
</View>
);
}

const styles=StyleSheet.create({
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
})