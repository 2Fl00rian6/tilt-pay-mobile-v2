import { Stack } from 'expo-router';
import { ErrorProvider } from '../context/ErrorContext'; // Assure-toi que ce chemin est bon

export default function RootLayout() {
  return (
    <ErrorProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* L'index gère la redirection */}
        <Stack.Screen name="index" /> 
        
        {/* Tes groupes de routes */}
        <Stack.Screen name="(auth)" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(app)" />
      </Stack>
    </ErrorProvider>
  );
}