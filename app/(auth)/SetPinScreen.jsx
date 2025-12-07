import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createAccount } from '../../api/auth';
import HeaderBar from '../../components/HeaderBar';
import Keypad from '../../components/Keypad';
import PinDots from '../../components/PinDots';
import { useError } from '../../context/ErrorContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

const PIN_LEN = 4;

export default function SetPinScreen() {
  const { showError } = useError();
  const params = useLocalSearchParams();
  const router = useRouter();

  const dialCode = params.dialCode || '+33';
  const nsn = params.nsn || '';
  const phoneDisplay = params.phoneDisplay || `${dialCode} ${nsn}`;
  const phoneNumber = `${dialCode}${nsn}`;

  const fullName = params.fullName || 'Tilt User';
  const tagName = params.tagName || '';

  const [pin, setPin] = useState('');
  const [step, setStep] = useState('create');
  const [firstPin, setFirstPin] = useState(null);
  const [sending, setSending] = useState(false);
  const [errorTick, setErrorTick] = useState(0);

  const onKey = (k) => { if (pin.length < PIN_LEN) setPin((p) => p + String(k)); };
  const onBackspace = () => setPin((p) => p.slice(0, -1));

  const onMismatch = useCallback(() => {
    setErrorTick(t => t + 1);
    setFirstPin(null);
    setStep('create');
    setPin('');
    showError('PIN codes do not match', { position: 'top' });
  }, [showError]);

  useEffect(() => {
    if (pin.length !== PIN_LEN) return;

    if (step === 'create') {
      setFirstPin(pin);
      setPin('');
      setStep('confirm');
      return;
    }

    (async () => {
      if (firstPin !== pin) return onMismatch();

      try {
        setSending(true);
        await createAccount({ phoneNumber, fullName, tagName, pin });

        router.replace({
          pathname: '/(auth)/VerifyCodeScreen',
          params: {
            mode: 'register',
            dialCode,
            nsn,
            phoneDisplay,
          }
        });
      } catch (e) {
        const errorMsg = e?.text || e?.message || '';

        if (errorMsg === 'USER_NOT_VERIFIED' || errorMsg.includes('USER_NOT_VERIFIED')) {
          router.replace({
            pathname: '/(auth)/VerifyCodeScreen',
            params: {
              mode: 'register',
              dialCode,
              nsn,
              phoneDisplay,
            }
          });
          return;
        }

        if (e?.redirectTo === 'login' || e?.status === 409) {
          showError('Account already exists. Please login.', { position: 'top' });
          setTimeout(() => {
              router.replace({
                pathname: '/(auth)/LoginPinScreen',
                params: { dialCode, nsn, phoneDisplay }
              });
          }, 500);
        } else {
          showError(errorMsg || 'Create account failed', { position: 'top' });
          
          setPin('');
          setFirstPin(null);
          setStep('create');
        }
      } finally {
        setSending(false);
      }
    })();
  }, [
    pin, step, firstPin,
    dialCode, nsn, phoneDisplay,
    fullName, tagName,
    onMismatch, showError, router, phoneNumber
  ]);

  const title = useMemo(
    () => (step === 'create' ? 'Set your PIN code' : 'Confirm your PIN code'),
    [step]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <HeaderBar title="" onBack={() => router.back()} />
      <View style={styles.container}>
        <View style={styles.handleWrap}><View style={styles.handle} /></View>

        <View style={{ paddingHorizontal: 24 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Phone: {phoneDisplay}</Text>
        </View>

        <View style={styles.dotsWrap}>
          <PinDots value={pin} length={PIN_LEN} errorTick={errorTick} />
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