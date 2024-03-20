import AsyncStorage from "@react-native-async-storage/async-storage";
import { LocationData } from "./location";
import { log } from "./log";

const LOCATION_DATA_KEY = "loca/location";
const STORE_LAST_N = 5000;

type StoredLocationData = {
  lat: number;
  acc: number;
  lon: number;
  t: number;
};
export async function appendData(locations: LocationData[]) {
  try {
    const data = (await getData()) ?? [];

    const appended = removeDuplicates(
      [...toStored(data), ...toStored(locations)].slice(-STORE_LAST_N)
    );
    await AsyncStorage.setItem(LOCATION_DATA_KEY, JSON.stringify(appended));
  } catch (error) {
    return null;
  }
}

function removeDuplicates(locations: StoredLocationData[]) {
  if (locations.length === 0) {
    return [];
  }

  const first = locations[0];
  const filtered = [first];

  let lastValue = first;
  for (const location of locations) {
    const sameCoords =
      location.lat === lastValue.lat && location.lon === lastValue.lon;

    if (!sameCoords) {
      lastValue = location;
      filtered.push(location);
    }
  }
  return filtered;
}

export async function getData(): Promise<LocationData[] | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(LOCATION_DATA_KEY);
    if (jsonValue === null) {
      return null;
    }
    return fromStored(JSON.parse(jsonValue));
  } catch (error) {
    return null;
  }
}

function toStored(locations: LocationData[]): StoredLocationData[] {
  return locations.map(({ coords, timestamp }) => ({
    lat: coords.latitude,
    lon: coords.longitude,
    acc: coords.accuracy,
    t: timestamp,
  }));
}
function fromStored(storedLocations: StoredLocationData[]): LocationData[] {
  return storedLocations.map(({ lat, lon, acc, t }) => ({
    coords: { latitude: lat, accuracy: acc, longitude: lon },
    timestamp: t,
  }));
}
