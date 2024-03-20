import { StatusBar } from "expo-status-bar";
import { StyleSheet, Button, SafeAreaView, View } from "react-native";
import * as TaskManager from "expo-task-manager";
import { LinearGradient } from "expo-linear-gradient";
import MapBox, {
  Camera,
  MapView,
  LineLayer,
  ShapeSource,
  LineJoin,
} from "@rnmapbox/maps";
import { LineString } from "geojson";
import {
  LOCATION_TASK_NAME,
  LocationData,
  saveLocationDataTask,
  toCoords,
  useLocationData,
  useLocationPermission,
} from "./location";
import { useCallback, useEffect, useState } from "react";
import { DebugModal } from "./debug";
import { log, messages } from "./log";

TaskManager.defineTask(LOCATION_TASK_NAME, saveLocationDataTask);

MapBox.setAccessToken("YOUR PUBLIC TOKEN");

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const { startedTracking, startTracking } = useLocationPermission();

  return (
    <SafeAreaView style={styles.container}>
      {modalVisible && (
        <DebugModal
          messages={messages}
          onPress={() => setModalVisible(false)}
        />
      )}
      <Map />
      {!startedTracking && (
        <Button
          title="Start tracking"
          color="#8a2387"
          onPress={startTracking}
        />
      )}
      <Button
        title="Show debug log"
        color="#8a2387"
        onPress={() => setModalVisible(true)}
      />
      <Button
        title="Add manual log"
        color="#8a2387"
        onPress={() => log({ message: "User checkpoint" })}
      />
      <StatusBar translucent={false} />
    </SafeAreaView>
  );
}

function Map() {
  const locations = useLocationData();

  if (locations.length === 0) {
    return (
      <LinearGradient
        colors={["#8a2387", "#e94057", "#f27121"]}
        style={styles.fill}
      />
    );
  }

  return (
    <MapView style={styles.fill} deselectAnnotationOnTap={true}>
      <ShapeSource id="routeSource" shape={toRoute(locations)}>
        <LineLayer id="routeFill" style={mapStyles.lineStyle} />
      </ShapeSource>
      <Camera defaultSettings={cameraConfig(locations[0])} />
    </MapView>
  );
}

function toRoute(locations: LocationData[]): LineString {
  return { type: "LineString", coordinates: locations.map(toCoords) };
}

function cameraConfig(initialLocation: LocationData) {
  return { centerCoordinate: toCoords(initialLocation), zoomLevel: 16 };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  fill: { flex: 1 },
});

const mapStyles = {
  lineStyle: {
    lineColor: "#ff0000",
    lineWidth: 5,
    lineCap: LineJoin.Round,
    lineOpacity: 1.84,
  },
} as const;
