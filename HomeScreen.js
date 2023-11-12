import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Modal from 'react-native-modal';
import {createClient} from "@supabase/supabase-js";
import { FontAwesome5 } from '@expo/vector-icons';



function HomeScreen({ route, navigation }) {
//    console.log("a", supabase.auth.user);
//    const userId = "292b5c66-2166-42bd-a7c4-058c856e2735";
//    const specificUser = supabase.auth.admin.getUserById(2);
//    console.log("user", specificUser);
    const { userId } = route.params;
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState(null);
    const [pins, setPins] = useState([]);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [locations, setLocations] = useState([]);
    const [searchLocation, setSearchLocation] = useState(null);
    const [searchAddress, setSearchAddress] = useState(null);
    const [mapRegion, setMapRegion] = useState({
        latitude: 42.3868,
        longitude: -72.526711,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });
    // For demonstration, let's assume you have some sample locations with tags

    async function getPins(){
        const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_ADDRESS, process.env.EXPO_PUBLIC_SUPABASE_API_KEY);
        const {data, error} = await supabase.from('Image')
            .select('*')

        if(error){
            console.log("error getting pins");
            return [];
        }

        data.forEach((pin, index) => {
          const { data } = supabase
          .storage
          .from('image')
          .getPublicUrl(`${pin.sha256_hash}.png`)

          pin.imageB64 = data.publicUrl;
          console.log(pin.imageB64);
          pin.id = index;
        });


        return data;
    }

    useEffect(() => {
        (async () => {
            try {

                const data = await getPins();
                setPins(data);
                


                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    return;
                }

                filterLocationsByTags(); // Filter locations based on selected tags
                const userLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Lowest, // Set lower accuracy for less accurate location
                });
                setLocation(userLocation);
                setSearchLocation(userLocation);
                setMapRegion({
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                });

                const { latitude, longitude } = userLocation.coords;
                const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY; // Replace with your API key

                // Make an API call to obtain address information based on the coordinates
                const response = await axios.get(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
                );

                const { results } = response.data;
                if (results.length > 0) {
                    const formattedAddress = results[0].formatted_address;
                    setAddress(formattedAddress);
                    setSearchAddress(formattedAddress);
                }
            } catch (error) {
                console.error('Error fetching location:', error);
            }
        })();
    }, []);

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter((selectedTag) => selectedTag !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const clearAllTags = () => {
        setSelectedTags([]); // Clear all selected tags
        setLocations([]); // Clear the filtered locations
        setFilterModalVisible(false); // Close the filter modal
        setSearchAddress(address); // Clear the address
        setSearchLocation(location); // Clear the location
        filterLocationsByTags(); // Filter locations based on selected tags
    };

    const filterLocationsByTags = () => {
        // Filter locations based on selected tags
        console.log(selectedTags)
        const filteredLocations = pins.filter((location) =>
            selectedTags.length > 0 ? selectedTags.every((tag) => location[tag]) : true
        );
        console.log("actually ran")
        setFilterModalVisible(false); // Close the filter modal

        setLocations(filteredLocations);
    };

    const convertLocation = (location) => {
        converted = {latitude: location.latitude, longitude: location.longitude, id: location.id, imageB64: location.imageB64, ramps: location.ramps, stairs: location.stairs, guard_rails: location.guard_rails};
        return converted;
    }

    const handleMarkerPress = async (selectedLocation) => {
        selectedLocation = convertLocation(selectedLocation);
        if (selectedLocation && selectedLocation.latitude && selectedLocation.longitude) {
            const address = await convertCoordinatesToAddress(
                selectedLocation.latitude,
                selectedLocation.longitude
            );
            if (address) {
                navigation.navigate('Detail', { location_object: selectedLocation, address:address, userId: userId }, navigation);
            }
        }
    };

    const convertCoordinatesToAddress = async (latitude, longitude) => {
        try {
            const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY; // Replace with your API key

            // Make an API call to obtain address information based on the coordinates
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
            );

            const { results } = response.data;
            if (results.length > 0) {
                const formattedAddress = results[0].formatted_address;
                return formattedAddress;
            } else {
                console.error('Address not found for the coordinates:', latitude, longitude);
                return null;
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            return null;
        }
    };

    const handleSearch = async (data, details = null) => {
        const { description } = data;
        if (details && details.geometry && details.geometry.location) {
            const { location } = details.geometry;
            setSearchAddress(description);
            setSearchLocation({ coords: { latitude: searchLocation.lat, longitude: searchLocation.lng } });
        } else {
            // Handle the case when location information is not available in details
            console.log('Location data not available in details, trying to fetch it separately...');

            // Fetch location data separately using the place_id
            const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY
            const placeId = data.place_id;
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apiKey}`
            );

            if (response.data.result && response.data.result.geometry) {
                const { location } = response.data.result.geometry;
                setSearchAddress(description);
                setSearchLocation({ coords: { latitude: location.lat, longitude: location.lng } });
            } else {
                // Handle the case when location data is still not available
                console.error('Location data could not be retrieved for the selected place.');
            }
        }
    };

    const customRegion = {
        latitude: 42.3915, // Set the latitude for UMass Amherst
        longitude: -72.5281, // Set the longitude for UMass Amherst
        latitudeDelta: 0.015, // Adjust these values based on your desired view
        longitudeDelta: 0.015,
    };

    return (
        <View style={styles.container}>
            {location && searchLocation && (
                <MapView
                    style={styles.map}
                    region={customRegion}
                >
                    <Marker
                        coordinate={{
                            latitude: searchLocation.coords.latitude,
                            longitude: searchLocation.coords.longitude,
                        }}
                        title={searchLocation === location ? "Your Location" : "Search Location"}
                        onPress={() => handleMarkerPress({latitude: searchLocation.coords.latitude, longitude: searchLocation.coords.longitude, id: -1, imageB64: null, ramps: false, stairs: false, guard_rails: false})}
                    />

                    {locations.map((filteredLocation) => (
                        <Marker
                            key={filteredLocation.id}
                            coordinate={{
                                latitude: filteredLocation.latitude,
                                longitude: filteredLocation.longitude,
                            }}
                            title="Filtered Location"
                            onPress={() => handleMarkerPress(filteredLocation)}
                        />
                    ))}
                </MapView>
            )}


            <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setFilterModalVisible(true)}
            >
                <FontAwesome5 name="filter" size={24} color="white" />
            </TouchableOpacity>


            <GooglePlacesAutocomplete
                placeholder="Search for a location"
                onPress={handleSearch}
                query={{
                    key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
                    language: 'en',
                }}
            />


            <Modal
                animationType="slide"
                transparent={true}
                visible={filterModalVisible}
            >
                <View style={styles.filterModal}>
                    <Text style={styles.filterTitle}>Filter by Tags:</Text>
                    <TouchableOpacity
                        style={[
                            styles.filterTag,
                            selectedTags.includes('Stairs') && styles.selectedTag,
                        ]}
                        onPress={() => toggleTag('Stairs')}
                    >
                        <Text style={styles.filterTagText}>Stairs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterTag,
                            selectedTags.includes('Ramps') && styles.selectedTag,
                        ]}
                        onPress={() => toggleTag('Ramps')}
                    >
                        <Text style={styles.filterTagText}>Ramps</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterTag,
                            selectedTags.includes('Guard Rails') && styles.selectedTag,
                        ]}
                        onPress={() => toggleTag('Guard Rails')}
                    >
                        <Text style={styles.filterTagText}>Guard Rails</Text>
                    </TouchableOpacity>
                    <Button title="Apply Filters" onPress={() => filterLocationsByTags()} />
                    <Button title="Clear All" onPress={() => (clearAllTags())} />

                    <Button title="Close" onPress={() => setFilterModalVisible(false)} />
                </View>
            </Modal>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                    return navigation.navigate('Detail', {
                        address,
                        location_object: {latitude: location.latitude, longitude: location.longitude, id: -1, imageB64: "", ramps: false, stairs: false, guard_rails: false},
                        userId: userId,
                        isCurrentLocation: true,
                    }, navigation)
                }}
            >
                <Text style={styles.addButtonText}>
                    <FontAwesome5 name="plus" size={24} color="white" />
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.ergoWalletButton}
                onPress={() =>
                    navigation.navigate('ErgoWallet', {
                        walletAddress: 'Your Wallet Address',
                        mnemonic: 'Your Mnemonic',
                    })
                }
            >
                <FontAwesome5 name="wallet" size={24} color="white" />
            </TouchableOpacity>


        </View>

    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10
    },
    tag: {
        backgroundColor: 'lightblue',
        borderRadius: 16,
        paddingVertical: 4,
        paddingHorizontal: 12,
        margin: 4,
    },
    searchBar: {
        position: 'absolute',
        top: 10,
        width: '100%',
    },
    map: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
    },
    filterButton: {
        position: 'absolute',
        top: 60,
        right: 10,
        backgroundColor: '#3498db',
        borderRadius: 50,
        padding: 10,
    },
    filterButtonText: {
        color: 'white',
        fontSize: 16,
    },
    filterModal: {
        margin: 30,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#F2DED9',
    },
    filterTitle: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    filterTag: {
        padding: 10,
        margin: 5,
        borderWidth: 1,
        borderColor: 'lightgray',
        borderRadius: 5,
        marginLeft: 10,
        marginRight: 10,
    },
    selectedTag: {
        backgroundColor: 'lightblue',
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#3498db',
        borderRadius: 50,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontSize: 24,
    },
    selectedTag: {
        backgroundColor: 'lightblue',
    },
    ergoWalletButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: '#3498db', // Button background color
        borderRadius: 50, // Make it circular
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterTagText: {
        textAlign: 'center',
    },

});
export default HomeScreen;