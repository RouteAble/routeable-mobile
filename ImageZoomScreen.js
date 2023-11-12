import React, { useState, useRef } from 'react';
import { View, Image, FlatList, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

function ImageZoomScreen({ route, navigation }) {
  const { images, index } = route.params;
  const [currentIndex, setCurrentIndex] = useState(index);
  const flatListRef = useRef(null);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const onGestureEvent = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      const { velocityX } = nativeEvent;
      if (velocityX > 0) {
        handlePrevious();
      } else if (velocityX < 0) {
        handleNext();
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        activeOffsetX={[-20, 20]}
        failOffsetY={[-20, 20]}
      >
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={{ uri: item }}
                  style={{ width: '80%', height: '80%', resizeMode: 'contain' }}
                />
              </View>
            )}
            initialScrollIndex={index}
            getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
            onScrollToIndexFailed={(info) => {
              const wait = new Promise((resolve) => {
                setTimeout(resolve, 500);
              });
              wait.then(() => {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
              });
            }}
          />
        </View>
      </PanGestureHandler>
    </View>
  );
}

export default ImageZoomScreen;
