// app/Components/Drawer.js
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';

export default function Drawer({ wonPrize, prizeImages }) {
  return (
    <View style={styles.overlayContainer}>
      <View style={styles.inner}>
        <Text style={styles.title}>Prize Drawer</Text>

        {wonPrize.length === 0 ? (
          <Text style={styles.emptyText}>No prizes yet...</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.prizeRow}
          >
            {wonPrize.map(prize => (
              <View key={prize.id} style={styles.prizeSlot}>
                <Image
                  source={prizeImages[prize.type]}
                  style={styles.prizeImage}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 140,        // 🔹 sits above the controls bar – tweak as needed
    zIndex: 50,
    paddingHorizontal: 20,
  },
  inner: {
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#444',
    paddingVertical: 8,
    paddingHorizontal: 10,
    height:70,
    justifyContent:'center',
  },
  title: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  emptyText: {
    color: '#777',
    fontSize: 12,
  },
  prizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height:'100%'
  },
  prizeSlot: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  prizeImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});
