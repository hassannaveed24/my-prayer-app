import React, { useRef, useState } from 'react';
import {
  Text,
  StyleSheet,
  ToastAndroid,
  View,
  TextInput,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Dimensions,
  Keyboard,
} from 'react-native';
import { useFormik } from 'formik';
import Icon from 'react-native-vector-icons/Ionicons';

import ScreenWrapper from '../../components/screenWrapper/ScreenWrapper';
import theme from '../../constants/theme';
import { useMutation } from 'react-query';
import SelectMasjidModal from './SelectMasjidModal';
import { database, authentication } from '../../database/firebaseDB';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
// import { useSelector } from 'react-redux';

const mutationFn = payload => {
  return new Promise((resolve, reject) => {
    createUserWithEmailAndPassword(authentication, payload.email, payload.password)
      .then(userCredentials => {
        setDoc(doc(database, 'users', userCredentials.user.uid), {
          name: payload.name,
          email: userCredentials.user.email,
          masjid: payload.masjid,
        })
          .then(() => {
            resolve();
          })
          .catch(err => reject(err));
      })
      .catch(err => {
        reject(err);
      });
  });
};

const Signup = () => {
  // const loggedinUser = useSelector(store => store.auth.user);
  const [isPasswordHide, setIsPasswordHide] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectMasjidModalVisible, setSelectMasjidModalVisible] = useState(false);

  const mutation = useMutation(
    mutationFn,
    {
      onSuccess: res => {},
      onError: err => {
        ToastAndroid.show(err.message, ToastAndroid.SHORT);
      },
    },
    { retry: false },
  );

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', masjid: '' },
    onSubmit: async values => {
      mutation.mutate(values);
    },
  });
  const passwordInputRef = useRef();
  const emailInputRef = useRef();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Title */}
        <View style={styles.title1View}>
          <Text style={styles.title1}>Imam</Text>
        </View>

        {/* NAME */}

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
            onSubmitEditing={() => emailInputRef.current.focus()}
          />
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
            ref={ref => (emailInputRef.current = ref)}
          />
        </View>

        {/* Password */}

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
            returnKeyType="done"
            textContentType="newPassword"
            value={formik.values.password}
            onChangeText={text => {
              formik.setFieldValue('password', text);
            }}
            onSubmitEditing={() => {
              // console.log('in end editing');
              Keyboard.dismiss;
            }}
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

        {/* Select Masjid Button */}
        <TouchableWithoutFeedback
          onPress={() => {
            setSelectMasjidModalVisible(true);
          }}>
          <View style={styles.selectMasjidButtonView}>
            <Text style={styles.signupButtonText}>select masjid</Text>
          </View>
        </TouchableWithoutFeedback>
        <SelectMasjidModal
          selectMasjidModalVisible={selectMasjidModalVisible}
          setSelectMasjidModalVisible={setSelectMasjidModalVisible}
          formik={formik}
        />
        <View style={styles.masjidView}>
          <Text style={styles.title2}>
            {formik.values.masjid?.title && ` ${formik.values.masjid.title}`}
          </Text>
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
            <Text style={styles.signupButtonText}>Sign up</Text>
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
export default Signup;
