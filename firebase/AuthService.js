import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

class AuthService {
  static async signup({ email, password }) {
    const auth = getAuth();
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      console.log(response.user);
    } catch (error) {
      console.error(error);
    }
  }
}

export default AuthService;
