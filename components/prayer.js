import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    ActivityIndicator,
    colors,
    constructor,
    Button,
    Alert,
    Linking,
    PermissionsAndroid,
    TouchableWithoutFeedback,
    ToastAndroid,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { getPrayerTimings } from './function';
import Maps from './maps';
import { useMutation, useQuery } from 'react-query';
import axios from 'axios';
import { GOOGLE_API_KEY, RADIUS } from '@env';

export default function prayer({ navigation }) {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [displayCurrentAddress, setDisplayCurrentAddress] = useState('Wait, we are fetching you location...');
    const [prayerTimes, setPrayerTimes] = React.useState(null);
    const [isLoading, setIsLoading] = useState(false);
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
                    let address = `${item.name}, ${item.street}, ${item.postalCode}, ${item.city}`;
                    setDisplayCurrentAddress(address);
                }
            }
        }
        gettingCoords();
    }, []);

    const getCurrentLocation = async () => {
        if (Platform.OS !== 'android') throw new Error('Invalid platform');
        const status = await Location.requestForegroundPermissionsAsync();
        if (status.status !== 'granted') throw new Error('Location not granted');

        const location = await Location.getCurrentPositionAsync({});

        if (location.hasOwnProperty('mocked') && location.mocked) throw new Error('Please turn off mock location');

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
        (params) => {
            return axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?', {
                params,
                // headers: { Authorization: `Bearer ${}` },
            });
        },
        {
            onSuccess: (response) => {
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
            onError: (e) => {
                setIsLoading(false);
                console.log(e.message);
                ToastAndroid.show(e.message, ToastAndroid.SHORT);
            },
        },
    );
    const handleNearestMasjid = async () => {
        setIsLoading(true);
        const coords = await getCurrentLocation();

        // radius: RADIUS,
        getNearbyMosquesMutation.mutate({
            location: `${coords.latitude},${coords.longitude}`,
            type: 'mosque',
            key: GOOGLE_API_KEY,
        });
    };

    ///////////////////////////////////////////////////////////////

    return (
        <>
            <View style={styles.container}>
                <ImageBackground source={require('./masjid.jpg')} style={styles.image} />

                <View style={styles.Titles}>
                    <Text style={styles.title}>PRAYERS TIMINGS</Text>

                    <Text style={styles.big}> {displayCurrentAddress} </Text>
                </View>

                <View style={styles.times1}>
                    {prayerTimes != null && (
                        <View style={styles.prayerTimesContainer}>
                            <Text style={styles.times}> FAJAR {prayerTimes.timings.Fajr}</Text>
                            <Text style={styles.times}> DUHAR {prayerTimes.timings.Dhuhr}</Text>
                            <Text style={styles.times}> ASAR {prayerTimes.timings.Asr}</Text>
                            <Text style={styles.times}> MAGRIB {prayerTimes.timings.Maghrib}</Text>
                            <Text style={styles.times}> ISHA {prayerTimes.timings.Isha}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.spinnerView}>
                    {isLoading ? <ActivityIndicator size="large" color="white" /> : <></>}
                </View>

                <TouchableWithoutFeedback
                    onPress={() => {
                        setTimings(new Date());
                    }}
                >
                    <View style={styles.button1}>
                        <View style={styles.button2TextView}>
                            <Text style={styles.button2Text}>Get Prayers Times</Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={handleNearestMasjid}>
                    <View style={[styles.button2, {}]}>
                        <View style={styles.button2TextView}>
                            <Text style={styles.button2Text}>Go To Nearest Masjid</Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    spinnerView: {},
    container: {
        flex: 1,
        backgroundColor: '#008000',
        //alignItems: 'center',
        //justifyContent:'center',
    },
    Titles: {
        margin: '20%',
        width: '60%',
        alignItems: 'center',
    },
    title: {
        fontSize: 23,
        fontWeight: '700',
        color: '#00bfff',
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
        color: '#00bfff',
    },

    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        position: 'absolute',
    },

    button1: {
        // height: '10%',
        // width: '90%',
        // padding: 10,
        // //bottom:5,
        // //position:'absolute',
        // // borderRadius: 40,
        // color: '#2196F3',
        // backgroundColor: 'orange',

        height: 40,
        width: '90%',
        position: 'absolute',
        bottom: '15%',
        left: '5%',
        backgroundColor: '#2196F3',
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
        backgroundColor: '#2196F3',
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
    times: {
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 30,
        //margin:'2%',
        color: '#00bfff',
    },
});
