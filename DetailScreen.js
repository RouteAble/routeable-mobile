import React, {useEffect, useState} from 'react';
import {Dimensions, FlatList, Image, Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Modal from 'react-native-modal';
import {Camera} from 'expo-camera'; // Import Camera from Expo
import * as FileSystem from 'expo-file-system';
import axios from "axios";


function DetailScreen({ route, navigation }) {
    const { address, location, userId, isCurrentLocation } = route.params;
    const [images, setImages] = useState([]);
    const [image, setImage] = useState(null);
    const [imageB64, setImageB64] = useState(null);
    const [tags, setTags] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [wasSuccessful, setWasSuccessful] = useState(null);
    const [isSeeMore, setIsSeeMore] = useState(false);
    const [isEditingTags, setIsEditingTags] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const availableTags = ["Stairs", "Ramps", "Guard Rails", "Asphalt", "Concrete"];
    const [cameraVisible, setCameraVisible] = useState(false);
    const [camera, setCamera] = useState(null);
  
    const toggleSeeMore = () => {
      setIsSeeMore(!isSeeMore);
    };
  
    const handleTagEdit = () => {



      setIsEditingTags(!isEditingTags);
    };
  
    const handleTagSelection = (tag) => {
      if (selectedTags.includes(tag)) {
        setSelectedTags(selectedTags.filter((selectedTag) => selectedTag !== tag));
      } else {
        setSelectedTags([...selectedTags, tag]);
      }
    };

    const handleTagSave = () => {
      setTags(selectedTags);
      setIsEditingTags(false);
    };


    
    const takePicture = async () => {
        if (camera) {
          const photo = await camera.takePictureAsync();
          const base64Image = await convertImageToBase64(photo.uri);
          setImage(photo.uri);
          setImageB64(base64Image);
          setCameraVisible(false);
        }
      };

      const convertImageToBase64 = async (imageUri) => {
        try {
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          return base64;
        } catch (error) {
          console.error('Error converting image to base64:', error);
          return null;
        }
      };
      
  
    useEffect(() => {
      // Simulate fetching tags from a database or any other source
      // Replace this with actual logic to fetch tags for the location
      const fetchTags = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        try {
        // Sample tags for demonstration, you should replace this with actual data retrieval logic
        const sampleTags = location.tags ? location.tags : [];
        setSelectedTags(sampleTags);
        setTags(sampleTags);
        } catch (error) {
        console.error('Error fetching tags:', error);
        setTags([]); // Handle error by setting default value
        }
    };
        
  
        const fetchImages = async (imageUrls) => {
        const imagePromises = imageUrls.map(async (imageUrl) => {
          try {
            const response = await fetch(imageUrl);
            if (response.ok) {
              const blob = await response.blob();
              const imageURL = URL.createObjectURL(blob);
              return imageURL;
            } else {
              return null;
            }
          } catch (error) {
            return null;
          }
        });
      
        const imageResults = await Promise.all(imagePromises);
        setImages(imageResults.filter((imageUrl) => imageUrl !== null));
      };
      fetchTags();
      if (location.images && location.images.length > 0) {
        fetchImages(location.images);
      }
    }, [location.images]);
  
      
  
    const handleSubmit = async () => {
      // Perform the submission logic here, e.g., an API call
      // For demonstration purposes, we'll just set a flag to indicate submission

      const apiURI = `${process.env.EXPO_PUBLIC_BACKEND_BASE_URI}/maps/checkImage`

      const checkImageBody = {
        'base64Image': imageB64
      }

      try{
        const res = await axios.post(apiURI, checkImageBody);
        const shaExists = res.data.message;
        if(!shaExists){
          const subApi = `${process.env.EXPO_PUBLIC_BACKEND_BASE_URI}/maps/submission`
          const body = {
            "image": imageB64,
            "long": location.coords.longitude,
            "lat": location.coords.latitude,
            "userId": userId
          }
          const subRes = await axios.post(subApi, body);
          const success = subRes.data.message;
          if(success){
            setIsSubmitted(true);
            setWasSuccessful(true);
          } else {
            console.log("too similar")
            setIsSubmitted(true);
            setWasSuccessful(false);
          }
        } else {
          console.log("sha exists")
          setIsSubmitted(true);
          setWasSuccessful(false);
        }
      } catch (e){
        console.log(e.message);
      }
    };
  
    const imagesToDisplay = isSeeMore ? images : images.slice(0, 3);
    
  
    return (
      <View style={styles.container}>
        {address ? (
          <Text style={styles.detailText}>Address: {address}</Text>
        ) : (
          <Text style={styles.detailText}>
            Address: ({location.coords.latitude}, {location.coords.longitude})
          </Text>
        )}
        <View style={styles.tagsContainer}>
    {tags.length > 0 && !isEditingTags ? (
      tags.map((tag, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleTagSelection(tag)}
          style={[
            styles.tag,
            selectedTags.includes(tag) && styles.selectedTag,
            isEditingTags && selectedTags.includes(tag) && styles.isEditingTags,
          ]}
        >
          <Text style={styles.tagText}>{tag}</Text>
        </TouchableOpacity>
      ))
    ) : (
      !isEditingTags && selectedTags.length > 0 && (
        <View>
          {/* Render nothing when there are no tags */}
        </View>
      )
    )}
    {isEditingTags && (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditingTags}
        onRequestClose={() => {
          setIsEditingTags(!isEditingTags);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.instructionsText}>
              Select all that apply:
            </Text>
            {availableTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => handleTagSelection(tag)}
                style={[
                  styles.tag,
                  selectedTags.includes(tag) && styles.selectedTag,
                  selectedTags.includes(tag) && styles.editingTag,
                ]}
              >
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
            <Pressable
              style={[styles.tag, styles.saveTag]}
              onPress={handleTagSave}
            >
              <Text style={styles.tagText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    )}
  </View>
  
  
        {isCurrentLocation &&
        (<TouchableOpacity style={styles.editTagsButton} onPress={handleTagEdit}>
          <Text style={styles.editTagsButtonText}>Edit Tags</Text>
        </TouchableOpacity>
        )}
  
        {imagesToDisplay.length > 0 ? (
          <View style={[styles.imageContainer, imagesToDisplay.length > 3 && !isSeeMore && { flex:1, alignItems: 'center' }]}>
            <FlatList
              data={imagesToDisplay}
              keyExtractor={(item, index) => index.toString()}
              horizontal={false} // Set horizontal to false to make it a vertical scroll
              numColumns={3} // Display images in three columns
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('ImageZoom', {images, index}, navigation )
                  }
                >
                  <Image source={{ uri: item }} style={[styles.imagePreview]} />
                </TouchableOpacity>
              )}
            />
            {images.length > 3 && !isSeeMore && (
              <TouchableOpacity style={styles.seeMoreButton} onPress={toggleSeeMore}>
                <Text style={styles.seeMoreText}>See More</Text>
              </TouchableOpacity>
            )}
            {isSeeMore && (
              <TouchableOpacity style={styles.seeMoreButton} onPress={toggleSeeMore}>
                <Text style={styles.seeMoreText}>See Less</Text>
              </TouchableOpacity>
            )}
          </View>
        )  : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.emptyText}>There are no images or tags for this location currently. {"\n"}{"\n"}</Text>
          </View>
        )}

        {isCurrentLocation && (
        <TouchableOpacity style={styles.imageButton} onPress={() => setCameraVisible(true)}>
          <Text style={styles.imageButtonText}>Take Picture</Text>
        </TouchableOpacity>
      )}

        <View style={styles.imageCenterContainer}>
          {image && (
            <Image source={{ uri: image }} style={styles.centeredImage} />
          )}
        </View>
        {image && (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        )}
        {isSubmitted && image && wasSuccessful ? (
          <Text style={styles.confirmationText}>Request submitted successfully!</Text>
        ): null}
        {isSubmitted && image && !wasSuccessful ? (
          <Text style={styles.rejectText}>Similar image already exists</Text>
        ): null}
        <Modal
        isVisible={cameraVisible}
        style={styles.cameraModal}
      >
        <Camera
          ref={(ref) => setCamera(ref)}
          style={styles.cameraPreview}
        >
          <View style={styles.cameraButtonsContainer}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setCameraVisible(false)}
            >
              <Text style={styles.cameraButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={takePicture}
            >
              <Text style={styles.cameraButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </Modal>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10
    },
    detailText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: 8,
    },
    tag: {
      backgroundColor: 'lightblue',
      borderRadius: 16,
      paddingVertical: 4,
      paddingHorizontal: 12,
      margin: 4,
    },
    tagText: {
      color: 'white',
      fontSize: 14,
    },
    detailText: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      padding: 10,
    },  
    imageButton: {
      marginTop: 10,
      backgroundColor: '#3498db',
      borderRadius: 10,
      padding: 10,
      alignItems: 'center',
    },
    imageButtonText: {
      color: 'white',
      fontSize: 16,
    },
    submitButton: {
      marginTop: 10,
      backgroundColor: '#2ecc71',
      borderRadius: 10,
      padding: 10,
      alignItems: 'center',
    },
    submitButtonText: {
      color: 'white',
      fontSize: 16,
    },
    confirmationText: {
      marginTop: 10,
      fontSize: 16,
      color: '#2ecc71',
      textAlign: 'center',
    },
    rejectText: {
        marginTop: 10,
        fontSize: 16,
        color: '#e74c3c',
        textAlign: 'center',
    },
    imageContainer: {
      marginVertical: 10,
      alignItems: 'center',
    },
    imagePreview: {
      width: 125,
      height: 125,
      alignItems: 'center',
      justifyContent: 'center',
    },
    seeMoreButton: {
      backgroundColor: 'lightgray',
      padding: 10,
      borderRadius: 5,
      alignSelf: 'flex-start',
    },
    seeMoreText: {
      fontSize: 14,
    },
    emptyText: {
      fontSize: 16,
      fontStyle: 'italic',
    },
    instructionsText: {
      marginBottom: 10,
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },
    modalView: {
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 35,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    editTagsButton: {
      marginTop: 10,
      backgroundColor: '#2196F3',
      padding: 10,
      borderRadius: 5,
    },
    editTagsButtonText: {
      color: 'white',
      textAlign: 'center',
    },
    saveTag: {
      backgroundColor: 'green',
    },
    selectedTag: {
      backgroundColor: 'lightblue',
    },
    editingTag: {
      backgroundColor: 'green',
    },  imageCenterContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    centeredImage: {
      width: 200, // Adjust the width as needed
      height: 200, // Adjust the height as needed
    },
    cameraModal: {
    flex: 1,
    alignItems: 'center',
    },
    cameraPreview: {
    flex: 1,
    aspectRatio: 1, // Maintain a 1:1 aspect ratio (a square)
    justifyContent: 'flex-end',
    alignItems: 'center',
    maxHeight: Math.min(Dimensions.get('window').height, Dimensions.get('window').width),
    },      
    cameraButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    },
    cameraButton: {
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
    padding: 10,
    },
    cameraButtonText: {
    color: 'black',
    fontSize: 16,
    }
  
  });  


export default DetailScreen;

