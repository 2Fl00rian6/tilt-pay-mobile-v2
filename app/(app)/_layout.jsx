import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Laisse Expo détecter automatiquement les dossiers 'send' et 'receive' */}
    </Stack>
  );
}