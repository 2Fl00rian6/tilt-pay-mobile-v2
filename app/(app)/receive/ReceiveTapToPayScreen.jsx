import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Alert, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderBar from '../../../components/HeaderBar';
import JWTTransfer from '../../../services/JWTTransfer';

export default function ReceiveTapToPayScreen() {
  const router = useRouter();
  const [status, setStatus] = useState("Initialisation...");
  const [scanning, setScanning] = useState(false);
  const mountedRef = useRef(true);
  const startTimeoutRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;

    // Délai plus long pour laisser le temps au composant de se stabiliser
    startTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        console.log("🎬 Composant monté, démarrage du scan...");
        startScanning();
      }
    }, 1000); // 1 seconde de délai

    return () => {
      console.log("🧹 Nettoyage du composant...");
      mountedRef.current = false;
      
      if (startTimeoutRef.current) {
        clearTimeout(startTimeoutRef.current);
      }
      
      JWTTransfer.stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!mountedRef.current) {
      console.log("⚠️ Composant démonté, annulation du scan");
      return;
    }
    
    try {
      setScanning(true);
      setStatus("🔍 Recherche en cours...");
      
      console.log("🚀 Lancement du scan...");
      
      await JWTTransfer.scanAndReadToken(
        (jwt) => {
          // SUCCÈS
          if (!mountedRef.current) return;
          
          console.log("✅ Token reçu avec succès");
          setScanning(false);
          setStatus("✅ Paiement reçu !");
          
          Alert.alert(
            "✅ Succès", 
            `Token reçu !\n\n${jwt.substring(0, 60)}...`, 
            [{ 
              text: "OK", 
              onPress: () => {
                if (mountedRef.current) {
                  router.back();
                }
              }
            }]
          );
        },
        (error) => {
          // ERREUR
          if (!mountedRef.current) return;
          
          console.error("❌ Erreur reçue:", error);
          setScanning(false);
          
          const errorMsg = error?.message || error?.toString() || "Erreur inconnue";
          setStatus("❌ " + errorMsg);
          
          Alert.alert(
            "❌ Erreur",
            errorMsg,
            [
              { 
                text: "Réessayer", 
                onPress: () => {
                  if (mountedRef.current) {
                    // Petit délai avant de réessayer
                    setTimeout(() => startScanning(), 500);
                  }
                }
              },
              { 
                text: "Annuler", 
                onPress: () => {
                  if (mountedRef.current) {
                    router.back();
                  }
                },
                style: 'cancel'
              }
            ]
          );
        }
      );
    } catch (e) {
      if (!mountedRef.current) return;
      
      console.error("❌ Exception:", e);
      setScanning(false);
      setStatus("❌ " + (e.message || "Erreur"));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <HeaderBar 
        title="Receive Payment" 
        onBack={() => {
          JWTTransfer.stopScanning();
          router.back();
        }} 
      />
      <View style={styles.container}>
        {scanning && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        )}
        
        <Text style={styles.text}>{status}</Text>
        
        {!scanning && (
          <TouchableOpacity 
            style={styles.button} 
            onPress={startScanning}
          >
            <Text style={styles.buttonText}>🔄 Réessayer</Text>
          </TouchableOpacity>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📋 Checklist :</Text>
          <Text style={styles.infoText}>
            ✓ Bluetooth activé{'\n'}
            ✓ Émetteur lancé en premier{'\n'}
            ✓ Appareils à moins de 2 mètres{'\n'}
            ✓ Patience (10-20 secondes)
          </Text>
        </View>

        {scanning && (
          <Text style={styles.tip}>
            💡 Astuce : Gardez les appareils proches et immobiles
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  loaderContainer: {
    marginBottom: 20
  },
  text: { 
    fontSize: 18, 
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginVertical: 20 
  },
  button: {
    backgroundColor: '#000',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  infoBox: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 12,
    marginTop: 40,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333'
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 26
  },
  tip: {
    marginTop: 20,
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 30
  }
});