import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// On définit ce que le composant accepte comme "paramètres" (props)
type Props = {
  rating: number;
  setRating?: (rating: number) => void; // Le ? veut dire "optionnel" (pour la lecture seule)
  isInteractive: boolean;
};

export default function StarRating({ rating, setRating, isInteractive }: Props) {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity 
          key={star} 
          disabled={!isInteractive} 
          onPress={() => setRating && setRating(star)}
        >
          <Text style={{ fontSize: isInteractive ? 30 : 20, color: star <= rating ? '#FFD700' : '#ccc' }}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  starContainer: { flexDirection: 'row', marginVertical: 5 }
});