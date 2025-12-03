import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EnterPhoneScreen" />
      <Stack.Screen name="LoginPinScreen" />
      <Stack.Screen name="VerifyCodeScreen" />
      <Stack.Screen name="SetPinScreen" />
      <Stack.Screen name="ChooseTagScreen" />
    </Stack>
  );
}