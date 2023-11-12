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
import { View } from 'react-native';

const Stack = createStackNavigator();

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
                  {/* You can customize the headerLeft icon or component here */}
                </View>
              );
            },
          })}
        />
        <Stack.Screen name="Detail" component={DetailScreen} />
        <Stack.Screen name="ImageZoom" component={ImageZoomScreen} />
        <Stack.Screen name="ErgoWallet" component={ErgoWalletScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;