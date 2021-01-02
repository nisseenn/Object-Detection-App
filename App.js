import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, FlatList, View, Dimensions, Image, ActivityIndicator } from 'react-native';
import * as tf from '@tensorflow/tfjs'
import { fetch } from '@tensorflow/tfjs-react-native'
import Canvas from 'react-native-canvas';
import * as Animatable from 'react-native-animatable';

import * as mobilenet from '@tensorflow-models/mobilenet'
import * as cocoSsd from "@tensorflow-models/coco-ssd";

import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'
import { FontAwesome5 } from '@expo/vector-icons';
import * as jpeg from 'jpeg-js'
import * as ImagePicker from 'expo-image-picker'
import { Svg, Path } from 'react-native-svg';
import PhotoButton from './PhotoButton'
import { log } from '@tensorflow/tfjs';

const { width, height } = Dimensions.get("window");

console.disableYellowBox = true;
  
export default function App() {
  const [isModelReady, setModelReady] = useState(false)
  const [predictions, setPredictions] = useState(null)
  const [imageUser, setImageUser] = useState(null)
  const [isLoading, setLoading] = useState(false)
  const [isPredicting, setPredicting] = useState(false)
  const [scalingFactor, setScalingFactor] = useState(null)

  const COLORS = ["#fff", "#ff0000", "#ffff00", "#008000"]

  const getTfReady = async() => {
    setLoading(true)
    await tf.ready()
    setModelReady(true)
    await setTimeout(() => {
      setTimeout(() => {
        setLoading(false)
      }, 2600) 
    }, 1600)
  }

  const getCameraPermission = async() => {
    const result = await Permissions.askAsync(Permissions.CAMERA)
    if (result.status !== 'granted') {
      Alert.alert("Need permissions to take photo", [{text: 'Okay'}])
      return false;
    }
    return true
  }

  const getRollPermission = async() => {
    const result = await Permissions.askAsync(Permissions.CAMERA_ROLL)
    if (result.status != "granted") {
      Alert.alert("Need permissions to camera roll", [{text: 'Okay'}])
      return false;
    }
    return true
  }
  
  const takeImageHandler = async(type) => {
    if(predictions !== null){
      setPredictions(null)
    }
    let image;
    if(type === 'camera'){
      const hasPermission = await getCameraPermission()
      if(!hasPermission) {
        return;
      }
      image = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5
      });
    }
    else if(type === 'camera_roll'){
      const hasRollPermission = await getRollPermission()
      if(!hasRollPermission) {
        return;
      }
      image = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });
    }

    if (!image.cancelled) {
      Image.getSize(image.uri, (width, height) => {
        let widthFactor = 300 / width
        let heighFactor = 300 / height
        // setImageSize({width: width, height: height})
        setScalingFactor({width: widthFactor, height: heighFactor})
      })
      setPredicting(true)
      setImageUser(image.uri)
      const model = await cocoSsd.load()
      classifyImage(image.uri, model)
    }
  }

  const imageToTensor = (rawImageData) => {
    const TO_UINT8ARRAY = true
    const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY)
    // Drop the alpha channel info for mobilenet
    const buffer = new Uint8Array(width * height * 3)
    let offset = 0 // offset into original data
    for (let i = 0; i < buffer.length; i += 3) {
      buffer[i] = data[offset]
      buffer[i + 1] = data[offset + 1]
      buffer[i + 2] = data[offset + 2]

      offset += 4
    }
    return tf.tensor3d(buffer, [height, width, 3])
  }

  const classifyImage = async(imgUri, model) => {
    try {
      const response = await fetch(imgUri, {}, { isBinary: true })
      const rawImageData = await response.arrayBuffer()
      const imageTensor = imageToTensor(rawImageData)
      const predictions = await model.detect(imageTensor)
      setPredictions(predictions)
      setPredicting(false)
      tf.dispose()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getTfReady()
  }, [])

  return (
    <View style={styles.container}>
    {/* {isPredicting ? (
      <View style={{width: '100%'}}>
        <Animatable.View 
          animation="pulse" 
          duration={800}
          easing="ease-in-out-sine" 
          iterationCount="infinite" 
          style={styles.topBall}></Animatable.View>
        <Animatable.View 
          animation="pulse" 
          delay={100}
          duration={800}
          easing="ease-in-out-sine" 
          iterationCount="infinite" 
          style={styles.topBall2}></Animatable.View>
        <Animatable.View 
          animation="pulse" 
          delay={200}
          duration={800}
          easing="ease-in-out-sine" 
          iterationCount="infinite" 
          style={styles.topBall3}></Animatable.View>

      </View>
    ) : (
      <View style={{width: '100%'}}>
        <View
          style={styles.topBall}></View>
        <View 
          style={styles.topBall2}></View>
        <View 
          style={styles.topBall3}></View>
      </View>
    )} */}

    <View style={{width: '100%'}}>
        <View
          style={styles.topBall}></View>
        <View 
          style={styles.topBall2}></View>
        <View 
          style={styles.topBall3}></View>
      </View>

        {isLoading ? (
            <View style={{width: '100%'}}>
              <Animatable.View 
                animation="pulse" 
                duration={800}
                easing="ease-in-out-sine" 
                iterationCount="infinite" 
                style={styles.topBall}></Animatable.View>
              <Animatable.View 
                animation="pulse" 
                delay={100}
                duration={800}
                easing="ease-in-out-sine" 
                iterationCount="infinite" 
                style={styles.topBall2}></Animatable.View>
              <Animatable.View 
                animation="pulse" 
                delay={200}
                duration={800}
                easing="ease-in-out-sine" 
                iterationCount="infinite" 
                style={styles.topBall3}></Animatable.View>
            <View style={{width: '100%', height: '100%', justifyContent: "center", alignItems: "center"}}>
              <Animatable.Text 
                    animation="fadeIn" 
                    duration={500}
                    style={styles.text}>Loading model...
                </Animatable.Text>
            </View>
          </View>
          ) : (
            <View style={{flex:1, width: '100%'}}>
              {imageUser ? (
                  <View style={styles.imageWrapper}>
                      <Image source={{uri: imageUser}} style={styles.imageContainer} />
                  </View>
              ) : (
              <View style={{flex:1, justifyContent: "center", alignItems: "center"}}>
                <Animatable.Text 
                  animation="fadeIn"
                  duration={500}
                  style={styles.text}>Choose image to classify
                </Animatable.Text>
              </View>
              )}
            </View>
          )}
      
      {predictions ? (predictions.map((item,index) => {
        const left = item.bbox[0] * scalingFactor.width
        const top = item.bbox[1] * scalingFactor.height
        const widthBox = item.bbox[2] * scalingFactor.width
        const heightBox = item.bbox[3] * scalingFactor.height

        const randNumber = Math.floor(Math.random() * 5);
        const colorBbox = COLORS[randNumber]

        const percent = item.score.toFixed(2) * 100
        
        return(
          <View style={styles.bboxWrap}>
            <View style={{
              position:"absolute", 
              left: left, 
              top: top, 
              width: widthBox, 
              height: heightBox, 
              // backgroundColor: 'rgba(255,255,255,0.4)',
              borderColor: colorBbox,
              borderWidth: 1
              }}>
            <View style={{flexDirection: "row", backgroundColor: 'rgba(255,255,255,0.6)', alignItems: "center"}}>
              <Text style={{textTransform: 'capitalize', marginHorizontal: 5, fontSize: 12, fontWeight: '400'}}>{item.class}</Text>
              <Text style={{fontWeight: "400", fontSize: 12}}>{percent.toFixed(0)}%</Text>
            </View>
            </View>
          </View>
        )

      })) : <View></View>}

      {isPredicting ? (
        <View style={styles.predictionWrapper}>
          <Text 
          style={styles.text}>
            Predicting...
          </Text>
      </View>
      ) : (
        <View />
      )}

      <View style={styles.buttonWrap}>
        <PhotoButton handleCamera={(type) => {
          takeImageHandler(type)
        }}/>
      </View>

      <View 
        style={styles.buttonPulse}/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    // justifyContent: 'center',
  },
  topBall:{
    width: '100%',
    height: height / 3,
    backgroundColor: 'rgba(22,33,62,.5)',
    position: "absolute",
    top: -height / 12,
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
    shadowColor: "#1a1a2e",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: .7,
    shadowRadius: 0.2,
    elevation: 5,
  },
  topBall2:{
    width: '100%',
    height: height / 3,
    backgroundColor: 'rgba(15,52,96,.4)',
    position: "absolute",
    top: -height / 7,
    borderBottomLeftRadius: 500,
    borderBottomRightRadius: 500,
    shadowColor: "#1a1a2e",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: .7,
    shadowRadius: 0.2,
    elevation: 5,
  },
  topBall3:{
    width: '100%',
    height: height / 1.9,
    backgroundColor: 'rgba(87,112,143,.2)',
    position: "absolute",
    top: -height / 2.5,
    borderBottomLeftRadius: 900,
    borderBottomRightRadius: 900,
    shadowColor: "#1a1a2e",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: .7,
    shadowRadius: 0.2,
    elevation: 5,
  },
  buttonWrap:{
    position: "absolute",
    zIndex: 1000,
    bottom: 50
  },
  imageContainer: {
    width: 300,
    height: 300,
  },
  imageWrapper:{
    width: '100%',
    height: '100%',
    position: "absolute", 
    top: 270, 
    left: 40
  },
  cameraButton:{
    backgroundColor: '#e94560',
    width: width / 5,
    borderRadius: 300,
    justifyContent: "center",
    alignItems: "center",
    height: width / 5,
    position: "absolute",
    bottom: 40,
    shadowColor: "#1a1a2e",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 0.2,
    elevation: 5,
  },
  listWrapper:{
    width: '100%',
    position: "absolute",
    bottom: 0,
  },
  flatList:{
    height: height,
    width: width
  },
  text:{
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    margin: 10
  },
  bboxWrap:{
    position: "absolute",
    left: 40,
    top: 270,
    zIndex: 70000,
  },
  predictionWrapper:{
    position: "absolute",
    bottom: 150,
  },
  predWrap: {
    // backgroundColor: 'blue'
  },
  className:{
    fontSize: 16,
    color: '#fff',
  },
  probability:{
    fontSize: 14,
    color: '#fff',
  },
  buttonPulse:{
    backgroundColor: 'rgba(244,162,175,0.5)',
    width: width / 4.3,
    borderRadius: 300,
    justifyContent: "center",
    alignItems: "center",
    height: width / 4.3,
    position: "absolute",
    bottom: 46.5,
    zIndex: 200
  }
});
