import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { useInterval } from "./utils";
import { useCallback, useState } from "react";
import { appendData, getData } from "./storage";
import { log } from "./log";

export const LOCATION_TASK_NAME = "background-location-task";

export type LocationData = {
  coords: {
    latitude: number;
    accuracy: number;
    longitude: number;
  };
  timestamp: number;
};

export function toCoords(location: LocationData): [number, number] {
  return [location.coords.longitude, location.coords.latitude];
}

export function useLocationPermission() {
  const [startedTracking, setStartedTracking] = useState(false);

  const startTracking = useCallback(async () => {
    const requestForeground = Location.requestForegroundPermissionsAsync;
    const requestBackground = Location.requestBackgroundPermissionsAsync;

    const foregroundRequest = await requestForeground();
    if (foregroundRequest.granted) {
      const backgroundRequest = await requestBackground();
      if (backgroundRequest.granted) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Highest,
          activityType: Location.LocationActivityType.Fitness,
        });
        log({ message: "Registered location background task" });
        setStartedTracking(true);
      }
    }
  }, []);
  return { startedTracking, startTracking };
}

export function useLocationData() {
  const [locations, setLocations] = useState<LocationData[]>([]);

  useInterval(
    useCallback(() => {
      async function update() {
        const newLocations = await getData();
        if (newLocations !== null) {
          setLocations(newLocations);
        }
      }
      update();
    }, []),
    250
  );

  return locations;
}

type FullLocationData = {
  coords: {
    altitude: number;
    altitudeAccuracy: number;
    latitude: number;
    accuracy: number;
    longitude: number;
    heading: number;
    speed: number;
  };
  timestamp: number;
};

type LocationCallbackArgs = {
  data: { locations: FullLocationData[] } | null;
  error: TaskManager.TaskManagerError | null;
};

export function saveLocationDataTask({ data, error }: LocationCallbackArgs) {
  const hasData = data !== null && error === null;
  log({ task: { data, hasData } });
  if (hasData) {
    appendData(data.locations);
  }
}
