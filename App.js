import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import DetailScreen from './DetailScreen';
import ImageZoomScreen from './ImageZoomScreen';
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
      <Stack.Navigator initialRouteName={session && session.user ?  (console.log("aaa"), 'Home') : (console.log("auth"), 'Auth')} >
        <Stack.Screen name="Auth" component={Auth} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
        <Stack.Screen name="ImageZoom" component={ImageZoomScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
