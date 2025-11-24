import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location'; // <--- Pour l'adresse
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Keyboard, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars'; // <--- Nouveau calendrier
import MapView, { Marker } from 'react-native-maps';

// Configuration du calendrier en Français
LocaleConfig.locales['fr'] = {
  monthNames: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  monthNamesShort: ['Janv.','Févr.','Mars','Avril','Mai','Juin','Juil.','Août','Sept.','Oct.','Nov.','Déc.'],
  dayNames: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
  dayNamesShort: ['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.'],
  today: "Aujourd'hui"
};
LocaleConfig.defaultLocale = 'fr';

export default function App() {
  // --- 1. DONNÉES & NAVIGATION ---
  const [currentTab, setCurrentTab] = useState('map'); 
  const [pins, setPins] = useState<any[]>([]);
  
  // --- 2. VARIABLES CARTE ---
  const [region, setRegion] = useState({
    latitude: 48.8566, longitude: 2.3522, latitudeDelta: 0.0922, longitudeDelta: 0.0421,
  });
  const mapRef = React.useRef<MapView>(null); // Pour contrôler la carte via le code

  // --- 3. GESTION DE L'AJOUT (MODE VISÉE + RECHERCHE) ---
  const [isSelecting, setIsSelecting] = useState(false);
  const [searchAddress, setSearchAddress] = useState(''); // Texte de l'adresse

  // --- 4. FORMULAIRE DE CRÉATION ---
  const [modalVisible, setModalVisible] = useState(false);
  const [tempCoordinate, setTempCoordinate] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- 5. CONSULTATION & CALENDRIER ---
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [calendarVisible, setCalendarVisible] = useState(false); // Modal du calendrier

  // --- FONCTIONS ---

  // A. RECHERCHE D'ADRESSE (Geocoding)
  const handleSearchAddress = async () => {
    if (searchAddress.length === 0) return;
    Keyboard.dismiss(); // Cacher le clavier

    try {
      // On demande la permission d'utiliser la loc (nécessaire pour le geocoding sur Android parfois)
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erreur', 'Permission de localisation refusée');
        return;
      }

      // On cherche l'adresse
      let geocode = await Location.geocodeAsync(searchAddress);

      if (geocode.length > 0) {
        const result = geocode[0];
        const newRegion = {
          latitude: result.latitude,
          longitude: result.longitude,
          latitudeDelta: 0.01, // Zoom proche
          longitudeDelta: 0.01,
        };
        // On déplace la carte
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
      } else {
        Alert.alert("Oups", "Adresse introuvable 😕");
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de trouver cette adresse.");
    }
  };

  // B. LOGIQUE CALENDRIER
  // Cette fonction transforme la liste des pins en marqueurs pour le calendrier
  const markedDates = useMemo(() => {
    let marks: any = {};
    pins.forEach(pin => {
      // Format YYYY-MM-DD nécessaire pour le calendrier
      const dateKey = pin.dateISO; 
      marks[dateKey] = { marked: true, dotColor: 'tomato' };
    });
    return marks;
  }, [pins]);

  const onDayPress = (day: any) => {
    // On cherche s'il y a un pin à cette date
    const foundPin = pins.find(p => p.dateISO === day.dateString);
    if (foundPin) {
      setCalendarVisible(false); // On ferme le calendrier
      setTimeout(() => setSelectedPin(foundPin), 500); // On ouvre la fiche (petit délai pour l'animation)
    } else {
        // Rien ce jour là
    }
  };

  // C. ACTIONS PRINCIPALES
  const startAddingPin = () => {
    setIsSelecting(true);
    setSearchAddress(''); // Reset barre de recherche
    setSelectedPin(null);
  };

  const confirmLocation = () => {
    setTempCoordinate({ latitude: region.latitude, longitude: region.longitude });
    setIsSelecting(false);
    setTitle(''); setDescription(''); setRating(0); setDate(new Date());
    setModalVisible(true);
  };

  const savePin = () => {
    if (!title) return;
    
    // On formate la date en YYYY-MM-DD pour le calendrier
    const isoDate = date.toISOString().split('T')[0];

    const newPin = {
      id: Date.now().toString(),
      coordinate: tempCoordinate,
      title: title,
      description: description,
      rating: rating,
      dateISO: isoDate, // Pour le tri et le calendrier
      dateReadable: date.toLocaleDateString(), // Pour l'affichage utilisateur
    };
    setPins([...pins, newPin]);
    setModalVisible(false);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === 'android') setShowDatePicker(false);
    setDate(currentDate);
  };

  const renderStars = (currentRating: number, isInteractive: boolean) => (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} disabled={!isInteractive} onPress={() => setRating(star)}>
          <Text style={{ fontSize: isInteractive ? 30 : 20, color: star <= currentRating ? '#FFD700' : '#ccc' }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // --- ECRANS ---

  const renderMapScreen = () => (
    <View style={{ flex: 1 }}>
      {/* HEADER FLOTTANT (Icône Calendrier) */}
      {!isSelecting && (
        <View style={styles.topHeader}>
            <TouchableOpacity style={styles.calendarIcon} onPress={() => setCalendarVisible(true)}>
                <Ionicons name="calendar" size={24} color="#2196F3" />
            </TouchableOpacity>
        </View>
      )}

      <MapView ref={mapRef} style={styles.map} region={region} onRegionChangeComplete={setRegion}>
        {pins.map((pin) => (
          <Marker key={pin.id} coordinate={pin.coordinate} pinColor="tomato" onPress={() => setSelectedPin(pin)} />
        ))}
      </MapView>

      {/* MODE VISEE + BARRE DE RECHERCHE */}
      {isSelecting && (
        <>
          {/* Barre de recherche d'adresse */}
          <View style={styles.searchContainer}>
            <TextInput 
                style={styles.searchInput} 
                placeholder="Entrez une adresse (ex: Tour Eiffel)..." 
                value={searchAddress}
                onChangeText={setSearchAddress}
                onSubmitEditing={handleSearchAddress} // Cherche quand on fait "Entrée"
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearchAddress}>
                <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Viseur Central */}
          <View style={styles.centerMarkerContainer} pointerEvents="none">
            <Text style={{fontSize: 40, marginBottom: 35}}>📍</Text>
          </View>

          {/* Boutons Valider/Annuler */}
          <View style={styles.selectionButtonsContainer}>
            <TouchableOpacity style={[styles.selectionBtn, styles.cancelBtn]} onPress={() => setIsSelecting(false)}>
              <Text style={styles.btnText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.selectionBtn, styles.confirmBtn]} onPress={confirmLocation}>
              <Text style={styles.btnText}>Valider ici</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {!isSelecting && (
        <TouchableOpacity style={styles.fab} onPress={startAddingPin}>
          <Ionicons name="add" size={35} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHistoryScreen = () => (
    <View style={styles.historyContainer}>
      <Text style={styles.pageTitle}>Mon Historique 📜</Text>
      <FlatList
        data={pins}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.historyCard} onPress={() => setSelectedPin(item)}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>{item.title}</Text>
              <Text style={styles.historyDate}>{item.dateReadable}</Text>
            </View>
            {renderStars(item.rating, false)}
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentArea}>
        {currentTab === 'map' && renderMapScreen()}
        {currentTab === 'history' && renderHistoryScreen()}
        {/* Autres onglets vides pour l'instant */}
      </View>

      {/* BARRE DE NAVIGATION */}
      <View style={styles.tabBar}>
        {['map', 'history', 'stats', 'badges', 'groups'].map(tab => (
           <TouchableOpacity key={tab} onPress={() => setCurrentTab(tab)} style={styles.tabItem}>
             <Ionicons 
                name={tab === 'map' ? 'map' : tab === 'history' ? 'list' : tab === 'stats' ? 'bar-chart' : tab === 'badges' ? 'trophy' : 'people'} 
                size={24} 
                color={currentTab === tab ? '#2196F3' : '#aaa'} 
             />
             <Text style={[styles.tabText, {color: currentTab === tab ? '#2196F3' : '#aaa'}]}>{tab}</Text>
           </TouchableOpacity>
        ))}
      </View>

      {/* --- MODAL CALENDRIER --- */}
      <Modal visible={calendarVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Mon Calendrier 📅</Text>
                <Calendar
                    markedDates={markedDates}
                    onDayPress={onDayPress}
                    theme={{
                        todayTextColor: '#2196F3',
                        arrowColor: '#2196F3',
                        dotColor: 'tomato',
                        selectedDotColor: 'tomato',
                    }}
                />
                <TouchableOpacity onPress={() => setCalendarVisible(false)} style={[styles.button, styles.closeButton, {marginTop: 20}]}>
                  <Text style={styles.buttonText}>Fermer</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* --- MODAL AJOUT --- */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouveau Souvenir 📍</Text>
            <TextInput style={styles.input} placeholder="Titre" value={title} onChangeText={setTitle} />
            
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>📅 {date.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {(showDatePicker || Platform.OS === 'ios') && (Platform.OS === 'ios' ? true : showDatePicker) && (
                <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
            )}

            <TextInput style={[styles.input, { height: 60, marginTop:10 }]} placeholder="Description..." multiline value={description} onChangeText={setDescription} />
            <Text style={{marginBottom:5}}>Note :</Text>
            {renderStars(rating, true)}
            
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.button, styles.cancelButton]}>
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={savePin} style={[styles.button, styles.saveButton]}>
                <Text style={styles.buttonText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL CONSULTATION --- */}
      <Modal visible={selectedPin !== null} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPin && (
              <>
                <View style={styles.miniMapContainer}>
                   <MapView style={styles.miniMap} scrollEnabled={false} zoomEnabled={false}
                     initialRegion={{
                        latitude: selectedPin.coordinate.latitude, longitude: selectedPin.coordinate.longitude,
                        latitudeDelta: 0.005, longitudeDelta: 0.005,
                     }}>
                      <Marker coordinate={selectedPin.coordinate} pinColor="tomato" />
                   </MapView>
                </View>
                <Text style={styles.modalTitle}>{selectedPin.title}</Text>
                <Text style={styles.dateBadge}>{selectedPin.dateReadable}</Text>
                <View style={{marginVertical: 10}}>{renderStars(selectedPin.rating, false)}</View>
                <Text style={styles.descriptionText}>{selectedPin.description}</Text>
                <TouchableOpacity onPress={() => setSelectedPin(null)} style={[styles.button, styles.closeButton]}>
                  <Text style={styles.buttonText}>Fermer</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentArea: { flex: 1 },
  map: { width: '100%', height: '100%' },
  
  // HEADER & SEARCH
  topHeader: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  calendarIcon: { backgroundColor: 'white', padding: 10, borderRadius: 25, elevation: 5, shadowOpacity: 0.2 },
  
  searchContainer: {
    position: 'absolute', top: 50, left: 20, right: 20, zIndex: 20,
    flexDirection: 'row', alignItems: 'center'
  },
  searchInput: {
    flex: 1, backgroundColor: 'white', height: 50, borderRadius: 25, paddingHorizontal: 20,
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.2
  },
  searchButton: {
    marginLeft: 10, width: 50, height: 50, backgroundColor: '#2196F3', borderRadius: 25,
    justifyContent: 'center', alignItems: 'center', elevation: 5
  },

  // VISEUR & BOUTONS
  centerMarkerContainer: { position: 'absolute', top:0, bottom:0, left:0, right:0, justifyContent:'center', alignItems:'center', zIndex:10 },
  selectionButtonsContainer: { position: 'absolute', bottom: 30, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  selectionBtn: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: 30, elevation: 5 },
  cancelBtn: { backgroundColor: 'white' },
  confirmBtn: { backgroundColor: '#2196F3' },
  btnText: { fontWeight: 'bold' },
  
  // NAVIGATION & LISTES
  tabBar: { flexDirection: 'row', height: 70, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 10 },
  tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  tabText: { fontSize: 10, marginTop: 4 },
  historyContainer: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f5f5f5' },
  pageTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color:'#333' },
  historyCard: { backgroundColor: 'white', padding: 15, borderRadius: 15, marginBottom: 15, elevation:2 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  historyDate: { fontSize: 12, color: '#888' },

  // FAB
  fab: { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#2196F3', justifyContent: 'center', alignItems: 'center', elevation: 5 },

  // MODALS & INPUTS
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '85%', backgroundColor: 'white', padding: 20, borderRadius: 20, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333', textAlign:'center' },
  miniMapContainer: { height: 150, borderRadius: 15, overflow: 'hidden', marginBottom: 15, width: '100%' },
  miniMap: { width: '100%', height: '100%' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 10, marginBottom: 10, width: '100%', backgroundColor:'#f9f9f9' },
  dateButton: { backgroundColor:'#e3f2fd', padding:10, borderRadius:10, marginBottom:5, alignItems:'center' },
  dateText: { color:'#2196F3', fontWeight:'bold' },
  dateBadge: { alignSelf:'flex-start', fontSize: 12, color: 'white', backgroundColor: '#2196F3', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10, overflow: 'hidden', marginBottom: 5 },
  descriptionText: { fontSize: 16, color: '#555', marginBottom: 20, fontStyle: 'italic' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  button: { padding: 12, borderRadius: 10, minWidth: 100, alignItems: 'center' },
  saveButton: { backgroundColor: '#4CAF50' },
  cancelButton: { backgroundColor: '#ff5252' },
  closeButton: { backgroundColor: '#2196F3', width: '100%' },
  buttonText: { color: 'white', fontWeight: 'bold' }
});