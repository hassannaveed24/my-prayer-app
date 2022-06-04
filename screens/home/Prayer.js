import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  ActivityIndicator,
  Linking,
  TouchableWithoutFeedback,
  ToastAndroid,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { getPrayerTimings } from './function';
import { useMutation, useQuery } from 'react-query';
import axios from 'axios';
import { GOOGLE_API_KEY, RADIUS } from '@env';
import backgroundImage from '../../assets/images/masjid.jpg';

import { signOut } from 'firebase/auth';
import { authentication } from '../../database/firebaseDB';
import theme from '../../constants/theme';
import NearbyMasjidsModal from './NearbyMasjidsModal';
const signOutMutationFn = payload => {
  return new Promise((resolve, reject) => {
    signOut(authentication)
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
};

export default function Prayer({ navigation }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [displayCurrentAddress, setDisplayCurrentAddress] = useState(
    'Wait, we are fetching you location...',
  );
  const [prayerTimes, setPrayerTimes] = React.useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isNearbyMasjidsModalVisible, setIsNearbyMasjidsModalVisible] = useState(false);

  useEffect(() => {
    async function gettingCoords() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
      }
      let { coords } = await Location.getCurrentPositionAsync({});
      if (coords) {
        const { latitude, longitude } = coords;
        let response = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        for (let item of response) {
          const address = ` ${item.city}`;
          setDisplayCurrentAddress(address);
        }
      }
    }
    gettingCoords();
  }, []);
  useEffect(() => {
    const unsubscribe = authentication.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

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
  async function setTimings(date) {
    setIsLoading(true);
    let prayertimes = await getPrayerTimings(date, location);
    setPrayerTimes(prayertimes);
    setIsLoading(false);

    // console.log(prayertimes);
  }
  const getNearbyMosquesMutation = useMutation(
    params => {
      return axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?', {
        params,
        // headers: { Authorization: `Bearer ${}` },
      });
    },
    {
      onSuccess: response => {
        if (response.data.status !== 'OK') {
          setIsLoading(false);
          ToastAndroid.show(response.data.status, ToastAndroid.SHORT);
          return;
        }
        let latitude = response?.data?.results[0]?.geometry?.location?.lat;
        let longitude = response?.data?.results[0]?.geometry?.location?.lng;

        let label = response?.data?.results[0]?.name;
        const url = Platform.select({
          ios: 'maps:' + latitude + ',' + longitude + '?q=' + label,
          android: 'geo:' + latitude + ',' + longitude + '?q=' + label,
        });
        setIsLoading(false);
        Linking.openURL(url);
      },
      onError: e => {
        setIsLoading(false);
        console.log(e.message);
        ToastAndroid.show(e.message, ToastAndroid.SHORT);
      },
    },
  );

  const handleNearbyMasjidsClick = async () => {
    setIsNearbyMasjidsModalVisible(true);
    // setIsLoading(true);
    // const coords = await getCurrentLocation();
    // getNearbyMosquesMutation.mutate({
    //   location: `${coords.latitude},${coords.longitude}`,
    //   type: 'mosque',
    //   key: GOOGLE_API_KEY,
    //   radius: RADIUS,
    // });
  };

  const signOutMutation = useMutation(
    signOutMutationFn,
    {
      onSuccess: () => {
        ToastAndroid.show('Successfully signed out!', ToastAndroid.SHORT);
      },
      onError: err => {
        console.log('error');
        ToastAndroid.show(err.message, ToastAndroid.SHORT);
      },
    },
    { retry: false },
  );
  const handleSignOut = () => {
    if (signOutMutation.isLoading) {
      return;
    }
    Alert.alert('Sign Out', 'Are you sure you want to be signed out?', [
      {
        text: 'No',
        style: 'cancel',
        onPress: () => {},
      },
      {
        text: 'Yes',
        onPress: () => {
          signOutMutation.mutate();
        },
      },
    ]);
  };
  ///////////////////////////////////////////////////////////////

  return (
    <>
      <View style={styles.container}>
        <ImageBackground source={backgroundImage} style={styles.image} />
        {user && (
          <TouchableWithoutFeedback onPress={handleSignOut}>
            <View style={styles.logoutIconView}>
              <Icon name="log-out-outline" size={40} color={theme.placeholder} />
            </View>
          </TouchableWithoutFeedback>
        )}

        <View style={styles.Titles}>
          <Text style={styles.title}>PRAYERS TIMINGS</Text>

          <Text style={styles.big}> {displayCurrentAddress} </Text>
        </View>

        <View style={styles.times1}>
          {prayerTimes != null && (
            <View style={styles.prayerTimesContainer}>
              <View style={styles.timesView}>
                <Text style={styles.times}> FAJAR </Text>
                <Text style={styles.times}> {prayerTimes.timings.Fajr}</Text>
              </View>
              <View style={styles.timesView}>
                <Text style={styles.times}> DUHAR </Text>
                <Text style={styles.times}> {prayerTimes.timings.Dhuhr}</Text>
              </View>
              <View style={styles.timesView}>
                <Text style={styles.times}> ASAR </Text>
                <Text style={styles.times}> {prayerTimes.timings.Asr}</Text>
              </View>
              <View style={styles.timesView}>
                <Text style={styles.times}> MAGRIB </Text>
                <Text style={styles.times}> {prayerTimes.timings.Maghrib}</Text>
              </View>
              <View style={styles.timesView}>
                <Text style={styles.times}> ISHA </Text>
                <Text style={styles.times}> {prayerTimes.timings.Isha}</Text>
              </View>
            </View>
          )}
        </View>
        <View style={styles.spinnerView}>
          {(isLoading || signOutMutation.isLoading) && (
            <ActivityIndicator size="large" color="white" />
          )}
        </View>

        <TouchableWithoutFeedback
          onPress={() => {
            setTimings(new Date());
          }}>
          <View style={styles.button1}>
            <View style={styles.button2TextView}>
              <Text style={styles.button2Text}>Get Prayers Times</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={handleNearbyMasjidsClick}>
          <View style={[styles.button2, {}]}>
            <View style={styles.button2TextView}>
              <Text style={styles.button2Text}>Nearby Masjids</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <NearbyMasjidsModal
          isNearbyMasjidsModalVisible={isNearbyMasjidsModalVisible}
          setIsNearbyMasjidsModalVisible={setIsNearbyMasjidsModalVisible}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  spinnerView: {},
  container: {
    flex: 1,
    backgroundColor: theme.background,
    //alignItems: 'center',
    //justifyContent:'center',
  },
  logoutIconView: {
    // backgroundColor: theme.background,
    position: 'absolute',

    right: 15,
    top: 15,
    minHeight: 50,
    minWidth: 50,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Titles: {
    margin: '20%',
    width: '60%',
    alignItems: 'center',
  },
  title: {
    fontSize: 23,
    fontWeight: '700',
    color: theme.title,
  },
  times1: {
    bottom: '5%',
    width: '100%',
    height: '30%',
    // backgroundColor: '#00bfff',
  },
  prayerTimesContainer: {
    width: '100%',
    height: '100%',
    padding: 15,
    borderRadius: 30,
  },
  big: {
    fontSize: 16,
    fontWeight: '300',
    color: theme.title,
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },

  button1: {
    height: 40,
    width: '90%',
    position: 'absolute',
    bottom: '15%',
    left: '5%',
    backgroundColor: theme.button,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto',
  },
  button2: {
    height: 40,
    width: '90%',
    position: 'absolute',
    bottom: '5%',
    left: '5%',
    backgroundColor: theme.button,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto',
  },
  button2Text: {
    textTransform: 'uppercase',
    color: 'white',
  },
  button2TextView: {},
  timesView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
  },
  times: {
    fontSize: 24,
    marginTop: 14,
    fontWeight: '700',
    lineHeight: 30,
    //margin:'2%',
    color: 'white',
  },
});
