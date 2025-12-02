import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
// Assurez-vous que le chemin est bon (../../firebaseConfig ou ../firebaseConfig selon votre dossier)
import { auth } from '../firebaseConfig';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true); // On lance le chargement
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      
      // 🛑 ICI C'EST LE CHANGEMENT IMPORTANT 🛑
      // Si on arrive ici, c'est que ça a marché.
      // ON NE FAIT RIEN. On ne met pas setLoading(false).
      // On laisse le composant parent (App) nous faire disparaître.
      
    } catch (error: any) {
      // Si on arrive ici, c'est qu'il y a une erreur.
      // Le composant est toujours là, donc on doit arrêter le chargement.
      setLoading(false); 

      let msg = "Une erreur est survenue.";
      if (error.code === 'auth/invalid-email') msg = "L'adresse email est invalide.";
      if (error.code === 'auth/user-not-found') msg = "Aucun utilisateur trouvé.";
      if (error.code === 'auth/wrong-password') msg = "Mot de passe incorrect.";
      if (error.code === 'auth/email-already-in-use') msg = "Cet email est déjà utilisé.";
      if (error.code === 'auth/weak-password') msg = "Mot de passe trop court (6 caractères min).";
      if (error.code === 'auth/invalid-credential') msg = "Email ou mot de passe incorrect.";
      
      Alert.alert("Oups", msg);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          {isLogin ? "Bienvenue ! 👋" : "Créer un compte 🚀"}
        </Text>
        
        <Text style={styles.subtitle}>
          {isLogin ? "Connectez-vous pour voir vos lieux" : "Rejoignez la communauté"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin ? "Se connecter" : "S'inscrire"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
          <Text style={styles.switchText}>
            {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  card: { backgroundColor: 'white', padding: 30, borderRadius: 20, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#333', marginBottom: 5 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 30 },
  input: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#eee' },
  button: { backgroundColor: '#2196F3', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  switchButton: { marginTop: 20, alignItems: 'center', padding: 10 },
  switchText: { color: '#2196F3', fontWeight: '600' }
});