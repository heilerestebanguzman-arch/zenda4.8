import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { ServiceSelector } from '../components/ServiceSelector';
import { BottomNavBar } from '../components/BottomNavBar';
import { authService } from '../services/authService';
import { useAppState, VehicleType } from '../hooks/useAppState';
import { fareService } from '../services/fareService';
import SOSButton from '../components/SOSButton';
import RatingModal from '../components/RatingModal';

const { width, height } = Dimensions.get('window');
const API_MOBILITY = 'http://:8103/api/v1/mobility';
const OSRM_API = 'https://router.project-osrm.org/route/v1/driving';

const ALL_VEHICLES = [
  { id: '1', plate: 'MOTO-001', lat: -17.5080, lng: -63.1650, type: 'MOTO', status: 'available' },
  { id: '2', plate: 'MOTO-002', lat: -17.5105, lng: -63.1665, type: 'MOTO', status: 'available' },
  { id: '3', plate: 'MOTO-003', lat: -17.5075, lng: -63.1630, type: 'MOTO', status: 'available' },
  { id: '4', plate: 'TAXI-001', lat: -17.5090, lng: -63.1620, type: 'TAXI', status: 'available' },
  { id: '5', plate: 'TAXI-002', lat: -17.5110, lng: -63.1640, type: 'TAXI', status: 'available' },
  { id: '6', plate: 'MINIBUS-001', lat: -17.5060, lng: -63.1670, type: 'MINIBUS', status: 'available' },
];

export default function HomeScreen({ navigation, route }: any) {
  const { 
    state, 
    selectedService, 
    setSelectedService, 
    goToTripSetup, 
    goToTripActive, 
    goToDiscovery,
    resetAll 
  } = useAppState('discovery');
  
  const [location, setLocation] = useState<any>(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedServiceLabel, setSelectedServiceLabel] = useState('Moto');
  const [mapOpacity, setMapOpacity] = useState(0.15);
  const [isSelectingOrigin, setIsSelectingOrigin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [destinationCoords, setDestinationCoords] = useState<any>(null);
  const [originCoords, setOriginCoords] = useState<any>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const [loadingText, setLoadingText] = useState('Solicitando...');
  const [bottomNavAnim] = useState(new Animated.Value(0));
  const mapRef = useRef<any>(null);
  const [user, setUser] = useState<any>(null);
  const [estimatedFare, setEstimatedFare] = useState<number>(0);
  const [fareDetails, setFareDetails] = useState<any>(null);
  const [isCalculatingFare, setIsCalculatingFare] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTripId, setRatingTripId] = useState('');

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      Animated.timing(bottomNavAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(bottomNavAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  const getFilteredVehicles = () => {
    if (selectedService === 'ALL' || state === 'discovery') {
      return ALL_VEHICLES;
    }
    return ALL_VEHICLES.filter(v => v.type === selectedService);
  };

  const vehicles = getFilteredVehicles();

  useEffect(() => {
    const params = route?.params || {};
    if (params.origin) setOrigin(params.origin);
    if (params.destination) setDestination(params.destination);
  }, [route]);

  useEffect(() => {
    const init = async () => {
      const userData = await authService.getUser();
      setUser(userData);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso de ubicación denegado');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setOriginCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setTimeout(() => setMapOpacity(0.15), 500);
    };
    init();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: state === 'trip_active' ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [state]);

  useEffect(() => {
    if (state === 'trip_setup') {
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [state]);

  useEffect(() => {
    if (originCoords && destinationCoords && state === 'trip_setup') {
      calculateFare();
    }
  }, [originCoords, destinationCoords, selectedService, state]);

  const calculateFare = async () => {
  if (!originCoords || !destinationCoords) {
    console.log("⏳ Esperando coordenadas...");
    return;
  }
  if (!originCoords || !destinationCoords) {
    console.log("⏳ Esperando coordenadas...");
    return;
  }
    setIsCalculatingFare(true);
    try {
      const fare = await fareService.calculateFare(
        originCoords.latitude,
        originCoords.longitude,
        destinationCoords.latitude,
        destinationCoords.longitude,
        selectedService
      );
      if (fare) {
        setEstimatedFare(fare.totalFare);
        setFareDetails(fare);
      }
    } catch (error) {
      console.error('Error calculando tarifa:', error);
    } finally {
      setIsCalculatingFare(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`
      );
      if (response.data && response.data.display_name) {
        return response.data.display_name.split(',')[0];
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const fetchRoute = async (originLat: number, originLng: number, destLat: number, destLng: number) => {
    try {
      const url = `${OSRM_API}/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
      const response = await axios.get(url);
      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const coordinates = response.data.routes[0].geometry.coordinates;
        const routePoints = coordinates.map((coord: any) => ({ latitude: coord[1], longitude: coord[0] }));
        setRouteCoords(routePoints);
        setShowRoute(true);
      }
    } catch (error) {
      setRouteCoords([
        { latitude: originLat, longitude: originLng },
        { latitude: destLat, longitude: destLng }
      ]);
      setShowRoute(true);
    }
  };

  const handleServiceSelect = (service: any) => {
    setSelectedService(service.id.toUpperCase() as VehicleType);
    setSelectedServiceLabel(service.label);
    setMapOpacity(0.15);
    goToTripSetup();
  };

  const handleMapPress = async (event: any) => {
    if (state === 'trip_active') return;
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMapOpacity(0.15);
    if (isSelectingOrigin) {
      const address = await reverseGeocode(latitude, longitude);
      setOrigin(address);
      setOriginCoords({ latitude, longitude });
      Alert.alert('📍 Origen seleccionado', `Has seleccionado:\n${address}`);
    } else {
      const address = await reverseGeocode(latitude, longitude);
      setDestination(address);
      setDestinationCoords({ latitude, longitude });
      if (originCoords) {
        await fetchRoute(originCoords.latitude, originCoords.longitude, latitude, longitude);
        await calculateFare();
      }
      Alert.alert('📍 Destino seleccionado', `Has seleccionado:\n${address}`);
    }
    Keyboard.dismiss();
  };

  const handleSearchFocus = () => {
    setMapOpacity(0.15);
    if (mapRef.current && location) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 500);
    }
  };

  const handleDestinationChange = async (text: string) => {
    setDestination(text);
    setMapOpacity(0.15);
    if (text.length > 3 && originCoords) {
      const mockCoords = { latitude: -17.5100, longitude: -63.1600 };
      setDestinationCoords(mockCoords);
      await fetchRoute(originCoords.latitude, originCoords.longitude, mockCoords.latitude, mockCoords.longitude);
      await calculateFare();
    }
  };

  const requestTrip = async () => {
    if (!destinationCoords) {
      Alert.alert('⚠️ Destino no seleccionado', 'Por favor, selecciona un destino en el mapa.');
      return;
    }
    if (!location) {
      Alert.alert('⚠️ Ubicación no disponible', 'No se pudo obtener tu ubicación. Verifica el GPS.');
      return;
    }
    if (estimatedFare === 0) {
      Alert.alert('⚠️ Calculando tarifa', 'Espera un momento mientras calculamos la tarifa estimada.');
      return;
    }

    setLoading(true);
    setLoadingText('Conectando con conductores cercanos...');

    try {
      const token = await authService.getToken();
      const vehicleType = selectedService;
      const payload = {
        userId: user?.id || 'pasajero-test',
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        destination: destination || `Destino: ${destinationCoords.latitude.toFixed(4)}, ${destinationCoords.longitude.toFixed(4)}`,
        destinationLat: destinationCoords.latitude,
        destinationLng: destinationCoords.longitude,
        vehicleType: vehicleType,
        estimatedFare: estimatedFare,
      };

      setLoadingText('Confirmando viaje...');

      const response = await axios.post(`${API_MOBILITY}/request`, payload, {
        timeout: 10000,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data.success) {
        const tripData = response.data.data || response.data;
        const trip = {
          tripId: tripData.trip_id || tripData.id,
          plate: tripData.vehicle?.plate || tripData.plate || 'MOTO-001',
          driver: tripData.driver?.name || tripData.driverName || 'Conductor',
          eta: tripData.eta || tripData.estimated_wait || 4,
          status: tripData.status || 'pending',
          fare: tripData.fare || estimatedFare,
          origin: origin,
          destination: destination,
          vehicle: tripData.vehicle?.plate || tripData.plate || 'MOTO-001',
        };
        setCurrentTrip(trip);
        goToTripActive();

        Alert.alert(
          '✅ Viaje Confirmado',
          `🚗 Vehículo: ${trip.plate}\n` +
          `👤 Conductor: ${trip.driver}\n` +
          `⏱️ Llegada estimada: ${trip.eta} min\n` +
          `💰 Tarifa: Bs ${trip.fare?.toFixed(2) || estimatedFare.toFixed(2)}`
        );
      } else {
        Alert.alert('❌ Error', response.data.message || 'No se pudo confirmar el viaje.');
      }
    } catch (error: any) {
      console.error('Error en requestTrip:', error);
      Alert.alert(
        '❌ Error',
        error.response?.data?.message || 'No se pudo conectar con el servidor de movilidad.'
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelTrip = () => {
    Alert.alert(
      '⚠️ Cancelar Viaje',
      '¿Estás seguro de que deseas cancelar el viaje?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          onPress: () => {
            setCurrentTrip(null);
            resetAll();
            Alert.alert('✅ Viaje cancelado', 'Tu viaje ha sido cancelado exitosamente.');
          },
          style: 'destructive'
        }
      ]
    );
  };

  const openRatingModal = () => {
    if (currentTrip?.tripId) {
      setRatingTripId(currentTrip.tripId);
      setShowRatingModal(true);
    } else {
      Alert.alert('⚠️ Error', 'No se pudo identificar el viaje para calificar.');
    }
  };

  const completeTrip = () => {
    Alert.alert(
      '✅ Finalizar Viaje',
      '¿Ya has llegado a tu destino?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, finalizar',
          onPress: () => {
            openRatingModal();
          }
        }
      ]
    );
  };

  const handleRatingClose = () => {
    setShowRatingModal(false);
    setRatingTripId('');
    resetAll();
    setCurrentTrip(null);
  };

  const handleRatingSuccess = () => {
    setShowRatingModal(false);
    setRatingTripId('');
    resetAll();
    setCurrentTrip(null);
    Alert.alert('✅ ¡Gracias!', 'Tu calificación ha sido guardada.');
  };

  const centerMapOnUser = () => {
    if (!location) return;
    setMapOpacity(0.15);
    mapRef.current?.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 500);
  };

  const handleNavSelect = (id: string) => {
    if (id === 'home') {
      resetAll();
      navigation.navigate('Home');
    } else if (id === 'history') {
      navigation.navigate('History');
    } else if (id === 'profile') {
      navigation.navigate('Profile');
    }
  };

  const goBackToDiscovery = () => {
    goToDiscovery();
    setOrigin('');
    setDestination('');
    setDestinationCoords(null);
    setShowRoute(false);
    setRouteCoords([]);
    setFareDetails(null);
    setEstimatedFare(0);
  };

  const goToPayment = () => {
    if (currentTrip) {
      navigation.navigate('Payment', {
        tripData: {
          id: currentTrip.tripId,
          origin: origin,
          destination: destination,
          vehicle: currentTrip.plate,
          fare: currentTrip.fare || estimatedFare,
        }
      });
    }
  };

  const formatCurrency = (amount: number): string => {
    return `Bs ${amount.toFixed(2)}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: location?.coords?.latitude || -17.5005,
            longitude: location?.coords?.longitude || -63.1660,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          onPress={handleMapPress}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Mi ubicación"
              pinColor="#1A3C6E"
            />
          )}
          {destinationCoords && (
            <Marker
              coordinate={destinationCoords}
              title={destination}
              pinColor="#F5A623"
            />
          )}
          {showRoute && routeCoords.length > 1 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#1A3C6E"
              strokeWidth={3}
            />
          )}
          {vehicles.map((vehicle) => (
            <Marker
              key={vehicle.id}
              coordinate={{ latitude: vehicle.lat, longitude: vehicle.lng }}
              title={vehicle.plate}
              description={`${vehicle.type} - ${vehicle.status}`}
            >
              <View style={[
                styles.vehicleMarker,
                vehicle.type === 'MOTO' && styles.vehicleMarkerMoto,
                vehicle.type === 'TAXI' && styles.vehicleMarkerTaxi,
                vehicle.type === 'MINIBUS' && styles.vehicleMarkerMinibus,
              ]}>
                <Text style={styles.vehicleMarkerText}>
                  {vehicle.type === 'MOTO' ? '🛵' : vehicle.type === 'TAXI' ? '🚖' : '🚌'}
                </Text>
              </View>
            </Marker>
          ))}
        </MapView>
        <View style={[styles.mapOverlay, { opacity: mapOpacity }]} />
        <TouchableOpacity style={styles.centerBtn} onPress={centerMapOnUser}>
          <Ionicons name="locate-outline" size={24} color="#1A3C6E" />
        </TouchableOpacity>
      </View>

      <View style={styles.headerFloating}>
        <View style={styles.headerLeft}>
          {state !== 'discovery' && (
            <TouchableOpacity onPress={goBackToDiscovery} style={styles.backBtn}>
              <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
              <Text style={styles.backText}>Volver</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, state !== 'discovery' && styles.headerTitleWithBack]}>ZENDA</Text>
        </View>
        <View style={styles.headerRight}>
          {state === 'trip_active' && (
            <View style={styles.tripBadge}>
              <Text style={styles.tripBadgeText}>🛵 {selectedServiceLabel}</Text>
            </View>
          )}
          <SOSButton showLabel={false} />
        </View>
      </View>

      {state === 'discovery' && (
        <Animated.View style={[styles.serviceSelectorContainer, { opacity: fadeAnim }]}>
          <ServiceSelector selectedId={selectedService.toLowerCase()} onSelect={handleServiceSelect} />
        </Animated.View>
      )}

      {state === 'trip_setup' && (
        <Animated.View style={[
          styles.searchFloating,
          {
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-80, 0],
              })
            }],
            opacity: slideAnim,
          }
        ]}>
          <View style={[styles.searchContainer, isSelectingOrigin && styles.searchContainerActive]}>
            <Ionicons name="location-outline" size={20} color="#1A3C6E" />
            <TextInput
              style={styles.searchInput}
              placeholder="¿Desde dónde?"
              placeholderTextColor="#94A3B8"
              value={origin}
              onChangeText={setOrigin}
              onFocus={() => { setIsSelectingOrigin(true); handleSearchFocus(); }}
            />
          </View>
          <View style={[styles.searchContainer, { marginTop: 8 }, !isSelectingOrigin && styles.searchContainerActive]}>
            <Ionicons name="navigate-outline" size={20} color="#2ECC71" />
            <TextInput
              style={styles.searchInput}
              placeholder="¿A dónde vas? (toca el mapa)"
              placeholderTextColor="#94A3B8"
              value={destination}
              onChangeText={handleDestinationChange}
              onFocus={() => { setIsSelectingOrigin(false); handleSearchFocus(); }}
            />
          </View>
          <TouchableOpacity onPress={goBackToDiscovery} style={styles.modalityBadge}>
            <Text style={styles.modalityBadgeText}>
              🛵 {selectedServiceLabel} • Cambiar
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {state === 'trip_active' && currentTrip && (
        <View style={styles.tripCard}>
          <View style={styles.tripHeader}>
            <Text style={styles.tripTitle}>🏍️ Viaje en curso</Text>
            <Text style={styles.tripStatus}>En camino</Text>
          </View>
          <View style={styles.tripContent}>
            <Text style={styles.tripText}>🚗 Vehículo: {currentTrip.plate}</Text>
            <Text style={styles.tripText}>👤 Conductor: {currentTrip.driver}</Text>
            <Text style={styles.tripText}>⏱️ Llegada: {currentTrip.eta} min</Text>
            <Text style={styles.tripText}>💰 Tarifa: {formatCurrency(currentTrip.fare || estimatedFare)}</Text>
          </View>
          <View style={styles.tripActions}>
            <TouchableOpacity style={styles.paymentBtn} onPress={goToPayment}>
              <Text style={styles.paymentBtnText}>💳 Pagar ahora</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.completeBtn} onPress={completeTrip}>
              <Text style={styles.completeBtnText}>✅ Finalizar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtnSmall} onPress={cancelTrip}>
              <Text style={styles.cancelTextSmall}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {state === 'trip_setup' && (
        <TouchableOpacity 
          style={[styles.requestBtn, loading && styles.requestBtnDisabled]} 
          onPress={requestTrip} 
          disabled={loading || isCalculatingFare}
        >
          {loading ? (
            <View style={styles.requestBtnContent}>
              <ActivityIndicator color="white" size="small" />
              <Text style={[styles.requestBtnText, { fontSize: 15 }]}>{loadingText}</Text>
            </View>
          ) : (
            <View style={styles.requestBtnContent}>
              <Text style={styles.requestBtnText}>🛵 Solicitar {selectedServiceLabel}</Text>
              {isCalculatingFare ? (
                <View style={styles.requestSubContainer}>
                  <ActivityIndicator size="small" color="rgba(255,255,255,0.8)" />
                  <Text style={styles.requestSubText}>Calculando tarifa...</Text>
                </View>
              ) : fareDetails && estimatedFare > 0 ? (
                <Text style={styles.requestSubText}>
                  {fareDetails.distanceKm} km • {fareDetails.durationMin} min • {formatCurrency(estimatedFare)}
                </Text>
              ) : (
                <Text style={styles.requestSubText}>Selecciona origen y destino</Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      )}

      <Animated.View style={[
        styles.bottomNavContainer,
        {
          transform: [{
            translateY: bottomNavAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 100],
            })
          }],
          opacity: bottomNavAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }),
        }
      ]}>
        <BottomNavBar active="home" onSelect={handleNavSelect} />
      </Animated.View>

      <RatingModal
        visible={showRatingModal}
        tripId={ratingTripId}
        onClose={handleRatingClose}
        onSuccess={handleRatingSuccess}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  mapContainer: { ...StyleSheet.absoluteFillObject },
  map: { ...StyleSheet.absoluteFillObject },
  mapOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.15)', pointerEvents: 'none' },
  centerBtn: { 
    position: 'absolute', 
    bottom: 180, 
    right: 20, 
    backgroundColor: 'white', 
    padding: 12, 
    borderRadius: 30, 
    elevation: 6, 
    zIndex: 20 
  },
  
  headerFloating: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 1 },
  headerTitleWithBack: { marginLeft: 4 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  tripBadge: { backgroundColor: '#1A3C6E', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  tripBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  
  serviceSelectorContainer: { 
    position: 'absolute', 
    bottom: 180, 
    left: 12, 
    right: 12, 
    zIndex: 10 
  },
  
  searchFloating: { 
    position: 'absolute', 
    top: Platform.OS === 'ios' ? 120 : 100, 
    left: 12, 
    right: 12, 
    zIndex: 10 
  },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.95)', 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    paddingVertical: 4, 
    elevation: 6, 
    borderWidth: 2, 
    borderColor: 'transparent' 
  },
  searchContainerActive: { borderColor: '#2ECC71' },
  searchInput: { 
    flex: 1, 
    paddingVertical: 14, 
    fontSize: 16, 
    color: '#1E293B', 
    marginLeft: 10 
  },
  modalityBadge: { 
    alignSelf: 'center', 
    marginTop: 12, 
    backgroundColor: 'rgba(26, 60, 110, 0.85)', 
    paddingHorizontal: 16, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  modalityBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  
  requestBtn: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: '#1A3C6E',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#1A3C6E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    zIndex: 10,
  },
  requestBtnDisabled: { opacity: 0.7 },
  requestBtnContent: { alignItems: 'center' },
  requestBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 17, letterSpacing: 0.5 },
  requestSubContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  requestSubText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  
  tripCard: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    elevation: 8,
    zIndex: 10,
  },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  tripTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A3C6E' },
  tripStatus: { fontSize: 14, color: '#2ECC71' },
  tripContent: { gap: 4 },
  tripText: { fontSize: 14, color: '#1E293B' },
  tripActions: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' },
  paymentBtn: { flex: 2, backgroundColor: '#2ECC71', padding: 10, borderRadius: 8, alignItems: 'center' },
  paymentBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
  completeBtn: { flex: 1, backgroundColor: '#1A3C6E', padding: 10, borderRadius: 8, alignItems: 'center' },
  completeBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  cancelBtnSmall: { backgroundColor: '#FEE2E2', padding: 10, borderRadius: 8, width: 44, alignItems: 'center' },
  cancelTextSmall: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 },
  
  vehicleMarker: { borderRadius: 15, padding: 5, borderWidth: 2, borderColor: 'white' },
  vehicleMarkerMoto: { backgroundColor: '#2ECC71' },
  vehicleMarkerTaxi: { backgroundColor: '#F5A623' },
  vehicleMarkerMinibus: { backgroundColor: '#1A3C6E' },
  vehicleMarkerText: { fontSize: 16 },
  
  bottomNavContainer: { 
    position: 'absolute', 
    bottom: Platform.OS === 'ios' ? 30 : 10, 
    left: 16, 
    right: 16, 
    zIndex: 10 
  },
});
