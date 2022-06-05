import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  ImageBackground,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import backgroundImage from '../../assets/images/masjid.jpg';

import theme from '../../constants/theme';

const ScreenWrapper = ({ children }) => {
  return (
    <>
      {/* <KeyboardAvoidingView> */}
      <ImageBackground source={backgroundImage} style={styles.backgroundImage} />
      <SafeAreaView style={styles.container}>
        <ScrollView>{children}</ScrollView>
      </SafeAreaView>
      {/* </KeyboardAvoidingView> */}
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    // backgroundColor: 'orange',
    height: Dimensions.get('screen').height - 130,
    // flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',

    padding: 20,
  },
  backgroundImage: { width: '100%', height: '100%', resizeMode: 'cover', position: 'absolute' },
});
export default ScreenWrapper;
