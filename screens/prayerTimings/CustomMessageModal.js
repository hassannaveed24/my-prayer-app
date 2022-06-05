import React from 'react';
import {
  Dimensions,
  ImageBackground,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import theme from '../../constants/theme';
import backgroundImage from '../../assets/images/masjid.jpg';

const CustomMessageModal = ({
  isCustomMessageModalVisible,
  setIsCustomMessageModalVisible,
  customMessage,
  setCustomMessage,
}) => {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={isCustomMessageModalVisible}
      onRequestClose={() => {
        setIsCustomMessageModalVisible(!isCustomMessageModalVisible);
      }}>
      <View style={styles.container}>
        <SafeAreaView style={styles.modalView}>
          <>
            <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
              <View style={styles.modalContainer}>
                {/* Title */}
                <View style={styles.title1View}>
                  <Text style={styles.title1}>set custom message</Text>
                  {/* <Text style={styles.title2}>{marker?.title || marker?.name}</Text> */}
                </View>
                <View style={styles.inputView}>
                  {/* <View style={styles.prayerNameAndTimeView}> */}
                  <TextInput
                    style={styles.textInput}
                    autoCapitalize="characters"
                    placeholderTextColor={theme.placeholder}
                    placeholder="Custom Message"
                    keyboardType="default"
                    returnKeyType="done"
                    onChangeText={text => {
                      setCustomMessage(text);
                    }}
                    value={customMessage}
                    multiline
                  />
                  {/* </View> */}
                </View>

                {/* Navigate Button */}
                <TouchableWithoutFeedback
                  onPress={() => {
                    setIsCustomMessageModalVisible(false);
                  }}>
                  <View style={styles.buttonView}>
                    <Text style={styles.buttonText}>update</Text>
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
  inputView: {
    backgroundColor: theme.background,
    height: 56,
    maxHeight: 400,
    // width: '100%',
    width: Dimensions.get('screen').width - 60,
    marginBottom: 20,
    // borderStyle: 'solid',
    // borderWidth: 1,
    // borderColor: theme.border,
    borderRadius: theme.borderRadius,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 5,
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
  textInput: {
    width: '90%',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 30,
    color: 'white',
    textTransform: 'uppercase',
    textAlign: 'left',
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

export default CustomMessageModal;
