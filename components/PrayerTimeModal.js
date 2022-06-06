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
  Dimensions,
  ImageBackground,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import axios from 'axios';
import { useMutation, useQuery } from 'react-query';
import _ from 'lodash';
import theme from '../constants/theme';
import { GOOGLE_API_KEY, RADIUS } from '@env';
import { Formik } from 'formik';
import dayjs from 'dayjs';
import backgroundImage from '../assets/images/masjid.jpg';

const handleNavigateButton = marker => {
  if (marker) {
    const lat = marker?.coordinate?.latitude || marker?.geometry?.location?.lat;
    const lng = marker?.coordinate?.longitude || marker?.geometry?.location?.lng;
    const title = marker?.title || marker?.name;
    Alert.alert('Go To Masjid', `Are you sure you want to go to ${title}?`, [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => {
          const url = Platform.select({
            ios: 'maps:' + lat + ',' + lng + '?q=' + title,
            android: 'geo:' + lat + ',' + lng + '?q=' + title,
          });
          console.log(title);
          Linking.openURL(url);
        },
      },
    ]);
  }
};

const PrayerTimeModal = ({ isPrayerTimeModalVisible, setIsPrayerTimeModalVisible, marker }) => {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={isPrayerTimeModalVisible}
      onRequestClose={() => {
        setIsPrayerTimeModalVisible(!isPrayerTimeModalVisible);
      }}>
      <View style={styles.container}>
        <SafeAreaView style={styles.modalView}>
          <>
            <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
              <View style={styles.modalContainer}>
                {/* Title */}
                <View style={styles.title1View}>
                  <Text style={styles.title1}>Prayer Times</Text>
                  <Text style={styles.title2}>{marker?.title || marker?.name}</Text>
                  {marker?.customMessage && (
                    <Text style={styles.title3}>{marker.customMessage}</Text>
                  )}
                </View>
                <ScrollView style={styles.scrollView}>
                  {marker?.prayerTimes?.customPrayers &&
                    marker?.prayerTimes?.customPrayers.map(($prayer, index) => (
                      <View style={styles.customPrayerView} key={index}>
                        <View>
                          <Text style={styles.times}>
                            {$prayer.prayerName + ': '}
                            {dayjs($prayer?.prayerTime.toDate()).format('hh:mm A')}
                          </Text>
                        </View>
                      </View>
                    ))}

                  {/* Fajar */}

                  <View style={styles.inputView}>
                    <View>
                      <Text style={styles.times}>
                        Fajar:{' '}
                        {marker?.prayerTimes?.fajar
                          ? dayjs(marker?.prayerTimes?.fajar.toDate()).format('hh:mm A')
                          : `?`}
                      </Text>
                    </View>
                  </View>

                  {/* DUHAR */}

                  <View style={styles.inputView}>
                    <View>
                      <Text style={styles.times}>
                        DUHAR:{' '}
                        {marker?.prayerTimes?.duhar
                          ? dayjs(marker?.prayerTimes?.duhar.toDate()).format('hh:mm A')
                          : `?`}
                      </Text>
                    </View>
                  </View>

                  {/* ASAR */}

                  <View style={styles.inputView}>
                    <View>
                      <Text style={styles.times}>
                        ASAR:{' '}
                        {marker?.prayerTimes?.asar
                          ? dayjs(marker?.prayerTimes?.asar.toDate()).format('hh:mm A')
                          : `?`}
                      </Text>
                    </View>
                  </View>

                  {/* MAGRIB */}

                  <View style={styles.inputView}>
                    <View>
                      <Text style={styles.times}>
                        MAGRIB:{' '}
                        {marker?.prayerTimes?.maghrib
                          ? dayjs(marker.prayerTimes.maghrib.toDate()).format('hh:mm A')
                          : `?`}
                      </Text>
                    </View>
                  </View>

                  {/* ISHA */}

                  <View style={styles.inputView}>
                    <View>
                      <Text style={styles.times}>
                        ISHA:{' '}
                        {marker?.prayerTimes?.isha
                          ? dayjs(marker.prayerTimes.isha.toDate()).format('hh:mm A')
                          : `?`}
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Navigate Button */}
                <TouchableWithoutFeedback onPress={() => handleNavigateButton(marker)}>
                  <View style={styles.updateButtonView}>
                    {false ? (
                      <ActivityIndicator />
                    ) : (
                      <Text style={styles.updateButtonText}>Navigate To Masjid</Text>
                    )}
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </ImageBackground>
          </>
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
  backgroundImage: { width: '100%', height: '100%', resizeMode: 'cover', position: 'absolute' },
  modalView: {
    height: '95%',
    width: '95%',

    // backgroundColor: 'white',
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
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',

    minHeight: Dimensions.get('screen').height - 170,
    paddingTop: 30,
    // backgroundColor: 'white',
  },
  scrollView: {
    backgroundColor: theme.scrollViewBackground,
    // backgroundColor: 'orange',
    width: Dimensions.get('screen').width - 60,

    maxHeight: Dimensions.get('screen').height - 450,
    contentContainer: {
      paddingVertical: 20,
    },
  },
  title1View: {
    // backgroundColor: 'orange',
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
    maxHeight: 140,
    marginBottom: 20,
  },
  title1: {
    fontSize: 23,
    fontWeight: '700',
    color: theme.title,
    textTransform: 'uppercase',
  },
  customPrayerView: {
    backgroundColor: theme.backgroundDarker,
    width: Dimensions.get('screen').width - 60,

    height: 56,
    maxHeight: 56,
    marginBottom: 20,
    // borderStyle: 'solid',
    // borderWidth: 1,
    // borderColor: theme.border,
    borderRadius: theme.borderRadius,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  inputView: {
    backgroundColor: theme.background,
    width: Dimensions.get('screen').width - 60,

    height: 56,
    maxHeight: 56,
    marginBottom: 20,
    // borderStyle: 'solid',
    // borderWidth: 1,
    // borderColor: theme.border,
    borderRadius: theme.borderRadius,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  times: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 30,
    //margin:'2%',
    color: 'white',
    textTransform: 'uppercase',
  },
  title2: {
    fontSize: 16,
    fontWeight: '300',
    color: theme.title,
    textTransform: 'uppercase',
  },
  title3: {
    fontSize: 14,
    fontWeight: '200',
    color: theme.title,
    textTransform: 'uppercase',
    padding: 15,
    textAlign: 'center',
  },
  updateButtonView: {
    maxHeight: 40,
    height: 40,
    width: '100%',
    backgroundColor: theme.button,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius,
    position: 'absolute',
    bottom: 75,
    // top: 230,
  },
  updateButtonText: {
    textTransform: 'uppercase',
    color: theme.buttonText,
  },
});

export default PrayerTimeModal;
