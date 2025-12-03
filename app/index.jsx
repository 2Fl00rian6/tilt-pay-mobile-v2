import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { getToken } from '../utils/authStorage'; // Vérifie tes imports

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      // Logique simple : on regarde s'il y a un token stocké
      // Tu devras peut-être adapter getToken selon ton implémentation (s'il prend des arguments)
      const token = await getToken(); 
      setHasToken(!!token);
    } catch (e) {
      setHasToken(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // Si connecté -> Vers les Tabs
  // Sinon -> Vers l'authentification (écran EnterPhone par exemple)
  return <Redirect href={hasToken ? "/(tabs)" : "/(auth)/EnterPhoneScreen"} />;
}