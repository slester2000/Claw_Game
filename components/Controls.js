import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Controls({ 
  onLeftPressIn, 
  onLeftPressOut,
  onLeftTap,
  onRightPressIn, 
  onRightPressOut,
  onRightTap,
  onDrop 
}) {
  return (
    <View style={styles.controls}>
      
      {/* LEFT BUTTON */}
      <Pressable
        style={styles.button}
        onPress={onLeftTap}
        onPressIn={onLeftPressIn}
        onPressOut={onLeftPressOut}
      >
        <Text style={styles.btnText}>◀</Text>
      </Pressable>

      {/* DROP BUTTON */}
      <Pressable 
        style={styles.button}
        onPress={onDrop}
      >
        <Text style={styles.btnText}>▼</Text>
      </Pressable>

      {/* RIGHT BUTTON */}
      <Pressable
        style={styles.button}
        onPress={onRightTap}
        onPressIn={onRightPressIn}
        onPressOut={onRightPressOut}
      >
        <Text style={styles.btnText}>▶</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    height: 120,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#444',
    padding: 20,
    borderRadius: 10,
  },
  btnText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
});

