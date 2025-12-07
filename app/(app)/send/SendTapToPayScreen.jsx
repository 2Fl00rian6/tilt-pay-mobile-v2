import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderBar from '../../../components/HeaderBar';
import JWTTransfer from '../../../services/JWTTransfer';

export default function SendTapToPayScreen() {
  const router = useRouter();
  const [broadcasting, setBroadcasting] = useState(false);
  const [error, setError] = useState(null);
  
  const fakeJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.USER_ID_12345.SIGNATURE_XYZ";

  useEffect(() => {
    start();
    return () => stop();
  }, []);

  const start = async () => {
    try {
      setError(null);
      setBroadcasting(true);
      await JWTTransfer.startBroadcastingToken(fakeJWT);
      console.log("✅ Broadcast démarré avec succès");
    } catch (e) {
      console.error("❌ Erreur broadcast:", e);
      setError(e.message);
      setBroadcasting(false);
      Alert.alert("Erreur", e.message);
    }
  };

  const stop = async () => {
    await JWTTransfer.stopBroadcasting();
    setBroadcasting(false);
  };

  const handleBack = () => {
    stop();
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <HeaderBar title="Tap to Pay" onBack={handleBack} />
      <View style={styles.container}>
        <Text style={styles.title}>Approchez le terminal</Text>
        <View style={styles.circle}>
          {broadcasting ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <Text style={styles.errorIcon}>⚠️</Text>
          )}
        </View>
        <Text style={styles.status}>
          {error 
            ? `Erreur: ${error}` 
            : broadcasting 
              ? "📡 Signal de paiement actif..." 
              : "Démarrage..."}
        </Text>
        {error && (
          <TouchableOpacity style={styles.retryButton} onPress={start}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 40 },
  status: { marginTop: 20, color: '#666', textAlign: 'center', paddingHorizontal: 20 },
  circle: { 
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    backgroundColor: '#000', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  errorIcon: { fontSize: 50 },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});