import { StatusBar, Button } from 'expo-status-bar';
import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Alert, Linking, Platform, ToastAndroid } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { useMutation, useQuery } from 'react-query';
import axios from 'axios';
import { GOOGLE_API_KEY, RADIUS } from '@env';

export default function Maps({ navigation }) {
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [markerList, setMarkerList] = useState([]);
  const getNearbyMosquesMutation = useMutation(
    params => {
      return axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?', {
        params,
        // headers: { Authorization: `Bearer ${}` },
      });
    },
    {
      onSuccess: res => {
        let newMarkerList = [];
        res.data.results.map(marker => {
          const { lat, lng } = marker.geometry.location;
          newMarkerList.push({
            coordinate: { latitude: lat, longitude: lng },
            title: marker?.name,
            image: marker?.icon,
          });
        });
        setMarkerList(newMarkerList);
        setIsLoading(false);
      },
      onError: e => {
        setIsLoading(false);
        console.log(e?.message);
        ToastAndroid.show(e?.message, ToastAndroid.SHORT);
      },
    },
  );
  useEffect(() => {
    async function gettingCoords() {
      setIsLoading(true);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsLoading(false);
        ToastAndroid.show('Permission to access location was denied', ToastAndroid.LONG);
      }
      let { coords } = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = coords;
      setRegion(prev => ({ ...prev, latitude, longitude }));
      getNearbyMosquesMutation.mutate({
        location: `${latitude},${longitude}`,
        type: 'mosque',
        key: GOOGLE_API_KEY,
        radius: RADIUS,
      });
      setIsLoading(false);
    }
    gettingCoords();
  }, []);

  const handleMarkerPress = marker => {
    console.log(marker.nativeEvent.coordinate);
  };

  return (
    <SafeAreaView style={styles.container}>
      {!getNearbyMosquesMutation.isLoading && !isLoading && (
        <MapView
          style={{ height: '100%', width: '100%' }}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
          initialRegion={region}
          onRegionChangeComplete={setRegion}
          // onRegionChange={setRegion}
        >
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
      )}
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
});
