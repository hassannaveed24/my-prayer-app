import React, { useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import dayjs from 'dayjs';
import clonedeep from 'lodash.clonedeep';

import backgroundImage from '../assets/images/masjid.jpg';
import theme from '../constants/theme';

const CustomPrayerTimeModal = ({
  mode,
  isCustomPrayerTimeModalVisible,
  setIsCustomPrayerTimeModalVisible,
  customPrayers,
  setCustomPrayers,
}) => {
  const [isDatePickerModalVisible, setIsDatePickerModalVisible] = useState(false);
  const [timePickerModalData, setTimePickerModalData] = useState({});
  return (
    <Modal
      transparent
      animationType="slide"
      visible={isCustomPrayerTimeModalVisible}
      onRequestClose={() => {
        setIsCustomPrayerTimeModalVisible(!isCustomPrayerTimeModalVisible);
      }}>
      <View style={styles.container}>
        <SafeAreaView style={styles.modalView}>
          <>
            <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
              <View style={styles.modalContainer}>
                {/* Title */}
                <View style={styles.title1View}>
                  <Text style={styles.title1}>
                    {mode === 'read' ? 'set custom prayer times' : 'custom prayer times'}
                  </Text>
                  {/* <Text style={styles.title2}>{marker?.title || marker?.name}</Text> */}
                </View>
                <ScrollView
                  style={customPrayers.length > 0 && styles.scrollView}
                  contentContainerStyle={styles.contentContainer}>
                  {customPrayers.map(($customPrayer, index) => (
                    <React.Fragment key={index}>
                      <View style={styles.inputView}>
                        <View style={styles.prayerNameAndTimeView}>
                          <TextInput
                            editable={mode !== 'read'}
                            style={styles.textInput}
                            autoCapitalize="characters"
                            placeholderTextColor={theme.placeholder}
                            placeholder="Prayer Name"
                            // autoCompleteType=""
                            keyboardType="default"
                            returnKeyType="done"
                            // textContentType="name"
                            onChangeText={text => {
                              const newCustomPrayers = [...customPrayers];
                              customPrayers[index].prayerName = text;
                              setCustomPrayers(newCustomPrayers);
                            }}
                            value={customPrayers[index].prayerName}
                          />
                          <TouchableWithoutFeedback
                            onPress={() => {
                              if (mode !== 'read') {
                                setTimePickerModalData({ prayer: $customPrayer, index });
                                setIsDatePickerModalVisible(true);
                              }
                            }}>
                            <View style={styles.setPrayerTimeView}>
                              <Text style={styles.times}>
                                {$customPrayer?.prayerTime
                                  ? dayjs($customPrayer.prayerTime).format('hh:mm A')
                                  : `?`}
                              </Text>
                              {mode !== 'read' && (
                                <View>
                                  <Icon name="edit" size={32} color="white" />
                                </View>
                              )}
                            </View>
                          </TouchableWithoutFeedback>
                        </View>
                        {mode !== 'read' && (
                          <TouchableWithoutFeedback
                            onPress={() => {
                              const newCustomPrayers = clonedeep(customPrayers);
                              newCustomPrayers.splice(index, 1);
                              setCustomPrayers(newCustomPrayers);
                            }}>
                            <View style={styles.minusIconView}>
                              <Icon name="minus" size={32} color={theme.danger} />
                            </View>
                          </TouchableWithoutFeedback>
                        )}
                      </View>
                    </React.Fragment>
                  ))}
                  {mode !== 'read' && (
                    <>
                      <DateTimePickerModal
                        isVisible={isDatePickerModalVisible}
                        mode="time"
                        date={timePickerModalData.prayer?.prayerTime || new Date()}
                        onConfirm={date => {
                          const newCustomPrayers = clonedeep(customPrayers);
                          newCustomPrayers[timePickerModalData.index].prayerTime = date;
                          setCustomPrayers(newCustomPrayers);
                          setTimePickerModalData({});
                          setIsDatePickerModalVisible(false);
                        }}
                        onCancel={() => {
                          setTimePickerModalData({});
                          setIsDatePickerModalVisible(false);
                        }}
                      />

                      <TouchableWithoutFeedback
                        onPress={() =>
                          setCustomPrayers(prev => [
                            ...prev,
                            { prayerName: '', prayerTime: new Date() },
                          ])
                        }>
                        <View style={styles.addNewPrayerView}>
                          <View>
                            <Text style={styles.times}>add new prayer time</Text>
                          </View>
                          <View>
                            <Icon name="plus" size={32} color="white" />
                          </View>
                        </View>
                      </TouchableWithoutFeedback>
                    </>
                  )}
                </ScrollView>
                {mode !== 'read' && (
                  // {/* Navigate Button */}
                  <TouchableWithoutFeedback
                    onPress={() => {
                      if (customPrayers.filter(p => p.prayerName === '').length > 0) {
                        ToastAndroid.show(`Prayer name can't be empty!`, ToastAndroid.LONG);
                      } else {
                        setIsCustomPrayerTimeModalVisible(false);
                      }
                    }}>
                    <View style={styles.buttonView}>
                      <Text style={styles.buttonText}>update</Text>
                    </View>
                  </TouchableWithoutFeedback>
                )}
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
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',

    minHeight: Dimensions.get('screen').height - 170,
    paddingTop: 30,
    // backgroundColor: 'white',
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
  scrollView: {
    backgroundColor: theme.scrollViewBackground,
    maxHeight: Dimensions.get('screen').height - 340,
    contentContainer: {
      paddingVertical: 20,
    },
  },
  contentContainer: {
    padding: 20,
  },
  inputView: {
    backgroundColor: theme.background,

    height: 80,
    // maxHeight: 56 * 2,
    // width: '100%',
    width: Dimensions.get('screen').width - 60,
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
  prayerNameAndTimeView: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  textInput: {
    width: '90%',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 30,
    color: 'white',
    textTransform: 'uppercase',
    textAlign: 'left',
  },
  addNewPrayerView: {
    backgroundColor: theme.background,

    minHeight: 56,
    maxHeight: 56,
    // width: '100%',
    width: Dimensions.get('screen').width - 60,
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
    // position: 'absolute',
    // bottom: 135,
  },
  setPrayerTimeView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
  },
  times: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 30,
    //margin:'2%',
    color: 'white',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  minusIconView: {
    width: '20%',
    height: '100%',
    // color: 'orange',
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonView: {
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
  buttonText: {
    textTransform: 'uppercase',
    color: theme.buttonText,
  },
});

export default CustomPrayerTimeModal;
