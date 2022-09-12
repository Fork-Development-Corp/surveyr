exports.printMsg = function () {
    console.log("This is a message from the Surveyr package.");
};

import React, { useEffect, useState } from 'react';
import { FC, ReactElement } from 'react';
import { btoa, atob, fromByteArray, toByteArray } from 'react-native-quick-base64';
import { BleManager, BleManagerOptions, BleRestoredState, Device, State, BleError, DeviceId, Characteristic } from 'react-native-ble-plx';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const Section = ({ children, title }) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};


const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [muhWeight, setMuhWeight] = useState();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
            Edit <Text style={styles.highlight}>App.tsx</Text> to change this
            screen and then come back to see your edits.  Quickly.
            <BluetoothConnectionWrapperClass serialNumber="51-102" payloadCallback={setMuhWeight} >
              <Button title="generate weight as if by bluetooth" />
            </BluetoothConnectionWrapperClass>
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            You at {muhWeight?.weight} tho.
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});


const devices = new Array();
const restoredState = { connectedPeripherals: devices };
const restorationFunction = ((restoredState) => {
  if (restoredState == null) {
    console.log("no restoration....let's go scanning..")
  } else {
    console.log("restoration goes here...");
  }
});
const bleOptions = {
  restoreStateIdentifier: "",
  restoreStateFunction: restorationFunction
};

const bleManager = new BleManager(bleOptions);

// type BluetoothManagerStateListener = ((newState: State) => void);
// type BluetoothDeviceScanListener = ((error?: BleError | null, scannedDevice?: Device | null) => void);
// enum BluetoothState {
//   PoweredOff,
//   PoweredOn,
//   DiscoveringDevices,
//   FoundMagicDevice,
//   ListeningForWeight,
//   Weighed
// }
export const Scalr = (props) => {
  const [measurement, setMeasurement] = useState();
  const [bluetoothState, setBluetoothState] = useState(BluetoothState.PoweredOff);
  const [favoriteScannedDevice, setFavoriteScannedDevice] = useState(null);
  const [magicDevice, setMagicDevice] = useState(null);

  const deviceRegistry = new Map();
  const deviceScanHandler = (possibleError, scannedDevice) => {
    if (possibleError != null) { console.log("AIEEEE!!!!"); return; }
    if (scannedDevice == null) { console.log("bogus device"); return; }

    let isNewDevice = !(deviceRegistry.has(scannedDevice.id));
    if (isNewDevice) {
      // save it!
      deviceRegistry.set(scannedDevice.id, scannedDevice);
      console.log(deviceRegistry.size + " device " + scannedDevice.id + " called " + scannedDevice.name);
    }

    let isFlaggedDevice = (scannedDevice.name === '51-102') || (scannedDevice.name === 'SensorTag');
    if (isFlaggedDevice) {
      bleManager.stopDeviceScan();
      setFavoriteScannedDevice(scannedDevice);
    }
  };
  const managerStateChangeListener = (newState) => {
    if ((newState == 'PoweredOn') && (bluetoothState == BluetoothState.PoweredOff)) {
      console.log("wasn't on.  now is on.  woot:  " + newState);
      bleManager.startDeviceScan([], null, deviceScanHandler);
      hostDeviceStateChangeSubscription.remove();
      setBluetoothState(BluetoothState.PoweredOn);
    }
  };
  const hostDeviceStateChangeSubscription = bleManager.onStateChange(managerStateChangeListener, true);

  useEffect(() => {
    bleManager.stopDeviceScan();
    favoriteScannedDevice?.connect()
      .then(connectedDevice => { 
        setBluetoothState(BluetoothState.ListeningForWeight);
        return connectedDevice.discoverAllServicesAndCharacteristics();
      })
      .then(fullyDiscoveredDevice => setMagicDevice(fullyDiscoveredDevice))
      .catch(reason => console.log("failure: " + reason));

    console.log("got new favorite device: " + favoriteScannedDevice?.name);
  }, [favoriteScannedDevice])

  useEffect(() => {
    props.hardwareState = bluetoothState.toString(); // passing back up to the parent?  idek
    console.log("got new ui state for hardware: " + bluetoothState);
  }, [bluetoothState])

  var subscriptionForTimeReading;
  var subscriptionForTimeWriting;
  var subscriptionForWeightFeatureReading;
  var subscriptionForWeightMeasurementReading;
  const timeService = "00001805-0000-1000-8000-00805f9b34fb";
  const deviceInfoService = "0000180a-0000-1000-8000-00805f9b34fb";
  const batteryService = "0000180f-0000-1000-8000-00805f9b34fb";
  const weightScaleService = "0000181d-0000-1000-8000-00805f9b34fb";
  const weightMeasurementCharacteristic = "00002a9d-0000-1000-8000-00805f9b34fb";
  const currentTimeCharacteristic = "00002a2b-0000-1000-8000-00805f9b34fb";

  useEffect(() => {
    if (magicDevice == null) { return; }
    magicDevice?.isConnected().then(
      isConnected => { console.log("yup.  looks like a " + (isConnected ? "" : "dis") + "connected device."); },
      reason => { console.log("failed: " + reason); }
    )
    setBluetoothState(BluetoothState.FoundMagicDevice);
    let transactionID = undefined;

    // type CharacteristicListener = (error: (BleError | null), characteristic: (Characteristic | null)) => void;
    let weightMeasurementListener = (error, characteristic) => {
      if (error != null) { console.log("weight measuremenet error: " + error); return; }
      let characteristicValue = characteristic?.value;
      if (characteristicValue == null) { console.log("no characteristic value wth "); return; }
      let values = toByteArray(characteristicValue);
      let scaleFactor = 100.0;
      let detectedWeight = (values[2] * 256 + values[1])/scaleFactor;
      setBluetoothState(BluetoothState.Weighed);

      setMeasurement({ weight: detectedWeight.toString(), unit: "lbs", timestamp: "now" })
    };

    let timeArray = Uint8Array.from([0xe5, 0x07, 0x09, 0x01, 0x17, 0x18, 0x03]);
    subscriptionForTimeWriting = bleManager.writeCharacteristicWithResponseForDevice(magicDevice.id, timeService, currentTimeCharacteristic, fromByteArray(timeArray)).then(
      (characteristic) => { 
        console.log("wrote time characteristic.  let's wait for weight.");       
        setBluetoothState(BluetoothState.ListeningForWeight);
        subscriptionForWeightFeatureReading = bleManager.monitorCharacteristicForDevice(magicDevice.id, weightScaleService, weightMeasurementCharacteristic, weightMeasurementListener, "weightMeasurementListenerTransactionID");
      },
      (reason) => { console.log("rejected-: " + reason); }
    )      
    console.log("got a magic device.  monitoring time and stuff")
  }, [magicDevice])

  useEffect(() => {
    console.log("got new measurement: " + measurement?.weight);
    if ((props.payloadCallback != null) && (measurement != null)) { props.payloadCallback(measurement); }
  }, [measurement])

  useEffect(() => {
    console.log("mounting component... hardware should be coming to life soon...");
  }, []);

  return (
    <Text>Device with serial number {props.serialNumber} - {bluetoothState} - {measurement?.weight} </Text>
  )
};