import React, { useRef, useState } from 'react';
import {
  Text,
  StyleSheet,
  ToastAndroid,
  View,
  TextInput,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { useFormik } from 'formik';
import Icon from 'react-native-vector-icons/Ionicons';

import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper';
import theme from '../../constants/theme';
import { useMutation } from 'react-query';
import SelectMasjidModal from './SelectMasjidModal';
const Signup = () => {
  // const phoneSelectRef = useRef();
  const [isPasswordHide, setIsPasswordHide] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectMasjidModalVisible, setSelectMasjidModalVisible] = useState(false);

  const mutation = useMutation(
    async payload => {
      // return axios.post(process.env.BASE_URL + '/employees/login', payload);
    },
    {
      onSuccess: res => {
        // if (res.data.isPasswordSet === true) {
        //   setNavigation({ ...navigation, navigation: 'main', data: res.data });
        // } else {
        //   setPasswordModalVisible(true);
        //   setNavigation({ ...navigation, data: res.data });
        // }
      },
      onError: err => {
        // showToast(err.response.data.data || err);
        // setNavigation({ navigation: 'login', data: {} });
      },
    },
    { retry: false },
  );

  const formik = useFormik({
    initialValues: { email: '', password: '', name: '' },
    onSubmit: async values => {
      // auth()
      //   .signInWithPhoneNumber('+' + phoneSelectRef.current.getCallingCode() + values.phoneNumber)
      //   .then(confirmation => {
      //     context.setConfirmation(confirmation);
      //     navigation.navigate('OtpInput');
      //   })
      //   .catch(err => {
      //     ToastAndroid.show(err, ToastAndroid.LONG);
      //   });
    },
  });
  const passwordInputRef = useRef();

  return (
    <ScreenWrapper>
      {/* <Text style={styles.headingText}>Enter your number</Text> */}
      {/* <PhoneInput
        ref={r => {
          phoneSelectRef.current = r;
        }}
        // placeholder="345678901"
        DefaultValue={formik.values.phoneNumber}
        value={formik.values.phoneNumber}
        defaultCode="PK"
        style={styles.phoneInput}
        containerStyle={styles.phoneInputContainer}
        textContainerStyle={styles.phoneInputTextContainer}
        codeTextStyle={styles.phoneInputCodeText}
        textInputStyle={styles.phoneInputTextInput}
      /> */}
      <View>
        <View style={styles.inputView}>
          <TextInput
            style={styles.textInput}
            placeholderTextColor={theme.placeholder}
            blurOnSubmit={false}
            placeholder="Full Name"
            // autoCompleteType=""

            returnKeyType="next"
            textContentType="name"
            onChangeText={text => {
              formik.setFieldValue('name', text);
            }}
            value={formik.values.name}
            // onSubmitEditing={() => passwordInputRef.current.focus()}
          />
        </View>
      </View>
      <View>
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
      </View>
      <View>
        <View style={styles.inputView}>
          <TextInput
            style={styles.textInput}
            ref={ref => (passwordInputRef.current = ref)}
            placeholderTextColor={theme.placeholder}
            blurOnSubmit={false}
            placeholder="Password"
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

      {/* Select Masjid Button */}
      <TouchableWithoutFeedback
        onPress={() => {
          setSelectMasjidModalVisible(true);
        }}>
        <View style={styles.signupButtonView}>
          <Text style={styles.signupButtonText}>select masjid</Text>
        </View>
      </TouchableWithoutFeedback>
      <SelectMasjidModal
        selectMasjidModalVisible={selectMasjidModalVisible}
        setSelectMasjidModalVisible={setSelectMasjidModalVisible}
      />
      {/* Signup Button */}
      <TouchableWithoutFeedback
        onPress={() => {
          formik.handleSubmit();
        }}>
        <View style={styles.signupButtonView}>
          {mutation.isLoading || loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.signupButtonText}>Signup</Text>
          )}
        </View>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
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
    backgroundColor: 'aqua',
    height: 56,
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.borderRadius,
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
  signupButtonView: {
    height: 40,
    width: '100%',
    backgroundColor: theme.button,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius,
  },
  signupButtonText: {
    textTransform: 'uppercase',
    color: theme.buttonText,
  },
});
export default Signup;
