import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Controls({ 
  onLeftPressIn, 
  onLeftPressOut,
  onLeftTap,
  onRightPressIn, 
  onRightPressOut,
  onRightTap,
  onDrop,
  disabled,
}) {
  return (
    <View style={styles.controls}>
      
      {/* LEFT BUTTON */}
      <Pressable
        style={styles.button}
        onPress={onLeftTap}
        onPressIn={onLeftPressIn}
        onPressOut={onLeftPressOut}
        disabled ={disabled}
      >
        <Text style={styles.btnText}>◀</Text>
      </Pressable>

      {/* DROP BUTTON */}
      <Pressable 
        style={styles.button}
        onPress={onDrop}
        disabled={disabled}
      >
        <Text style={styles.btnText}>▼</Text>
      </Pressable>

      {/* RIGHT BUTTON */}
      <Pressable
        style={styles.button}
        onPress={onRightTap}
        onPressIn={onRightPressIn}
        onPressOut={onRightPressOut}
        disabled={disabled}
      >
        <Text style={styles.btnText}>▶</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  button: {
    height:75,
    backgroundColor: '#444',
    padding:20,
    borderRadius: 10,
    marginBottom:15,

  },
  btnText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    
    
  },
});

