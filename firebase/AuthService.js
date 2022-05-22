import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

class AuthService {
  static async signup({ email, password }) {
    const auth = getAuth();
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
    }
  }
}

export default AuthService;
