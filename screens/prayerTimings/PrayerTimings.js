import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  ToastAndroid,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper';
import theme from '../../constants/theme';
import { useMutation, useQuery } from 'react-query';
import Icon from 'react-native-vector-icons/AntDesign';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import dayjs from 'dayjs';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { authentication, database } from '../../database/firebaseDB';
import CustomPrayerTimeModal from './CustomPrayerTimeModal';

const mutationFn = payload => {
  return new Promise((resolve, reject) => {
    getDoc(doc(database, 'users', authentication.currentUser.uid))
      .then(res => {
        updateDoc(doc(database, 'masjids', res.data().masjid), {
          prayerTimes: payload,
        })
          .then(() => {
            resolve();
          })
          .catch(err => reject(err));
      })
      .catch(err => reject(err));
  });
};

const queryFn = () => {
  return new Promise((resolve, reject) => {
    getDoc(doc(database, 'users', authentication.currentUser.uid))
      .then(res =>
        getDoc(doc(database, 'masjids', res.data().masjid))
          .then(doc => {
            resolve(doc.data());
          })
          .catch(err => reject(err)),
      )
      .catch(err => reject(err));
  });
};
const PrayerTimings = () => {
  const [isFajarDatePickerVisible, setIsFajarDatePickerVisible] = useState(false);
  const [isDuharDatePickerVisible, setIsDuharDatePickerVisible] = useState(false);
  const [isAsarDatePickerVisible, setIsAsarDatePickerVisible] = useState(false);
  const [isMaghribDatePickerVisible, setIsMaghribDatePickerVisible] = useState(false);
  const [isIshaDatePickerVisible, setIsIshaDatePickerVisible] = useState(false);
  const [isCustomPrayerTimeModalVisible, setIsCustomPrayerTimeModalVisible] = useState(false);
  const [fajar, setFajar] = useState(null);
  const [duhar, setDuhar] = useState(null);
  const [asar, setAsar] = useState(null);
  const [maghrib, setMaghrib] = useState(null);
  const [isha, setIsha] = useState(null);
  const [customPrayers, setCustomPrayers] = useState([
    {
      prayerName: 'eid-ul-azha',
      prayerTime: new Date(),
    },
  ]);

  const query = useQuery(['getPrayerTimes'], queryFn, {
    onSuccess: res => {
      if (res.prayerTimes) {
        const { fajar, duhar, asar, maghrib, isha } = res.prayerTimes;
        setFajar(fajar?.toDate() || null);
        setDuhar(duhar?.toDate() || null);
        setAsar(asar?.toDate() || null);
        setMaghrib(maghrib?.toDate() || null);
        setIsha(isha?.toDate() || null);
      }
    },
    onError: err => {
      ToastAndroid.show(err.message || 'error', ToastAndroid.LONG);
    },
  });

  const mutation = useMutation(
    mutationFn,
    {
      onSuccess: res => {
        Alert.alert('Updated', 'Prayer times successfully updated');
      },
      onError: err => {
        ToastAndroid.show(err.message || 'error', ToastAndroid.LONG);
      },
    },
    { retry: false },
  );

  const handleUpdateButton = () => {
    mutation.mutate({ fajar, duhar, asar, maghrib, isha });
  };

  return (
    <>
      <ScreenWrapper>
        {query.isLoading ? (
          <View style={styles.spinnerView}>
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : (
          <>
            <View style={styles.container}>
              {/* Title */}
              <View style={styles.title1View}>
                <Text style={styles.title1}>Prayer Times</Text>
              </View>

              {/* Fajar */}
              <TouchableWithoutFeedback onPress={() => setIsFajarDatePickerVisible(true)}>
                <View style={styles.inputView}>
                  <View>
                    <Text style={styles.times}>
                      Fajar: {fajar ? dayjs(fajar).format('hh:mm A') : `?`}
                    </Text>
                  </View>
                  <View>
                    <Icon name="edit" size={32} color="white" />
                  </View>
                </View>
              </TouchableWithoutFeedback>
              <DateTimePickerModal
                isVisible={isFajarDatePickerVisible}
                mode="time"
                date={fajar ? fajar : new Date()}
                onConfirm={date => {
                  setFajar(date);
                  setIsFajarDatePickerVisible(false);
                }}
                onCancel={() => setIsFajarDatePickerVisible(false)}
              />
              {/* DUHAR */}
              <TouchableWithoutFeedback onPress={() => setIsDuharDatePickerVisible(true)}>
                <View style={styles.inputView}>
                  <View>
                    <Text style={styles.times}>
                      DUHAR: {duhar ? dayjs(duhar).format('hh:mm A') : `?`}
                    </Text>
                  </View>
                  <View>
                    <Icon name="edit" size={32} color="white" />
                  </View>
                </View>
              </TouchableWithoutFeedback>
              <DateTimePickerModal
                isVisible={isDuharDatePickerVisible}
                mode="time"
                date={duhar ? duhar : new Date()}
                onConfirm={date => {
                  setDuhar(date);
                  setIsDuharDatePickerVisible(false);
                }}
                onCancel={() => setIsDuharDatePickerVisible(false)}
              />
              {/* ASAR */}
              <TouchableWithoutFeedback onPress={() => setIsAsarDatePickerVisible(true)}>
                <View style={styles.inputView}>
                  <View>
                    <Text style={styles.times}>
                      ASAR: {asar ? dayjs(asar).format('hh:mm A') : `?`}
                    </Text>
                  </View>
                  <View>
                    <Icon name="edit" size={32} color="white" />
                  </View>
                </View>
              </TouchableWithoutFeedback>
              <DateTimePickerModal
                isVisible={isAsarDatePickerVisible}
                mode="time"
                date={asar ? asar : new Date()}
                onConfirm={date => {
                  setAsar(date);
                  setIsAsarDatePickerVisible(false);
                }}
                onCancel={() => setIsAsarDatePickerVisible(false)}
              />
              {/* MAGRIB */}
              <TouchableWithoutFeedback onPress={() => setIsMaghribDatePickerVisible(true)}>
                <View style={styles.inputView}>
                  <View>
                    <Text style={styles.times}>
                      MAGRIB: {maghrib ? dayjs(maghrib).format('hh:mm A') : `?`}
                    </Text>
                  </View>
                  <View>
                    <Icon name="edit" size={32} color="white" />
                  </View>
                </View>
              </TouchableWithoutFeedback>
              <DateTimePickerModal
                isVisible={isMaghribDatePickerVisible}
                mode="time"
                date={maghrib ? maghrib : new Date()}
                onConfirm={date => {
                  setMaghrib(date);
                  setIsMaghribDatePickerVisible(false);
                }}
                onCancel={() => setIsMaghribDatePickerVisible(false)}
              />
              {/* ISHA */}
              <TouchableWithoutFeedback onPress={() => setIsIshaDatePickerVisible(true)}>
                <View style={styles.inputView}>
                  <View>
                    <Text style={styles.times}>
                      ISHA: {isha ? dayjs(isha).format('hh:mm A') : `?`}
                    </Text>
                  </View>
                  <View>
                    <Icon name="edit" size={32} color="white" />
                  </View>
                </View>
              </TouchableWithoutFeedback>
              <DateTimePickerModal
                isVisible={isIshaDatePickerVisible}
                mode="time"
                date={isha ? isha : new Date()}
                onConfirm={date => {
                  setIsha(date);
                  setIsIshaDatePickerVisible(false);
                }}
                onCancel={() => setIsIshaDatePickerVisible(false)}
              />

              {/* Custom Prayer Button */}
              <TouchableWithoutFeedback onPress={() => setIsCustomPrayerTimeModalVisible(true)}>
                <View style={styles.inputView}>
                  <View>
                    <Text style={styles.times}>custom prayer time</Text>
                  </View>
                  <View>
                    <Icon name="edit" size={32} color="white" />
                  </View>
                </View>
              </TouchableWithoutFeedback>
              <CustomPrayerTimeModal
                isCustomPrayerTimeModalVisible={isCustomPrayerTimeModalVisible}
                setIsCustomPrayerTimeModalVisible={setIsCustomPrayerTimeModalVisible}
                customPrayers={customPrayers}
                setCustomPrayers={setCustomPrayers}
              />
            </View>
            {/* Update Button */}
            <TouchableWithoutFeedback onPress={handleUpdateButton}>
              <View style={styles.updateButtonView}>
                {mutation.isLoading ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.buttonText}>Update Time</Text>
                )}
              </View>
            </TouchableWithoutFeedback>
          </>
        )}
      </ScreenWrapper>
    </>
  );
};
const styles = StyleSheet.create({
  spinnerView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',

    // backgroundColor: 'aqua',
  },
  inputView: {
    backgroundColor: theme.background,

    height: 56,
    maxHeight: 56,
    width: '100%',
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
  setTimingsView: {
    maxHeight: 40,
    height: 40,
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius,
  },
  textInput: {
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 16,
    color: theme.inputText,
    width: '100%',

    height: '100%',
  },
  passwordIconView: {
    position: 'absolute',
    right: 0,
    height: '100%',
    width: 60,
    display: 'flex',
    justifyContent: 'center',
  },
  passwordIcon: { position: 'absolute', right: 15 },
  masjidView: {},
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',

    minHeight: Dimensions.get('screen').height - 170,
    paddingTop: 30,
    // backgroundColor: 'white',
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
  title2: {
    fontSize: 16,
    fontWeight: '300',
    color: theme.title,
    textTransform: 'uppercase',
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
    bottom: 15,
  },
  selectMasjidButtonView: {
    maxHeight: 40,
    width: '100%',
    backgroundColor: theme.button,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius,
    marginBottom: 20,
  },
  buttonText: {
    textTransform: 'uppercase',
    color: theme.buttonText,
  },
});

export default PrayerTimings;
