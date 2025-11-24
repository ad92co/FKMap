import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Keyboard, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import MapView, { Marker } from 'react-native-maps';

// --- NOS COMPOSANTS ---
import AddPinModal from '../../components/AddPinModal';
import StarRating from '../../components/StarRating';

// Config Calendrier FR
LocaleConfig.locales['fr'] = {
  monthNames: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  monthNamesShort: ['Janv.','Févr.','Mars','Avril','Mai','Juin','Juil.','Août','Sept.','Oct.','Nov.','Déc.'],
  dayNames: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
  dayNamesShort: ['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.'],
  today: "Aujourd'hui"
};
LocaleConfig.defaultLocale = 'fr';

export default function App() {
  const [currentTab, setCurrentTab] = useState('map'); 
  
  // --- DONNÉES LOCALES (Tableau simple) ---
  const [pins, setPins] = useState<any[]>([]);

  // --- CARTE & NAVIGATION ---
  const [region, setRegion] = useState({ latitude: 48.8566, longitude: 2.3522, latitudeDelta: 0.0922, longitudeDelta: 0.0421 });
  const mapRef = useRef<MapView>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');

  // --- FORMULAIRE ---
  const [modalVisible, setModalVisible] = useState(false);
  const [tempCoordinate, setTempCoordinate] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- CONSULTATION ---
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);

  // --- FONCTIONS ---

  const handleSearchAddress = async () => {
    if (searchAddress.length === 0) return;
    Keyboard.dismiss();
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Erreur', 'Permission refusée'); return; }
      let geocode = await Location.geocodeAsync(searchAddress);
      if (geocode.length > 0) {
        const result = geocode[0];
        const newRegion = { latitude: result.latitude, longitude: result.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
      } else { Alert.alert("Oups", "Adresse introuvable"); }
    } catch (error) { Alert.alert("Erreur", "Problème de recherche."); }
  };

  const markedDates = useMemo(() => {
    let marks: any = {};
    pins.forEach(pin => {
      if(pin.dateISO) marks[pin.dateISO] = { marked: true, dotColor: 'tomato' };
    });
    return marks;
  }, [pins]);

  const onDayPress = (day: any) => {
    const foundPin = pins.find(p => p.dateISO === day.dateString);
    if (foundPin) {
      setCalendarVisible(false);
      setTimeout(() => setSelectedPin(foundPin), 500);
    }
  };

  const startAddingPin = () => { setIsSelecting(true); setSearchAddress(''); setSelectedPin(null); };

  const confirmLocation = () => {
    setTempCoordinate({ latitude: region.latitude, longitude: region.longitude });
    setIsSelecting(false);
    setTitle(''); setDescription(''); setRating(0); setDate(new Date());
    setModalVisible(true);
  };

  // SAUVEGARDE LOCALE
  const savePin = () => {
    if (!title) return;
    
    const isoDate = date.toISOString().split('T')[0];
    
    const newPin = {
      id: Date.now().toString(), // ID simple basé sur l'heure
      coordinate: tempCoordinate,
      title: title,
      description: description,
      rating: rating,
      dateISO: isoDate,
      dateReadable: date.toLocaleDateString(),
    };

    setPins([...pins, newPin]); // On ajoute au tableau local
    setModalVisible(false);
  };

  // --- RENDER ---
  const renderMapScreen = () => (
    <View style={{ flex: 1 }}>
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

      {isSelecting && (
        <>
          <View style={styles.searchContainer}>
            <TextInput style={styles.searchInput} placeholder="Rechercher adresse..." value={searchAddress} onChangeText={setSearchAddress} onSubmitEditing={handleSearchAddress} />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearchAddress}><Ionicons name="search" size={20} color="white" /></TouchableOpacity>
          </View>
          <View style={styles.centerMarkerContainer} pointerEvents="none"><Text style={{fontSize: 40, marginBottom: 35}}>📍</Text></View>
          <View style={styles.selectionButtonsContainer}>
            <TouchableOpacity style={[styles.selectionBtn, styles.cancelBtn]} onPress={() => setIsSelecting(false)}><Text style={styles.btnText}>Annuler</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.selectionBtn, styles.confirmBtn]} onPress={confirmLocation}><Text style={styles.btnText}>Valider ici</Text></TouchableOpacity>
          </View>
        </>
      )}

      {!isSelecting && (
        <TouchableOpacity style={styles.fab} onPress={startAddingPin}><Ionicons name="add" size={35} color="white" /></TouchableOpacity>
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
              <StarRating rating={item.rating} isInteractive={false} />
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
      </View>

      <View style={styles.tabBar}>
        {['map', 'history', 'stats', 'badges', 'groups'].map(tab => (
           <TouchableOpacity key={tab} onPress={() => setCurrentTab(tab)} style={styles.tabItem}>
             <Ionicons name={tab === 'map' ? 'map' : tab === 'history' ? 'list' : tab === 'stats' ? 'bar-chart' : tab === 'badges' ? 'trophy' : 'people'} size={24} color={currentTab === tab ? '#2196F3' : '#aaa'} />
             <Text style={[styles.tabText, {color: currentTab === tab ? '#2196F3' : '#aaa'}]}>{tab}</Text>
           </TouchableOpacity>
        ))}
      </View>

      <Modal visible={calendarVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Mon Calendrier 📅</Text>
                <Calendar markedDates={markedDates} onDayPress={onDayPress} theme={{ todayTextColor: '#2196F3', arrowColor: '#2196F3', dotColor: 'tomato', selectedDotColor: 'tomato' }} />
                <TouchableOpacity onPress={() => setCalendarVisible(false)} style={[styles.button, styles.closeButton, {marginTop: 20}]}><Text style={styles.buttonText}>Fermer</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>

      <AddPinModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={savePin}
        title={title} setTitle={setTitle}
        description={description} setDescription={setDescription}
        rating={rating} setRating={setRating}
        date={date} setDate={setDate}
        showDatePicker={showDatePicker} setShowDatePicker={setShowDatePicker}
      />

      <Modal visible={selectedPin !== null} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPin && (
              <>
                <View style={styles.miniMapContainer}>
                   <MapView style={styles.miniMap} scrollEnabled={false} zoomEnabled={false} initialRegion={{ latitude: selectedPin.coordinate.latitude, longitude: selectedPin.coordinate.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 }}><Marker coordinate={selectedPin.coordinate} pinColor="tomato" /></MapView>
                </View>
                <Text style={styles.modalTitle}>{selectedPin.title}</Text>
                <Text style={styles.dateBadge}>{selectedPin.dateReadable}</Text>
                <View style={{marginVertical: 10}}>
                    <StarRating rating={selectedPin.rating} isInteractive={false} />
                </View>
                <Text style={styles.descriptionText}>{selectedPin.description}</Text>
                <TouchableOpacity onPress={() => setSelectedPin(null)} style={[styles.button, styles.closeButton]}><Text style={styles.buttonText}>Fermer</Text></TouchableOpacity>
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
  topHeader: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  calendarIcon: { backgroundColor: 'white', padding: 10, borderRadius: 25, elevation: 5, shadowOpacity: 0.2 },
  searchContainer: { position: 'absolute', top: 50, left: 20, right: 20, zIndex: 20, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, backgroundColor: 'white', height: 50, borderRadius: 25, paddingHorizontal: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.2 },
  searchButton: { marginLeft: 10, width: 50, height: 50, backgroundColor: '#2196F3', borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  centerMarkerContainer: { position: 'absolute', top:0, bottom:0, left:0, right:0, justifyContent:'center', alignItems:'center', zIndex:10 },
  selectionButtonsContainer: { position: 'absolute', bottom: 30, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  selectionBtn: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: 30, elevation: 5 },
  cancelBtn: { backgroundColor: 'white' },
  confirmBtn: { backgroundColor: '#2196F3' },
  btnText: { fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', height: 70, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 10 },
  tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  tabText: { fontSize: 10, marginTop: 4 },
  historyContainer: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f5f5f5' },
  pageTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color:'#333' },
  historyCard: { backgroundColor: 'white', padding: 15, borderRadius: 15, marginBottom: 15, elevation:2 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  historyDate: { fontSize: 12, color: '#888' },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#2196F3', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '85%', backgroundColor: 'white', padding: 20, borderRadius: 20, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333', textAlign:'center' },
  miniMapContainer: { height: 150, borderRadius: 15, overflow: 'hidden', marginBottom: 15, width: '100%' },
  miniMap: { width: '100%', height: '100%' },
  dateBadge: { alignSelf:'flex-start', fontSize: 12, color: 'white', backgroundColor: '#2196F3', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10, overflow: 'hidden', marginBottom: 5 },
  descriptionText: { fontSize: 16, color: '#555', marginBottom: 20, fontStyle: 'italic' },
  button: { padding: 12, borderRadius: 10, minWidth: 100, alignItems: 'center' },
  closeButton: { backgroundColor: '#2196F3', width: '100%' },
  buttonText: { color: 'white', fontWeight: 'bold' }
});