import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { authService } from './src/services/authService';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    verifyStoredSession();
  }, []);

  const verifyStoredSession = async () => {
    console.log('🔍 Verificando sesión...');
    try {
      const token = await authService.getToken();
      console.log('📦 Token:', token ? 'Sí' : 'No');
      if (token) {
        const isValid = await authService.validateToken(token);
        if (isValid) {
          setIsAuthenticated(true);
          console.log('✅ Sesión válida');
        } else {
          await authService.logout();
          setIsAuthenticated(false);
          console.log('⚠️ Token inválido');
        }
      } else {
        setIsAuthenticated(false);
        console.log('ℹ️ No hay sesión');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1A3C6E" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerShown: true, title: 'Pagar Pasaje' }} />
            <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: true, title: 'Historial de Viajes' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
