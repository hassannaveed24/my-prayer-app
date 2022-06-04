import { useFormik } from 'formik';
import React, { useRef, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Dimensions,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import { useMutation } from 'react-query';
import Icon from 'react-native-vector-icons/Ionicons';
import { signInWithEmailAndPassword } from 'firebase/auth';

import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper';
import theme from '../../constants/theme';
import { authentication } from '../../database/firebaseDB';

const mutationFn = payload => {
  return new Promise((resolve, reject) => {
    signInWithEmailAndPassword(authentication, payload.email, payload.password)
      .then(userCredentials => {
        resolve(userCredentials);
      })
      .catch(error => reject(error));
  });
};

const Signin = () => {
  const [isPasswordHide, setIsPasswordHide] = useState(true);
  const mutation = useMutation(
    mutationFn,
    {
      onSuccess: res => {},
      onError: err => {
        console.log('error');
        ToastAndroid.show(err.message || 'error', ToastAndroid.SHORT);
      },
    },
    { retry: false },
  );

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', masjid: '' },
    onSubmit: async values => {
      if (mutation.isLoading) return;
      mutation.mutate(values);
    },
  });
  const passwordInputRef = useRef();

  return (
    <>
      <ScreenWrapper>
        <View style={styles.container}>
          {/* Title */}
          <View style={styles.title1View}>
            <Text style={styles.title1}>Imam</Text>
          </View>

          {/* Email */}

          <View style={styles.inputView}>
            <TextInput
              style={styles.textInput}
              placeholderTextColor={theme.placeholder}
              blurOnSubmit={false}
              placeholder="Enter your email.."
              autoCompleteType="email"
              keyboardType="email-address"
              returnKeyType="next"
              textContentType="emailAddress"
              onChangeText={text => {
                formik.setFieldValue('email', text);
              }}
              value={formik.values.email}
              onSubmitEditing={() => passwordInputRef.current.focus()}
            />
          </View>

          {/* Password */}

          <View style={styles.inputView}>
            <TextInput
              style={styles.textInput}
              ref={ref => (passwordInputRef.current = ref)}
              placeholder="Password"
              placeholderTextColor={theme.placeholder}
              autoCapitalize="none"
              secureTextEntry={isPasswordHide}
              autoCorrect={false}
              returnKeyType="send"
              textContentType="newPassword"
              value={formik.values.password}
              onChangeText={text => {
                formik.setFieldValue('password', text);
              }}
              onSubmitEditing={() => formik.handleSubmit()}
            />
            <TouchableWithoutFeedback onPress={() => setIsPasswordHide(!isPasswordHide)}>
              <View style={styles.passwordIconView}>
                <Icon
                  size={26}
                  name={isPasswordHide ? 'eye-off-outline' : 'eye-outline'}
                  color={theme.inputText}
                  style={styles.passwordIcon}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
        {/* Signup Button */}
        <TouchableWithoutFeedback
          onPress={() => {
            formik.handleSubmit();
          }}>
          <View style={styles.signupButtonView}>
            {mutation.isLoading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.signupButtonText}>Sign in</Text>
            )}
          </View>
        </TouchableWithoutFeedback>
      </ScreenWrapper>
    </>
  );
};

const styles = StyleSheet.create({
  headingText: { fontSize: 23, fontWeight: '700', color: theme.title },
  phoneInputContainer: { borderRadius: 10, backgroundColor: theme.background },
  phoneInputTextContainer: { color: theme.textBackground, padding: 0 },
  phoneInputCodeText: {},
  phoneInputTextInput: {},
  phoneInput: {
    // fontSize: 34,
    // color: theme.inputText,
    // fontWeight: 'bold',
    // width: '100%',
  },

  inputView: {
    backgroundColor: 'white',
    height: 56,
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.borderRadius,
    marginBottom: 20,
    // marginBottom: 20,
    // display: 'flex',
    // flexDirection: 'row',
    // alignItems: 'center',
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
  signupButtonView: {
    maxHeight: 40,
    height: 40,
    width: '100%',
    backgroundColor: theme.button,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius,
    position: 'absolute',
    bottom: 100,
    // top: 230,
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
  signupButtonText: {
    textTransform: 'uppercase',
    color: theme.buttonText,
  },
});

export default Signin;
