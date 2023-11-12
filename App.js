import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import DetailScreen from './DetailScreen';
import ImageZoomScreen from './ImageZoomScreen';
import ErgoWalletScreen from './ErgoWalletScreen';
import Auth from './Auth';
import 'react-native-url-polyfill/auto';
import { supabase } from './lib/supabase';
import { Button, View, Image, Text } from 'react-native';


const Stack = createStackNavigator();

const getBalance = () => 0;


const logout = async (navigation) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    // Perform any additional logout-related actions here, such as clearing user data from state.
    console.log('User has been logged out');

    // Navigate to the "Auth" screen after logout
    navigation.navigate('Auth');

  } catch (error) {
    console.error('Error logging out:', error.message);
  }
};

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Auth" component={Auth} />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            headerLeft: () => {
              if (!session) {
                return null; // Hide the back button leading to Auth for logged-out users
              }
              return (
                <View style={{ marginLeft: 10 }}>
                  <Button title="Log Out" onPress={() => logout(navigation)} />
                </View>
              );
            },
            headerRight: () => (
              <View style={{ marginRight: 10, flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('./assets/symbol_bold__1080px__black.png')} // Provide the correct path to your image
                style={{ width: 24, height: 24, tintColor: '#FFC300' }}
              />
                <Text style={{ color: '#FFC300', fontSize: 18, marginLeft: 5, fontWeight: 'bold' }}>{getBalance()}</Text>

              </View>
            ),
          })}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{
            headerRight: () => (
              <View style={{ marginRight: 10, flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('./assets/symbol_bold__1080px__black.png')} // Provide the correct path to your image
                style={{ width: 24, height: 24, tintColor: '#FFC300' }}
              />
                <Text style={{ color: '#FFC300', fontSize: 18, marginLeft: 5, fontWeight: 'bold' }}>{getBalance()}</Text>
              </View>
            ),
          }}
        />
        <Stack.Screen name="ImageZoom" component={ImageZoomScreen} />
        <Stack.Screen name="ErgoWallet" component={ErgoWalletScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;