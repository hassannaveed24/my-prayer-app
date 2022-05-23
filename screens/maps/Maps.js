import { StatusBar, Button } from 'expo-status-bar';
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
import { useMutation, useQuery } from 'react-query';
import axios from 'axios';
import { GOOGLE_API_KEY, RADIUS } from '@env';
import theme from '../../constants/theme';
import dayjs from 'dayjs';
import { collection, documentId, FieldPath, getDocs, query, where } from 'firebase/firestore';
import { app, database } from '../../database/firebaseDB';
import PrayerTimeModal from '../../components/PrayerTimeModal';
import { getAllMasjids } from '../../helper functions';

const namazLabels = ['fajar', 'duhar', 'asar', 'maghrib', 'isha'];

const getHours = $object => {
  const minutes = $object.minute();
  const hours = $object.hour();

  return (((hours + minutes / 60) * 100) / 24).toFixed(2);
};

const filterMasjids = $masjids => {
  const currentTime = dayjs();
  const currentHours = getHours(currentTime);

  return $masjids.filter($masjid => {
    const prayerDifferences = [];
    const differencesinNum = [];

    namazLabels.forEach($namaz => {
      let prayerTime = $masjid.prayerTimes[$namaz];
      let prayerDifference = null;

      if (prayerTime) {
        prayerTime = dayjs(prayerTime.toDate());

        const prayerHours = getHours(prayerTime);

        const difference = Math.abs((prayerHours - currentHours).toFixed(2));

        prayerDifference = { label: $namaz, prayerTime, difference };
        differencesinNum.push(difference);
        prayerDifferences.push(prayerDifference);
      }
    });
    const min = Math.min(...differencesinNum);

    let nearestPrayer = prayerDifferences.find($prayer => $prayer.difference === min);

    prayerDifferences.forEach($prayer => {
      const absoluteDifference = Math.abs((currentHours - $prayer.difference).toFixed(2));
      const reversedDifference = parseInt(currentHours) + 100 - $prayer.difference;
      const difference = parseInt(currentHours) > 75 ? reversedDifference : absoluteDifference;

      if (nearestPrayer.difference > difference) nearestPrayer = $prayer;
    });

    return !dayjs(nearestPrayer.prayerTime)
      .set('date', parseInt(dayjs(currentTime).format('D')))
      .set('month', parseInt(dayjs(currentTime).format('M') - 1))
      .set('year', parseInt(dayjs(currentTime).format('YYYY')))
      .isBefore(dayjs(currentTime));
  });
};

const excludeMasjids = $masjids => {
  const currentTime = dayjs();
  const currentHours = getHours(currentTime);

  return $masjids.filter($masjid => {
    const prayerDifferences = [];
    const differencesinNum = [];

    namazLabels.forEach($namaz => {
      let prayerTime = $masjid.prayerTimes[$namaz];
      let prayerDifference = null;

      if (prayerTime) {
        prayerTime = dayjs(prayerTime.toDate());

        const prayerHours = getHours(prayerTime);

        const difference = Math.abs((prayerHours - currentHours).toFixed(2));

        prayerDifference = { label: $namaz, prayerTime, difference };
        differencesinNum.push(difference);
        prayerDifferences.push(prayerDifference);
      }
    });
    const min = Math.min(...differencesinNum);

    let nearestPrayer = prayerDifferences.find($prayer => $prayer.difference === min);

    prayerDifferences.forEach($prayer => {
      const absoluteDifference = Math.abs((currentHours - $prayer.difference).toFixed(2));
      const reversedDifference = parseInt(currentHours) + 100 - $prayer.difference;
      const difference = parseInt(currentHours) > 75 ? reversedDifference : absoluteDifference;

      if (nearestPrayer.difference > difference) nearestPrayer = $prayer;
    });

    return dayjs(nearestPrayer.prayerTime)
      .set('date', parseInt(dayjs(currentTime).format('D')))
      .set('month', parseInt(dayjs(currentTime).format('M') - 1))
      .set('year', parseInt(dayjs(currentTime).format('YYYY')))
      .isBefore(dayjs(currentTime));
  });
};

const getPrayerTimes = async $masjidIds => {
  // return new Promise((resolve, reject) => {

  // $masjids.map($masjid => {
  //   const { lat, lng } = $masjid.geometry.location;
  //   return {
  //     coordinate: { latitude: lat, longitude: lng },
  //     title: $masjid?.name,
  //     image: $masjid?.icon,
  //     place_id: $masjid?.place_id,
  //   };
  // });
  const masjids = [];
  const q = query(collection(database, 'masjids'), where(documentId(), 'in', $masjidIds));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(doc => {
    // doc.data() is never undefined for query doc snapshots
    masjids.push({
      coordinate: doc.data()?.coordinate,
      title: doc.data()?.title,
      image: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/worship_islam-71.png',
      place_id: doc.data()?.place_id,
      prayerTimes: doc.data()?.prayerTimes,
    });
    // console.log('----------------------------------------');
    // console.log(doc.id, ' => ', doc.data());
  });
  return masjids;
  // });
};

const transformMasjids = $masjids =>
  $masjids.map($masjid => {
    const { lat, lng } = $masjid.geometry.location;
    return {
      coordinate: { latitude: lat, longitude: lng },
      title: $masjid?.name,
      image: $masjid?.icon,
      place_id: $masjid?.place_id,
    };
  });

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
        masjidsWithPrayerTimes = await getPrayerTimes(filteredMasjidIds);
      }

      // console.log('----------------------------------------------------');
      // masjidsWithPrayerTimes.forEach(masjid => {
      //   console.log(`${masjid.prayerTimes}`);
      // });
      // console.log('----------------------------------------------------');

      // console.log(masjidsWithPrayerTimes);
      // return [...transformMasjids(queriedMasjids), ...filteredMasjids];
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
  const [isLoading, setIsLoading] = useState(false);
  const [markerList, setMarkerList] = useState([]);
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

  const handleMarkerPress = marker => {
    console.log(marker.nativeEvent.coordinate);
  };
  const masjidQuery = useQuery(['masjid', region.latitude, region.longitude], queryFn(region), {
    onSuccess: res => {
      const nowTime = new Date();

      // const newMarkerList = res.data.results.map(marker => {
      //   const { lat, lng } = marker.geometry.location;
      //   return {
      //     coordinate: { latitude: lat, longitude: lng },
      //     title: marker?.name,
      //     image: marker?.icon,
      //     place_id: marker?.place_id,
      //   };
      // });
      // console.log(dayjs(nowTime).format('hh:mm A'));
      // setMarkerList(prev => [...new Set([...newMarkerList, ...prev])]);
    },
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
        style={{ height: '100%', width: '100%' }}
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
      {/* {!getNearbyMosquesMutation.isLoading && !isLoading && (
        <MapView
          style={{ height: '100%', width: '100%' }}
          provider={PROVIDER_GOOGLE}
          showsUserLocation
          initialRegion={region}
          onRegionChangeComplete={setRegion}
          followsUserLocation
          showsMyLocationButton
          loadingEnabled>
          {markerList?.map((marker, index) => {
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
                  ])
                }
              />
            );
          })}
        </MapView>
      )} */}
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
