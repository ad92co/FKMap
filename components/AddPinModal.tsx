import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { FlatList, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  // 🔑 AJOUT DES PROPRIÉTÉS PARTENAIRES :
  partnersList: string[]; // Liste de tous les partenaires déjà rencontrés
  currentPartners: string[]; // Tableau des partenaires pour le pin en cours
  setCurrentPartners: (partners: string[]) => void; // Fonction pour mettre à jour la sélection
};

export default function AddPinModal(props: Props) {
  const [newPartnerInput, setNewPartnerInput] = React.useState('');
  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || props.date;
    if (Platform.OS === 'android') props.setShowDatePicker(false);
    props.setDate(currentDate);

    
  };

  const handleAddPartner = (partnerName?: string) => {
        const name = (partnerName || newPartnerInput).trim();
        
        if (name && !props.currentPartners.includes(name)) {
            // Supprime 'Solo' si on ajoute un nom réel
            let updatedPartners = props.currentPartners.filter(p => p !== 'Solo');
            props.setCurrentPartners([...updatedPartners, name]);
            setNewPartnerInput(''); // Nettoyer l'input après l'ajout
        }
    };

    const handleRemovePartner = (name: string) => {
        let updatedPartners = props.currentPartners.filter(p => p !== name);
        // Si la liste devient vide, remettre 'Solo'
        if (updatedPartners.length === 0) {
            updatedPartners = ['Solo'];
        }
        props.setCurrentPartners(updatedPartners);
    };
    
    // ↑ ↑ ↑ FIN DES NOUVELLES FONCTIONS ↑ ↑ ↑

    

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
          
          <Text style={styles.sectionTitle}>
                Partenaires ({props.currentPartners.length})
            </Text>

            {/* Affichage des tags (Partenaires sélectionnés) */}
            <View style={styles.partnersTagsContainer}>
                {props.currentPartners.map(partner => (
                    <TouchableOpacity 
                        key={partner} 
                        style={[styles.partnerTag, partner === 'Solo' && styles.soloTag]}
                        onPress={() => partner !== 'Solo' && handleRemovePartner(partner)}
                    >
                        <Text style={styles.tagText}>
                            {partner} {partner !== 'Solo' ? '×' : ''}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {/* Champ de Saisie pour Ajouter un Nouveau Partenaire */}
            <TextInput
                style={styles.input}
                placeholder="Ajouter un nouveau partenaire (Entrée)"
                value={newPartnerInput}
                onChangeText={setNewPartnerInput}
                onSubmitEditing={() => handleAddPartner()} // Appelle la fonction sans argument
            />
            {/* Liste des partenaires existants pour la sélection rapide */}
            <View style={styles.partnersExistingContainer}>
                <Text style={{fontSize: 12, color: '#666', marginBottom: 5}}>Choisir un partenaire précédent :</Text>
                <View style={styles.partnersListRow}>
                  {/* Filtre la liste pour ne montrer que les partenaires non encore sélectionnés */}
                  <FlatList
                    horizontal
                    data={props.partnersList.filter(p => !props.currentPartners.includes(p))}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        key={item}
                        style={styles.partnerBadge}
                        onPress={() => handleAddPartner(item)} // Appelle la fonction avec l'argument
                      >
                        <Text style={styles.badgeText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
            </View>
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
  buttonText: { color: 'white', fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
  partnersTagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  partnerTag: { backgroundColor: '#2196F3', padding: 8, borderRadius: 15, marginRight: 5, marginBottom: 5 },
  soloTag: { backgroundColor: '#FFC107' }, 
  tagText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  partnersExistingContainer: { marginBottom: 10 },
  partnersListRow: { flexDirection: 'row', flexWrap: 'wrap' },
  partnerBadge: {
    backgroundColor: '#eee',
    padding: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  badgeText: { fontSize: 13, color: '#333' },
});
