import { FC, ReactElement } from 'react';
import React, { useEffect, useState, type PropsWithChildren } from 'react';
import { Text, StyleSheet } from "react-native";
import { fromByteArray, toByteArray } from 'react-native-quick-base64';
import { BleManager, BleManagerOptions, BleRestoredState, Device, State, BleError, DeviceId, Characteristic } from 'react-native-ble-plx';

const restorationFunction = ((restoredState: BleRestoredState | null) => {
  if (restoredState == null) {
    console.log("no restoration....let's go scanning..")
  } else {
    console.log("restoration goes here...");
  }
});
const bleOptions: BleManagerOptions = {
  restoreStateIdentifier: "",
  restoreStateFunction: restorationFunction
};
const bleManager = new BleManager(bleOptions);

type BluetoothManagerStateListener = ((newState: State) => void);
type BluetoothDeviceScanListener = ((error?: BleError | null, scannedDevice?: Device | null) => void);
enum BluetoothState {
  PoweredOff,
  PoweredOn,
  DiscoveringDevices,
  FoundMagicDevice,
  ListeningForWeight,
  Weighed
};
type WeightHandler = (measurement: WeightMeasurement) => void;

type BluetoothHardwareProps = {
  children: React.ReactNode;
  serialNumber: string,
  hostuuid?: string,
  hardwareState?: string,
  payloadCallback?: WeightHandler,
  btManager?: any
}

type BluetoothConnectionProps = {
  deviceUUID: string,
  connectionState: string,
  device: any
}

type BluetoothMeasurementProps = {
  characteristicUUID: string
  serviceUUID: string
  value: any
}

type WeightMeasurement = {
  weight?: string,
  unit?: string,
  timestamp?: string
}
export const BluetoothConnectionWrapperClass: FC<BluetoothHardwareProps> = (props): ReactElement => {
    const [measurement, setMeasurement] = useState<WeightMeasurement>();
    const [bluetoothState, setBluetoothState] = useState<BluetoothState>(BluetoothState.PoweredOff);
    const [favoriteScannedDevice, setFavoriteScannedDevice] = useState<Device | null>(null);
    const [magicDevice, setMagicDevice] = useState<Device | null>(null);
  
    const deviceRegistry = new Map<DeviceId, Device>();
    const deviceScanHandler: BluetoothDeviceScanListener = (possibleError, scannedDevice) => {
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
    const managerStateChangeListener: BluetoothManagerStateListener = (newState) => {
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
  
      type CharacteristicListener = (error: (BleError | null), characteristic: (Characteristic | null)) => void;
      let weightMeasurementListener: CharacteristicListener = (error, characteristic) => {
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
      <Text>Device with serial number { props.serialNumber } - { bluetoothState } - { measurement?.weight } </Text>
    )
  };

const devices = new Array<Device>();
const restoredState: BleRestoredState = { connectedPeripherals: devices };
