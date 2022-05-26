import React, { useEffect, useState } from 'react';
import {
  Modal,
  Text,
  StyleSheet,
  View,
  Alert,
  Platform,
  Linking,
  ToastAndroid,
  SafeAreaView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import axios from 'axios';
import { useMutation, useQuery } from 'react-query';
import _ from 'lodash';
import theme from '../../constants/theme';
import { GOOGLE_API_KEY, RADIUS } from '@env';
import { Formik } from 'formik';
import { collection, documentId, getDocs, query, where } from 'firebase/firestore';
import { database } from '../../database/firebaseDB';
import dayjs from 'dayjs';
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper';
import PrayerTimeModal from '../../components/PrayerTimeModal';
import {
  getTimelyMasjids,
  intersectionOfTwoArrays,
  transformMasjids,
} from '../../helper functions';

const namazLabels = ['fajar', 'duhar', 'asar', 'maghrib', 'isha'];

const getCurrentLocation = async () => {
  if (Platform.OS !== 'android') throw new Error('Invalid platform');
  const status = await Location.requestForegroundPermissionsAsync();
  if (status.status !== 'granted') throw new Error('Location not granted');

  const location = await Location.getCurrentPositionAsync({});

  // if (location.hasOwnProperty('mocked') && location.mocked) throw new Error('Please turn off mock location');

  return {
    latitude: location.coords?.latitude,
    longitude: location.coords?.longitude,
  };
};

const getHours = $object => {
  const minutes = $object.minute();
  const hours = $object.hour();

  return (((hours + minutes / 60) * 100) / 24).toFixed(2);
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
  });
  return masjids;
};

const queryFn = async () => {
  const coords = await getCurrentLocation();

  return axios
    .get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?', {
      params: {
        location: `${coords.latitude},${coords.longitude}`,
        type: 'mosque',
        key: GOOGLE_API_KEY,
        radius: RADIUS,
      },
    })
    .then(async $xhr => {
      // const placeIds = $xhr.data.results.map($masjid => $masjid.place_id);

      const masjidCollectionRef = collection(database, 'masjids');
      const masjidSnapshot = await getDocs(masjidCollectionRef);

      const masjids = [];
      masjidSnapshot.forEach($doc => masjids.push($doc.data()));

      const filteredMasjids = getTimelyMasjids(masjids);
      const excludedMasjids = excludeMasjids(masjids);

      const queriedMasjids = $xhr.data.results;

      // quried - excluded
      const differenceOfQueriedandExcludedMasjids = queriedMasjids.filter(queriedMasjid => {
        return (
          excludedMasjids.findIndex(
            excludedMasjid => excludedMasjid.place_id === queriedMasjid.place_id,
          ) < 0
        );
      });

      // const differenceOfDifferenceOfQueriedandExcludedMasjidsAndFilteredMasjids =
      //   differenceOfQueriedandExcludedMasjids.filter(differenceOfQueriedandExcludedMasjid => {
      //     return filteredMasjids.findIndex(
      //       filteredMasjid =>
      //         filteredMasjid.place_id === differenceOfQueriedandExcludedMasjid.place_id,
      //     );
      //   });
      // const transformedMasjids = transformMasjids(
      //   differenceOfDifferenceOfQueriedandExcludedMasjidsAndFilteredMasjids,
      // );

      // console.log('hello');

      //intersection of differenceOfQueriedandExcludedMasjids and queried masjids
      const finalArray = intersectionOfTwoArrays(
        queriedMasjids,
        differenceOfQueriedandExcludedMasjids,
      );
      // console.log('hello-------------------------------------------------------');
      // filteredMasjids.forEach(masjid => {
      //   console.log(masjid.title || masjid.name);
      //   if (masjid.title || masjid.name === 'Masjid-e-Quba Ahle Hadees') console.log(masjid);
      // });

      // (queriedMasjids + timelyMasjids) - excludedMasjids

      const finalMasjidIds = finalArray.map($masjid => $masjid.place_id);

      const timelyMasjidIds = filteredMasjids.map($masjid => $masjid.place_id);

      // const timelyAndQueriedMasjidIds = [...new Set([...queriedMasjidIds, ...timelyMasjidIds])];

      // const timelyQueriedMasjids = [...filteredMasjids, ...finalArray];

      //Show only final Masjids with prayer times of timely masjids
      // const showMasjids = [];
      // finalArray.forEach($finalMasjid =>
      //   filteredMasjids.forEach($filteredMasjid => {
      //     if ($filteredMasjid.place_id === $finalMasjid.place_id) {
      //       showMasjids.push($filteredMasjid);
      //     } else if (!showMasjids.find($masjid => $masjid.place_id === $finalMasjid.place_id))
      //       showMasjids.push($finalMasjid);
      //   }),
      // );

      const showMasjids = [];

      // console.log(finalArray.map($e => $e.title || $e.name));

      finalArray.forEach(($finalMasjid, index) => {
        const correspondingTimelyMasjid = filteredMasjids.find(
          $filteredMasjid => $filteredMasjid.place_id === $finalMasjid.place_id,
        );

        if (correspondingTimelyMasjid) finalArray[index] = correspondingTimelyMasjid;
      });

      // const timelyQueriedMasjids = [...finalArray];

      // const dedupedPopulatedTimelyQueriedMasjids = [];

      // timelyQueriedMasjids.forEach($masjid => {
      //   // console.log($masjid.name);
      //   const existingIndex = dedupedPopulatedTimelyQueriedMasjids.findIndex(
      //     $e => $e.place_id === $masjid.place_id,
      //   );

      //   if (existingIndex === -1) {
      //     dedupedPopulatedTimelyQueriedMasjids.push($masjid);
      //   }
      // });

      const transformedMasjids = transformMasjids(finalArray);

      return transformedMasjids;
    });
};

const NearbyMasjidsModal = ({
  isNearbyMasjidsModalVisible,
  setIsNearbyMasjidsModalVisible,
  isLoading,
  setIsLoading,
}) => {
  const [isPrayerTimeModalVisible, setIsPrayerTimeModalVisible] = useState(false);
  const [currentMasjid, setCurrentMasjid] = useState({});
  useEffect(() => {
    query.refetch();
    setIsLoading(query.isLoading);

    return () => {};
  }, [isNearbyMasjidsModalVisible]);

  const query = useQuery(['nearbyMasjids'], queryFn, {
    onSettled: (data, error) => {
      if (data?.length === 0)
        ToastAndroid.show('No nearby masjids with matching prayer time', ToastAndroid.SHORT);
    },
    onSuccess: data => {},
    onError: e => {
      console.log(e?.message);
      ToastAndroid.show(e?.message, ToastAndroid.SHORT);
    },
    enabled: isNearbyMasjidsModalVisible,
  });

  const handleMasjidClick = masjid => {
    setCurrentMasjid(masjid);
    setIsPrayerTimeModalVisible(true);
  };

  if (query.data?.length === 0) {
    if (isNearbyMasjidsModalVisible) setIsNearbyMasjidsModalVisible(false);
    return null;
  }

  return (
    <Modal
      transparent
      animationType="slide"
      visible={isNearbyMasjidsModalVisible}
      onRequestClose={() => {
        setIsNearbyMasjidsModalVisible(!isNearbyMasjidsModalVisible);
      }}>
      <View style={styles.container}>
        <SafeAreaView style={styles.modalView}>
          {query.isLoading ? (
            <View style={styles.spinnerView}>
              <ActivityIndicator size="large" color={theme.button} />
            </View>
          ) : (
            <ScreenWrapper>
              {/* Title */}
              <View style={styles.title1View}>
                <Text style={styles.title1}>Nearby Masjids</Text>
              </View>
              {query.data?.map((masjid, index) => (
                <TouchableWithoutFeedback key={index} onPress={() => handleMasjidClick(masjid)}>
                  <View style={styles.inputView}>
                    <View>
                      <Text style={styles.times}>{masjid.title || masjid.name}</Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              ))}
              <PrayerTimeModal
                isPrayerTimeModalVisible={isPrayerTimeModalVisible}
                setIsPrayerTimeModalVisible={setIsPrayerTimeModalVisible}
                marker={currentMasjid}
              />
            </ScreenWrapper>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    height: '95%',
    width: '95%',

    backgroundColor: 'white',
    borderRadius: 4,
    // padding: 35,
    alignItems: 'center',
    shadowColor: theme.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  title1View: {
    // backgroundColor: 'orange',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: 40,
    marginBottom: 20,
  },
  title1: {
    fontSize: 23,
    fontWeight: '700',
    color: theme.title,
    textTransform: 'uppercase',
  },
  inputView: {
    backgroundColor: theme.background,

    minHeight: 56,
    // maxHeight: 56 * 2,
    // width: '100%',
    minWidth: Dimensions.get('screen').width - 60,
    marginBottom: 20,
    // borderStyle: 'solid',
    // borderWidth: 1,
    // borderColor: theme.border,
    borderRadius: theme.borderRadius,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  times: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 30,
    //margin:'2%',
    color: 'white',
    textTransform: 'uppercase',
    textAlign: 'center',
    // backgroundColor: 'aqua',
  },
});

export default NearbyMasjidsModal;
