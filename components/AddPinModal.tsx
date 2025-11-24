import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import StarRating from './StarRating';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string; setTitle: (t: string) => void;
  description: string; setDescription: (d: string) => void;
  rating: number; setRating: (r: number) => void;
  date: Date; setDate: (d: Date) => void;
  showDatePicker: boolean; setShowDatePicker: (b: boolean) => void;
};

export default function AddPinModal(props: Props) {
  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || props.date;
    if (Platform.OS === 'android') props.setShowDatePicker(false);
    props.setDate(currentDate);
  };

  return (
    <Modal visible={props.visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nouveau Souvenir 📍</Text>
          
          <TextInput style={styles.input} placeholder="Titre" value={props.title} onChangeText={props.setTitle} />
          
          <TouchableOpacity style={styles.dateButton} onPress={() => props.setShowDatePicker(true)}>
            <Text style={styles.dateText}>📅 {props.date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          
          {(props.showDatePicker || Platform.OS === 'ios') && (Platform.OS === 'ios' ? true : props.showDatePicker) && (
              <DateTimePicker value={props.date} mode="date" display="default" onChange={onChangeDate} />
          )}

          <TextInput style={[styles.input, { height: 60, marginTop:10 }]} placeholder="Description..." multiline value={props.description} onChangeText={props.setDescription} />
          
          <Text style={{marginBottom:5}}>Note :</Text>
          <StarRating rating={props.rating} setRating={props.setRating} isInteractive={true} />

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={props.onClose} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={props.onSave} style={[styles.button, styles.saveButton]}>
              <Text style={styles.buttonText}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '85%', backgroundColor: 'white', padding: 20, borderRadius: 20, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333', textAlign:'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 10, marginBottom: 10, width: '100%', backgroundColor:'#f9f9f9' },
  dateButton: { backgroundColor:'#e3f2fd', padding:10, borderRadius:10, marginBottom:5, alignItems:'center' },
  dateText: { color:'#2196F3', fontWeight:'bold' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  button: { padding: 12, borderRadius: 10, minWidth: 100, alignItems: 'center' },
  saveButton: { backgroundColor: '#4CAF50' },
  cancelButton: { backgroundColor: '#ff5252' },
  buttonText: { color: 'white', fontWeight: 'bold' }
});