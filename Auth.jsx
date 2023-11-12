import React, { useState } from 'react';
import { Alert, StyleSheet, View, Image } from 'react-native';
import { supabase } from './lib/supabase'
import { Button, Input } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import axios from 'axios';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation(); // Initialize useNavigation

  async function signInWithEmail() {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    await supabase.auth.getSession();
    if (error) {
      Alert.alert(error.message);
    } else {
      // Redirect to the "Home" screen on successful sign-in
      const apiURL = `${process.env.EXPO_PUBLIC_BACKEND_BASE_URI}/maps/init`;
          supabase.auth.getUser().then((res) => {
              const userId = res.data.user.id;
              axios.post(apiURL, {
                      userId: userId
              }).then((res) => {
                  console.log(res.data);
              })
              setLoading(false);
              navigation.navigate('Home', {userId}, navigation)
          });

    }
  }

  async function signUpWithEmail() {
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    if (!session) Alert.alert('Please check your inbox for email verification!');
  }

  return (
    <View style={styles.container}>
    <Image
        source={require('./assets/white-logo-removebg-preview.png')} // Provide the correct path to your image
        style={styles.logo}
    />

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    padding: 12,
    alignItems: 'center',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  logo: {
    marginTop: 0,
    width: 200, // Adjust the width as needed
    height: 200, // Adjust the height as needed
    marginBottom: 0, // Add margin at the bottom to space it from other elements
  },
});
