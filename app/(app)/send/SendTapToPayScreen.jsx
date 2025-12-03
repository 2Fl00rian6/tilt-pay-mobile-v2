import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Linking,
} from 'react-native'
import HeaderBar from '../../../components/HeaderBar'
import * as Haptics from 'expo-haptics'
import { NativeModules } from 'react-native'

export default function SendTapToPayScreen({ navigation }) {
  return (
    <h1>SendTapToPay</h1>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  status: { fontSize: 15, color: '#333', marginBottom: 30, textAlign: 'center' },
  btn: { backgroundColor: '#111', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 14 },
  stop: { backgroundColor: '#EF4444' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})