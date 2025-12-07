import { Platform, PermissionsAndroid, NativeModules } from 'react-native';
import { BleManager } from 'react-native-ble-plx'; 
import Peripheral, { Property, Permission } from 'react-native-multi-ble-peripheral';
import { Buffer } from 'buffer';

// ===========================================================================
// FIX COMPLET: Patch pour tous les modules BLE
// ===========================================================================
if (Platform.OS === 'android') {
  // Patch BleClient
  const { BleClient } = NativeModules;
  if (BleClient) {
    if (!BleClient.addListener) BleClient.addListener = () => {};
    if (!BleClient.removeListeners) BleClient.removeListeners = () => {};
  }
  
  // Patch BlePeripheral
  const { BlePeripheral } = NativeModules;
  if (BlePeripheral) {
    if (!BlePeripheral.addListener) BlePeripheral.addListener = () => {};
    if (!BlePeripheral.removeListeners) BlePeripheral.removeListeners = () => {};
  }
}

const SERVICE_UUID = '0000FFFF-0000-1000-8000-00805F9B34FB';
const JWT_CHAR_UUID = '00001111-0000-1000-8000-00805F9B34FB';

class JWTTransferService {
  constructor() {
    this.bleManager = null;
    this.peripheral = null;
    this.isScanning = false;
    this.scanTimeout = null;
    this.initPromise = null;
  }
  
  async _safeInit() {
    // Utiliser une promise pour éviter les doubles initialisations
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        if (!this.bleManager) {
          console.log("🔧 Initialisation BleManager...");
          this.bleManager = new BleManager();
          
          // Attendre que le manager soit prêt
          await new Promise(resolve => setTimeout(resolve, 100));
          console.log("✅ BleManager initialisé");
        }

        if (!this.peripheral) {
          console.log("🔧 Initialisation Peripheral...");
          this.peripheral = new Peripheral();
          console.log("✅ Peripheral initialisé");
        }
        
        return true;
      } catch (e) {
        console.error("❌ Erreur initialisation:", e);
        this.initPromise = null; // Réinitialiser pour réessayer
        throw e;
      }
    })();

    return this.initPromise;
  }

  async requestPermissions() {
    try {
      if (Platform.OS === 'android') {
        const androidVersion = Platform.Version;
        console.log("📱 Android Version:", androidVersion);
        
        let permissions;
        if (androidVersion >= 31) {
          permissions = [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ];
        } else {
          permissions = [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ];
        }

        console.log("🔐 Demande des permissions...");
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        const allGranted = Object.values(granted).every(r => r === PermissionsAndroid.RESULTS.GRANTED);
        
        console.log("✅ Permissions:", allGranted ? "Accordées" : "Refusées");
        console.log("   Détails:", granted);
        
        return allGranted;
      }
      return true;
    } catch (e) {
      console.error("❌ Erreur permissions:", e);
      return false;
    }
  }

  async checkBluetoothState() {
    try {
      await this._safeInit();
      
      if (!this.bleManager) {
        console.error("❌ BleManager non initialisé");
        return false;
      }

      const state = await this.bleManager.state();
      console.log("📶 État Bluetooth:", state);
      return state === 'PoweredOn';
    } catch (e) {
      console.error("❌ Erreur vérification Bluetooth:", e);
      return false;
    }
  }

  // ==========================================
  // CÔTÉ ÉMETTEUR (SENDER)
  // ==========================================
  async startBroadcastingToken(jwtToken) {
    try {
      await this._safeInit();
      
      console.log("🚀 Démarrage broadcast...");
      
      const hasPerms = await this.requestPermissions();
      if (!hasPerms) {
        throw new Error("Permissions refusées");
      }

      const btEnabled = await this.checkBluetoothState();
      if (!btEnabled) {
        throw new Error("Bluetooth désactivé");
      }

      // Nettoyage préventif
      try {
        await this.peripheral.stopAdvertising();
      } catch (e) {
        console.log("ℹ️ Pas de broadcast actif");
      }

      console.log("📝 Configuration...");
      await Peripheral.setDeviceName("TiltPay-Sender");
      
      console.log("➕ Ajout service...");
      await this.peripheral.addService(SERVICE_UUID, true);

      const tokenBuffer = Buffer.from(jwtToken).toString('base64');

      console.log("➕ Ajout caractéristique...");
      await this.peripheral.addCharacteristic(
        SERVICE_UUID,
        JWT_CHAR_UUID,
        Property.READ, 
        Permission.READABLE,
        tokenBuffer 
      );

      console.log("📡 Démarrage advertising...");
      await this.peripheral.startAdvertising({
        connectable: true,
        serviceUuids: [SERVICE_UUID], 
        includeDeviceName: true,
      });

      console.log("✅ Broadcast actif !");
      return true;
    } catch (e) {
      console.error("❌ Erreur broadcast:", e);
      throw e;
    }
  }

  async stopBroadcasting() {
    if (this.peripheral) {
      try {
        await this.peripheral.stopAdvertising();
        console.log("🛑 Broadcast arrêté");
      } catch (e) {
        if (!e.message.includes("Had not start advertising")) {
          console.error("❌ Erreur arrêt:", e);
        }
      }
    }
  }

  // ==========================================
  // CÔTÉ RÉCEPTEUR (RECEIVER)
  // ==========================================
  async scanAndReadToken(onTokenFound, onError) {
    try {
      console.log("🔍 Initialisation du scan...");
      
      // ÉTAPE 1: Init sécurisée
      await this._safeInit();
      
      if (!this.bleManager) {
        throw new Error("BleManager non disponible");
      }
      
      // ÉTAPE 2: Permissions
      console.log("🔐 Vérification permissions...");
      const hasPerms = await this.requestPermissions();
      if (!hasPerms) {
        throw new Error("Permissions manquantes");
      }

      // ÉTAPE 3: Bluetooth
      console.log("📶 Vérification Bluetooth...");
      const btEnabled = await this.checkBluetoothState();
      if (!btEnabled) {
        throw new Error("Bluetooth désactivé - Activez-le dans les paramètres");
      }

      // ÉTAPE 4: Arrêt scan précédent
      console.log("🧹 Nettoyage...");
      await this.stopScanning();
      
      // Petit délai de stabilisation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // ÉTAPE 5: Démarrage scan
      this.isScanning = true;
      console.log("✅ Démarrage du scan...");
      
      // Timeout
      this.scanTimeout = setTimeout(() => {
        if (this.isScanning) {
          console.log("⏱️ Timeout (30s)");
          this.stopScanning();
          onError(new Error("Aucun appareil trouvé après 30 secondes.\nAssurez-vous que l'émetteur est actif."));
        }
      }, 30000);

      // Scanner
      this.bleManager.startDeviceScan(
        null,
        { allowDuplicates: false },
        async (error, device) => {
          if (error) {
            // Ignorer l'erreur 600 (scan stopped)
            if (error.errorCode === 600) {
              console.log("ℹ️ Scan arrêté normalement");
              return;
            }
            
            if (this.isScanning) {
              console.error("❌ Erreur scan:", error);
              clearTimeout(this.scanTimeout);
              this.isScanning = false;
              onError(error);
            }
            return;
          }

          if (!device || !this.isScanning) return;

          // Log détaillé
          const deviceName = device.name || device.localName || '(Sans nom)';
          const rssi = device.rssi || 0;
          
          console.log(`📱 Trouvé: ${deviceName} (RSSI: ${rssi})`);

          // Filtrage large
          const nameMatch = deviceName.toLowerCase().includes('tiltpay');
          const uuidMatch = device.serviceUUIDs && device.serviceUUIDs.includes(SERVICE_UUID);

          if (nameMatch || uuidMatch) {
            console.log("🎯 CIBLE IDENTIFIÉE:", deviceName);
            
            clearTimeout(this.scanTimeout);
            this.isScanning = false;
            this.bleManager.stopDeviceScan();

            try {
              console.log("🔗 Connexion en cours...");
              const connectedDevice = await device.connect({ timeout: 15000 });
              console.log("✅ Connecté");
              
              console.log("🔍 Découverte services...");
              await connectedDevice.discoverAllServicesAndCharacteristics();
              console.log("✅ Services découverts");

              console.log("📖 Lecture JWT...");
              const characteristic = await connectedDevice.readCharacteristicForService(
                SERVICE_UUID,
                JWT_CHAR_UUID
              );

              if (characteristic && characteristic.value) {
                const jwt = Buffer.from(characteristic.value, 'base64').toString('utf-8');
                console.log("✅ JWT REÇU !");
                
                await connectedDevice.cancelConnection();
                onTokenFound(jwt);
              } else {
                throw new Error("Caractéristique vide");
              }

            } catch (connErr) {
              console.error("❌ Erreur connexion:", connErr);
              onError(new Error("Échec de connexion: " + connErr.message));
            }
          }
        }
      );

    } catch (e) {
      console.error("❌ Erreur fatale scan:", e);
      this.isScanning = false;
      onError(e);
    }
  }

  async stopScanning() {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = null;
    }
    
    if (this.bleManager && this.isScanning) {
      try {
        this.bleManager.stopDeviceScan();
        this.isScanning = false;
        console.log("🛑 Scan arrêté");
      } catch (e) {
        console.log("ℹ️ Erreur arrêt scan (ignorée):", e.message);
      }
    }
  }

  // Méthode de cleanup complète
  async destroy() {
    await this.stopScanning();
    await this.stopBroadcasting();
    
    if (this.bleManager) {
      try {
        await this.bleManager.destroy();
      } catch (e) {}
    }
    
    this.bleManager = null;
    this.peripheral = null;
    this.initPromise = null;
  }
}

export default new JWTTransferService();