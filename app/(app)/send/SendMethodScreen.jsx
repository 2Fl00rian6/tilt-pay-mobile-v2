import React, { useEffect, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Alert
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import HeaderBar from '../../../components/HeaderBar'
import * as Haptics from 'expo-haptics'

/* ---------- Icônes SVG ---------- */
import IconNfc from '../../../assets/icon-nfc.svg'
import IconBank from '../../../assets/icon-bank.svg'
import IconCrypto from '../../../assets/icon-wallet.svg'

export default function SendMethodScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  
  const amount = params.amount 

  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(30)).current
  const item1 = useRef(new Animated.Value(0)).current
  const item2 = useRef(new Animated.Value(0)).current
  const item3 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 14,
        stiffness: 120,
      }),
      Animated.stagger(120, [
        Animated.timing(item1, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(item2, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(item3, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start()
  }, [])

  const vibrate = async () =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

  const goBack = async () => {
    await vibrate()
    router.back()
  }

  const goTag = async () => {
    await vibrate()
    router.push({
      pathname: '/send/SendTagScreen',
      params: { amount }
    })
  }

  const goTapToPay = async () => {
    await vibrate()
    if (amount) {
      router.push({
        pathname: '/send/SendTapToPayScreen',
        params: { amount, currency: 'EUR' }
      })
    } else {
      router.push('/send/SendEnterAmountScreen')
    }
  }

  const goBank = async () => {
    await vibrate()
    router.push({
      pathname: '/send/SendBankTransferScreen',
      params: { amount }
    })
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <HeaderBar title="Send" onBack={goBack} />

      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY }] },
        ]}
      >
        <Text style={styles.title}>Send money with</Text>

        <Animated.View
          style={{
            opacity: item1,
            transform: [{
                translateY: item1.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
            }],
          }}
        >
          <TouchableOpacity style={styles.row} onPress={goTag} activeOpacity={0.85}>
            <View style={styles.icon}>
              <IconCrypto width={22} height={22} />
              <Text style={styles.rowText}>Send by tag</Text>
            </View>
            <Text style={styles.feeText}>free</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={{
            opacity: item2,
            transform: [{
                translateY: item2.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
            }],
          }}
        >
          <TouchableOpacity style={styles.row} onPress={goTapToPay} activeOpacity={0.85}>
            <View style={styles.icon}>
              <IconNfc width={22} height={22} />
              <Text style={styles.rowText}>Tap to pay</Text>
            </View>
            <Text style={styles.feeText}>1% fee</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={{
            opacity: item3,
            transform: [{
                translateY: item3.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
            }],
          }}
        >
          <TouchableOpacity style={styles.row} onPress={goBank} activeOpacity={0.85}>
            <View style={styles.icon}>
              <IconBank width={22} height={22} />
              <Text style={styles.rowText}>Send to bank</Text>
            </View>
            <Text style={styles.feeText}>1% fee</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={{
            opacity: item3,
            transform: [{
                translateY: item3.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
            }],
          }}
        >
          <TouchableOpacity style={styles.row} onPress={goBank} activeOpacity={0.85}>
            <View style={styles.icon}>
              <IconCrypto width={22} height={22} />
              <Text style={styles.rowText}>Send to crypto</Text>
            </View>
            <Text style={styles.feeText}>free</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingTop: 16 },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 'auto',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'transparent',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  icon: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { fontSize: 16, color: '#48484A', fontWeight: '500' },
  feeText: { fontSize: 14, color: '#888', fontWeight: '400' }
})