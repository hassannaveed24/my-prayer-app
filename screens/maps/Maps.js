import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Alert,
  Linking,
  Platform,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { useQuery } from 'react-query';
import axios from 'axios';
import { GOOGLE_API_KEY, RADIUS } from '@env';
import theme from '../../constants/theme';
import PrayerTimeModal from '../../components/PrayerTimeModal';
import {
  excludeMasjids,
  filterMasjids,
  getAllMasjids,
  getMasjidsByIds,
  transformMasjids,
} from '../../helper functions';

const queryFn = region => () => {
  return axios
    .get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?', {
      params: {
        location: `${region.latitude},${region.longitude}`,
        type: 'mosque',
        key: GOOGLE_API_KEY,
        radius: RADIUS,
      },
      // headers: { Authorization: `Bearer ${}` },
    })
    .then(async $xhr => {
      // const placeIds = $xhr.data.results.map($masjid => $masjid.place_id);

      const masjids = await getAllMasjids();
      const filteredMasjids = filterMasjids(masjids);
      const excludedMasjids = excludeMasjids(masjids);

      const queriedMasjids = $xhr.data.results;

      const showMasjids = queriedMasjids.filter(queriedMasjid => {
        return (
          excludedMasjids.findIndex(
            excludedMasjid => excludedMasjid.place_id === queriedMasjid.place_id,
          ) < 0
        );
      });
      const filteredMasjidIds = filteredMasjids.map(masjid => masjid.place_id);

      let masjidsWithPrayerTimes = [];
      if (filteredMasjidIds.length > 0) {
        masjidsWithPrayerTimes = await getMasjidsByIds(filteredMasjidIds);
      }

      return [...masjidsWithPrayerTimes, ...transformMasjids(showMasjids)];
    });
};

export default function Maps({ navigation }) {
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isPrayerTimeModalVisible, setIsPrayerTimeModalVisible] = useState(false);
  const [prayerMarker, setPrayerMarker] = useState(null);

  useEffect(() => {
    async function gettingCoords() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        ToastAndroid.show('Permission to access location was denied', ToastAndroid.LONG);
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = coords;
      setRegion(prev => ({ ...prev, latitude, longitude }));
    }
    gettingCoords();
  }, []);

  const masjidQuery = useQuery(['masjid', region.latitude, region.longitude], queryFn(region), {
    onSuccess: res => {},
    onError: e => {
      console.log(e?.message);
      ToastAndroid.show(e?.message, ToastAndroid.SHORT);
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {masjidQuery.isLoading && (
        <View style={styles.spinnerView}>
          <ActivityIndicator size="large" color={theme.button} />
        </View>
      )}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        // initialRegion={region}
        region={region}
        onRegionChangeComplete={setRegion}
        followsUserLocation
        showsMyLocationButton>
        {masjidQuery.data?.map((marker, index) => {
          return (
            <Marker
              key={index}
              {...marker}
              onPress={() =>
                Alert.alert('Go To Masjid', `Are you sure you want to go to ${marker.title}?`, [
                  {
                    text: 'No',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                  },
                  {
                    text: 'Yes',
                    onPress: () => {
                      const url = Platform.select({
                        ios:
                          'maps:' +
                          marker.coordinate.latitude +
                          ',' +
                          marker.coordinate.longitude +
                          '?q=' +
                          marker.title,
                        android:
                          'geo:' +
                          marker.coordinate.latitude +
                          ',' +
                          marker.coordinate.longitude +
                          '?q=' +
                          marker.title,
                      });
                      Linking.openURL(url);
                    },
                  },
                  {
                    text: 'Show Prayer Time',
                    onPress: () => {
                      setPrayerMarker(marker);
                      setIsPrayerTimeModalVisible(true);
                    },
                  },
                ])
              }
            />
          );
        })}
      </MapView>
      <PrayerTimeModal
        isPrayerTimeModalVisible={isPrayerTimeModalVisible}
        setIsPrayerTimeModalVisible={setIsPrayerTimeModalVisible}
        marker={prayerMarker}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    height: '100%',
    width: '100%',
    flex: 1,
  },
  spinnerView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
