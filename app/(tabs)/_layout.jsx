import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
            name="index"
            options={{ 
                headerShown: false,
                title: 'Home',
                headerBackTitle: 'Retour'
            }}
        />

      <Stack.Screen 
        name="AccountSettingsScreen" 
        options={{ 
          headerShown: false,
          title: 'Mon Compte',
          headerBackTitle: 'Retour'
        }} 
      />
    </Stack>
  );
}