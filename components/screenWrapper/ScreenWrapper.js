import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, ScrollView, ImageBackground } from 'react-native';

import theme from '../../constants/theme';

const ScreenWrapper = ({ children }) => {
  return (
    <>
      <KeyboardAvoidingView>
        <View style={styles.container}>
          <ScrollView>{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    // backgroundColor: theme.background,
    minHeight: '100%',
    padding: 20,
  },
  backgroundImage: { width: '100%', height: '100%', resizeMode: 'cover', position: 'absolute' },
});
export default ScreenWrapper;
