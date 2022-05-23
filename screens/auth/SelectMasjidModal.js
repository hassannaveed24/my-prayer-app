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
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import axios from 'axios';
import { useMutation, useQuery } from 'react-query';
import _ from 'lodash';
import theme from '../../constants/theme';
import { GOOGLE_API_KEY, RADIUS } from '@env';
import { Formik } from 'formik';
import { getAllMasjids } from '../../helper functions';

const SelectMasjidModal = ({ selectMasjidModalVisible, setSelectMasjidModalVisible, formik }) => {
  const [region, setRegion] = useState({
    latitude: 1,
    longitude: 1,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markerList, setMarkerList] = useState([]);
  const masjidQuery = useQuery(
    ['masjid', region.latitude, region.longitude],
    () => {
      return axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?', {
        params: {
          location: `${region.latitude},${region.longitude}`,
          type: 'mosque',
          key: GOOGLE_API_KEY,
          radius: RADIUS,
        },
        // headers: { Authorization: `Bearer ${}` },
      });
    },
    {
      onSuccess: async res => {
        const newMarkerList = res.data.results.map(marker => {
          const { lat, lng } = marker.geometry.location;
          return {
            coordinate: { latitude: lat, longitude: lng },
            title: marker?.name,
            image: marker?.icon,
            place_id: marker.place_id,
          };
        });
        const masjidsWithImam = await getAllMasjids();
        const differenceOfNewMarkerListAndMasjidsWithImam = newMarkerList.filter(newMarker => {
          return (
            masjidsWithImam.findIndex(
              masjidWithImam => masjidWithImam.place_id === newMarker.place_id,
            ) < 0
          );
        });

        setMarkerList(prev => [
          ...new Set([...differenceOfNewMarkerListAndMasjidsWithImam, ...prev]),
        ]);
      },
      onError: e => {
        console.log(e?.message);
        ToastAndroid.show(e?.message, ToastAndroid.SHORT);
      },
    },
  );
  useEffect(() => {
    async function gettingCoords() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        ToastAndroid.show('Permission to access location was denied', ToastAndroid.LONG);
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = coords;
      setRegion(prev => ({ ...prev, latitude, longitude }));
      // getNearbyMosquesMutation.mutate({
      //   location: `${latitude},${longitude}`,
      //   type: 'mosque',
      //   key: GOOGLE_API_KEY,
      //   radius: RADIUS,
      // });
    }
    gettingCoords();
  }, []);

  return (
    <Modal
      transparent
      animationType="slide"
      visible={selectMasjidModalVisible}
      onRequestClose={() => {
        setSelectMasjidModalVisible(!selectMasjidModalVisible);
      }}>
      <View style={styles.container}>
        <SafeAreaView style={styles.modalView}>
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
            {markerList?.map((marker, index) => {
              return (
                <Marker
                  key={index}
                  {...marker}
                  onPress={() =>
                    Alert.alert(
                      'Select Masjid',
                      `Are you sure you want to select ${marker.title}?`,
                      [
                        {
                          text: 'No',
                          onPress: () => console.log('Cancel Pressed'),
                          style: 'cancel',
                        },
                        {
                          text: 'Yes',
                          onPress: () => {
                            formik.setFieldValue(
                              'masjid',
                              _.pick(marker, ['coordinate', 'title', 'place_id']),
                            );
                            setSelectMasjidModalVisible(false);
                          },
                        },
                      ],
                    )
                  }
                />
              );
            })}
          </MapView>
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
});

export default SelectMasjidModal;
