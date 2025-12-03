import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* L'écran principal (ton Dashboard) */}
        <Stack.Screen 
            name="HomeScreen" 
            options={{ 
                headerShown: true,
                title: 'Home',
                headerBackTitle: 'Retour'
            }}
        />

      {/* L'écran de paramètres, qui s'ouvrira par-dessus comme une nouvelle page */}
      <Stack.Screen 
        name="AccountSettingsScreen" 
        options={{ 
          headerShown: true, // On affiche le header (titre + flèche retour) pour cette page
          title: 'Mon Compte',
          headerBackTitle: 'Retour'
        }} 
      />
    </Stack>
  );
}