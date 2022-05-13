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
import theme from '../constants/theme';

export default function Maps({ navigation }) {
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [markerList, setMarkerList] = useState([]);

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
      onSuccess: res => {
        const newMarkerList = res.data.results.map(marker => {
          const { lat, lng } = marker.geometry.location;
          return {
            coordinate: { latitude: lat, longitude: lng },
            title: marker?.name,
            image: marker?.icon,
          };
        });
        setMarkerList(prev => [...new Set([...newMarkerList, ...prev])]);
      },
      onError: e => {
        console.log(e?.message);
        ToastAndroid.show(e?.message, ToastAndroid.SHORT);
      },
    },
  );

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
