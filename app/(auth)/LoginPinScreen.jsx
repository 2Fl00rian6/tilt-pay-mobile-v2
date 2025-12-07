import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { login, me } from '../../api/auth';
import HeaderBar from '../../components/HeaderBar';
import Keypad from '../../components/Keypad';
import PinDots from '../../components/PinDots';
import { useError } from '../../context/ErrorContext';
import { setCurrentPhone, setToken, setUser } from '../../utils/authStorage';

const PIN_LEN = 4;

export default function LoginPinScreen() {
  const router = useRouter(); 
  const params = useLocalSearchParams();
  const { showError } = useError();

  const dialCode = params.dialCode || '+33';
  const nsn = params.nsn || '';
  const phoneDisplay = params.phoneDisplay || `${dialCode} ${nsn}`;
  const phoneNumber = `${dialCode}${nsn}`;

  const [pin, setPin] = useState('');
  const [sending, setSending] = useState(false);

  const onKey = (k) => { if (pin.length < PIN_LEN) setPin((p) => p + String(k)); };
  const onBackspace = () => setPin((p) => p.slice(0, -1));

  useEffect(() => {
    if (pin.length !== PIN_LEN) return;
    (async () => {
      try {
        setSending(true);
        const res = await login({ phoneNumber, pin });
        const token = res?.access_token;
        if (!token) throw new Error('Missing access_token');
        
        const resMe = await me(token);
        await setToken(phoneNumber, token);
        await setUser({
          id: resMe.id,
          fullName: resMe.fullName,
          tagName: resMe.tagname,
          phoneNumber: resMe.phoneNumber,
          verified: resMe.verified,
          createdAt: resMe.createdAt,
        });
        await setCurrentPhone(phoneNumber);
        router.replace('/(tabs)');
      } catch (e) {
        const errorMsg = e?.text || e?.message || '';

        if (errorMsg === 'USER_NOT_VERIFIED' || errorMsg.includes('USER_NOT_VERIFIED')) {
          router.push({
            pathname: '/(auth)/VerifyCodeScreen',
            params: { dialCode, nsn, phoneDisplay }
          });
        } else {
          showError(errorMsg || 'Login failed', { position: 'top' });
          setPin('');
        }
      } finally {
        setSending(false);
      }
    })();
  }, [pin, phoneNumber, router, showError, dialCode, nsn, phoneDisplay]);

  return (
    <SafeAreaView style={styles.safe}>
      <HeaderBar title="" onBack={() => router.back()} />
      <View style={styles.container}>
        <View style={styles.handleWrap}><View style={styles.handle} /></View>

        <View style={{ paddingHorizontal: 24 }}>
          <Text style={styles.title}>Enter your PIN</Text>
          <Text style={styles.subtitle}>Phone: {phoneDisplay}</Text>
        </View>

        <View style={styles.dotsWrap}>
          <PinDots value={pin} length={PIN_LEN} />
        </View>

        <View style={{ flex: 1 }} />
        <View style={styles.kpWrap} pointerEvents={sending ? 'none' : 'auto'}>
          <Keypad onKey={onKey} onBackspace={onBackspace} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 8 },
  handleWrap: { alignItems: 'center', marginBottom: 16 },
  handle: { width: 36, height: 4, backgroundColor: '#D1D5DB', borderRadius: 2 },
  title: { fontSize: 20, lineHeight: 28, fontWeight:'600', color:'#111827', marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 20, color:'#6B7280' },
  dotsWrap: { alignItems: 'center', marginTop: 24 },
  kpWrap: { paddingBottom: 8 },
});