import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  isSaving: boolean;
  
  // On met un ? pour dire que c'est optionnel (évite les bugs si oublié)
  currentPartners?: string[]; 
  setCurrentPartners?: (p: string[]) => void;
};

export default function AddPinModal(props: Props) {
  const [newPartnerInput, setNewPartnerInput] = useState('');

  // 🛡️ SÉCURITÉ : Si currentPartners est vide/undefined, on utilise une liste vide []
  const partnersSafe = props.currentPartners || ['Solo'];

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || props.date;
    if (Platform.OS === 'android') props.setShowDatePicker(false);
    props.setDate(currentDate);
  };

  const handleAddPartner = () => {
    const name = newPartnerInput.trim();
    // On utilise partnersSafe ici pour ne pas planter
    if (name && !partnersSafe.includes(name) && props.setCurrentPartners) {
      const updatedPartners = partnersSafe.filter(p => p !== 'Solo');
      props.setCurrentPartners([...updatedPartners, name]);
      setNewPartnerInput('');
    }
  };

  const handleRemovePartner = (name: string) => {
    // On utilise partnersSafe ici pour ne pas planter
    let updatedPartners = partnersSafe.filter(p => p !== name);
    if (updatedPartners.length === 0) {
        updatedPartners = ['Solo'];
    }
    if (props.setCurrentPartners) {
        props.setCurrentPartners(updatedPartners);
    }
  };

  return (
    <Modal visible={props.visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Nouveau Souvenir 📍</Text>
            
            <TextInput style={styles.input} placeholder="Titre du lieu" value={props.title} onChangeText={props.setTitle} />
            
            <TouchableOpacity style={styles.dateButton} onPress={() => props.setShowDatePicker(true)}>
              <Text style={styles.dateText}>📅 {props.date.toLocaleDateString()}</Text>
            </TouchableOpacity>
            
            {(props.showDatePicker || Platform.OS === 'ios') && (Platform.OS === 'ios' ? true : props.showDatePicker) && (
                <DateTimePicker value={props.date} mode="date" display="default" onChange={onChangeDate} />
            )}
            
            {/* Utilisation de partnersSafe pour l'affichage */}
            <Text style={styles.sectionTitle}>Avec qui ? ({partnersSafe.length})</Text>
            
            <View style={styles.addPartnerRow}>
                <TextInput 
                    style={[styles.input, {marginBottom: 0, flex: 1}]}
                    placeholder="Ajouter un ami..."
                    value={newPartnerInput}
                    onChangeText={setNewPartnerInput}
                    onSubmitEditing={handleAddPartner}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddPartner}>
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.partnersTagsContainer}>
                {partnersSafe.map((partner, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={[styles.partnerTag, partner === 'Solo' ? styles.soloTag : null]}
                        onPress={() => partner !== 'Solo' && handleRemovePartner(partner)}
                        disabled={partner === 'Solo'}
                    >
                        <Text style={styles.tagText}>{partner} {partner !== 'Solo' && " ✕"}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TextInput style={[styles.input, { height: 80, marginTop:10 }]} placeholder="Racontez votre expérience..." multiline={true} value={props.description} onChangeText={props.setDescription} />
            
            <Text style={{marginBottom:5, fontWeight:'bold'}}>Note :</Text>
            <StarRating rating={props.rating} setRating={props.setRating} isInteractive={true} />

            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={props.onClose} style={[styles.button, styles.cancelButton]}>
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={props.onSave} disabled={props.isSaving} style={[styles.button, styles.saveButton, props.isSaving && {opacity: 0.5}]}>
                {props.isSaving ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.buttonText}>Sauvegarder</Text>}
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '90%', maxHeight: '90%', backgroundColor: 'white', padding: 20, borderRadius: 20, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333', textAlign:'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 10, marginBottom: 15, width: '100%', backgroundColor:'#f9f9f9' },
  dateButton: { backgroundColor:'#e3f2fd', padding:10, borderRadius:10, marginBottom:15, alignItems:'center' },
  dateText: { color:'#2196F3', fontWeight:'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 5, marginBottom: 10, color: '#333' },
  addPartnerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  addButton: { backgroundColor: '#2196F3', width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  partnersTagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  partnerTag: { backgroundColor: '#2196F3', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  soloTag: { backgroundColor: '#FFC107' },
  tagText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  button: { padding: 12, borderRadius: 10, minWidth: 100, alignItems: 'center', justifyContent:'center' },
  saveButton: { backgroundColor: '#4CAF50' },
  cancelButton: { backgroundColor: '#ff5252' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});