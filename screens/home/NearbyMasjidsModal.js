import React, { useEffect, useState } from 'react';
import {
  Modal,
  Text,
  StyleSheet,
  View,
  ToastAndroid,
  SafeAreaView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { useQuery } from 'react-query';
import _ from 'lodash';
import theme from '../../constants/theme';
import { GOOGLE_API_KEY, RADIUS } from '@env';
import { collection, getDocs } from 'firebase/firestore';
import { database } from '../../database/firebaseDB';
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper';
import PrayerTimeModal from '../../components/PrayerTimeModal';
import {
  getTimelyMasjids,
  intersectionOfTwoArrays,
  transformMasjids,
  excludeMasjids,
  getCurrentLocation,
} from '../../helper functions';

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
      const differenceOfQueriedAndExcludedMasjids = queriedMasjids.filter(queriedMasjid => {
        return (
          excludedMasjids.findIndex(
            excludedMasjid => excludedMasjid.place_id === queriedMasjid.place_id,
          ) < 0
        );
      });

      const finalArray = intersectionOfTwoArrays(
        queriedMasjids,
        differenceOfQueriedAndExcludedMasjids,
      );

      finalArray.forEach(($finalMasjid, index) => {
        const correspondingTimelyMasjid = filteredMasjids.find(
          $filteredMasjid => $filteredMasjid.place_id === $finalMasjid.place_id,
        );

        if (correspondingTimelyMasjid) finalArray[index] = correspondingTimelyMasjid;
      });

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
      console.log('error');
      console.log(e.message);
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
