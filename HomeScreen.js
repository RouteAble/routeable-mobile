import React, {useEffect, useState} from 'react';
import {Button, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Modal from 'react-native-modal';
import {createClient} from "@supabase/supabase-js";
import {FontAwesome5} from '@expo/vector-icons';


function HomeScreen({ route, navigation }) {
    const { userId } = route.params;
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState(null);
    const [pins, setPins] = useState([]);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [locations, setLocations] = useState([]);
    const [searchLocation, setSearchLocation] = useState(null);
    const [searchAddress, setSearchAddress] = useState(null);
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
          pin.id = index;
        });


        return data;
    }

    useEffect(() => {
        getPins().then(pins => {
            setLocations(pins)
        })

        Location.requestForegroundPermissionsAsync().then(({status}) => {
            if(status){
                // filterLocationsByTags(); // Filter locations based on selected tags
                Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Lowest, // Set lower accuracy for less accurate location
                }).then((userLocation) => {
                    setLocation(userLocation);
                    setSearchLocation(userLocation);
                    const { latitude, longitude } = userLocation.coords;

                    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY; // Replace with your API key

                    axios.get(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
                    ).then((res) => {
                        const { results } = res.data;
                        if (results.length > 0) {
                            const formattedAddress = results[0].formatted_address;
                            setAddress(formattedAddress);
                            setSearchAddress(formattedAddress);
                        }

                    })

                });
            }
        })
    }, [])

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter((selectedTag) => selectedTag !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const clearAllTags = () => {
        setSelectedTags([]); // Clear all selected tags
        // setLocations([]); // Clear the filtered locations
        setFilterModalVisible(false); // Close the filter modal
        setSearchAddress(address); // Clear the address
        setSearchLocation(location); // Clear the location
        filterLocationsByTags(); // Filter locations based on selected tags
    };

    const filterLocationsByTags = () => {
        // Filter locations based on selected tags
        console.log(selectedTags)
        const filteredLocations = [];
        setFilterModalVisible(false); // Close the filter modal

        // setLocations(filteredLocations);
    };

    const convertLocation = (location) => {
        return {
            latitude: location.latitude,
            longitude: location.longitude,
            id: location.id,
            imageB64: location.imageB64,
            ramps: location.ramps,
            stairs: location.stairs,
            guard_rails: location.guard_rails
        };
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
                return results[0].formatted_address;
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
        latitude: 41.882350, // Set the latitude for UMass Amherst
        longitude: -87.637670, // Set the longitude for UMass Amherst
        latitudeDelta: 0.015, // Adjust these values based on your desired view
        longitudeDelta: 0.015,
    };

    // const locations = [
    //     {
    //         id: 0,
    //         longitude: -72.52526,
    //         latitude: 42.39094,
    //     }
    // ]

    return (
        <View style={styles.container}>
            {location && searchLocation && (
                <MapView
                    style={styles.map}
                    region={customRegion}
                >
                    <Marker
                        coordinate={{
                            latitude: searchLocation.coords.latitude ? searchLocation.coords.latitude : 0,
                            longitude: searchLocation.coords.longitude ? searchLocation.coords.longitude : 0,
                        }}
                        title={searchLocation === location ? "Your Location" : "Search Location"}
                        onPress={() => handleMarkerPress({latitude: searchLocation.coords.latitude, longitude: searchLocation.coords.longitude, id: -1, imageB64: null, ramps: false, stairs: false, guard_rails: false})}
                    />

                    {locations.filter(item => item.latitude && item.longitude).map((item) => (
                        <Marker
                            key={item.id}
                            coordinate={{
                                latitude: item.latitude,
                                longitude: item.longitude,
                            }}
                            title="Filtered Location"
                            onPress={() => handleMarkerPress(item)}
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

            {location && (<TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                    console.log(location)
                    console.log(location.coords)
                    console.log(location.coords.longitude)
                    return navigation.navigate('Detail', {
                        address,
                        location_object: {latitude: location.coords.latitude, longitude: location.coords.longitude, id: -1, imageB64: "", ramps: false, stairs: false, guard_rails: false},
                        userId: userId,
                        isCurrentLocation: true,
                    }, navigation)
                }}
            >
                <Text style={styles.addButtonText}>
                    <FontAwesome5 name="plus" size={24} color="white" />
                </Text>
            </TouchableOpacity>)}

            <TouchableOpacity
                style={styles.ergoWalletButton}
                onPress={() =>
                    navigation.navigate('ErgoWallet', {
                        walletAddress: 'Your Wallet Address',
                        mnemonic: 'Your Mnemonic',
                        userId: userId
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