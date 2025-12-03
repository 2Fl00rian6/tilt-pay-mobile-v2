import { Stack } from 'expo-router';
import { ErrorProvider } from '../context/ErrorContext';

export default function RootLayout() {
  return (
    <ErrorProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" /> 
        <Stack.Screen name="(auth)" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(app)" />
      </Stack>
    </ErrorProvider>
  );
}