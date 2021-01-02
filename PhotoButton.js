// A custom button for the bottomnavigator, to make it more sexy
import React from 'react'
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, TouchableHighlight, Animated } from 'react-native'
import { FontAwesome5, FontAwesome, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const {width,height} = Dimensions.get('window')

export default class PhotoButton extends React.Component {
  mode = new Animated.Value(0);
  constructor(props) {
    super(props);
  }

  hapticFeedBack = () => {
    const feedback = Haptics.ImpactFeedbackStyle.Medium
    Haptics.impactAsync(feedback)
  }

  handlePress = () => {
    this.hapticFeedBack()
    Animated.sequence([
        Animated.timing(this.mode, {
            toValue: this.mode._value === 0 ? 1 : 0,
            useNativeDriver: false,
            duration: 100
        }),
    ]).start();
  };

  render(){

    const rotation = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "90deg"]
    });

    const rotation2 = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: ["90deg", "0deg"]
    });

    const iconOpacity = this.mode.interpolate({
     inputRange: [0, 1],
     outputRange: [1, 0]
     });

     const iconOpacity2 = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
      });

    const modalY = this.mode.interpolate({
     inputRange: [0, 1],
     outputRange: [0, 100]
    });

    const modalX = this.mode.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 70]
       });

    const modalOpacity = this.mode.interpolate({
     inputRange: [0, 1],
     outputRange: [0, 1]
     });

    return(
      <View style={{}}>
        <Animated.View
          useNativeDriver={true}
          style={[styles.modal, {bottom: modalY, right: modalX, opacity: modalOpacity}]}>

            <TouchableOpacity
                activeOpacity={.5}
                onPress={() => {
                    this.hapticFeedBack()
                    this.props.handleCamera('camera_roll')
                    setTimeout(() => {this.handlePress()}, 1000)
                }}
                style={{width: "100%", height: '100%', justifyContent: 'center', alignItems: 'center'}}
                underlayColor="transparent">
                    <FontAwesome name="photo" size={36} color="black"/>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          useNativeDriver={true}
          style={[styles.modal, {bottom: modalY, left: modalX, opacity: modalOpacity}]}>
            <TouchableOpacity
            activeOpacity={.5}
            onPress={() => {
                this.hapticFeedBack()
                this.props.handleCamera('camera')
                setTimeout(() => {this.handlePress()}, 1000)
            }}
            style={{width: "100%", height: '100%', justifyContent: 'center', alignItems: 'center'}}
            underlayColor="transparent">
                <FontAwesome5 name="camera" size={36} color="black"/>
          </TouchableOpacity>
        </Animated.View>


        <Animated.View
          useNativeDriver={true}
          style={styles.button}>

          <TouchableOpacity
            activeOpacity={.9}
            onPress={this.handlePress}
            style={{width: "100%", height: '100%', justifyContent: 'center', alignItems: 'center'}}
            underlayColor="transparent">

              <Animated.View
                  useNativeDriver={true}
                  style={{ transform: [{ rotate: rotation }], opacity: iconOpacity, position: 'absolute'}}>
                  <FontAwesome5 name="camera" size={36} color="black"/>
              </Animated.View>

              <Animated.View
                  useNativeDriver={true}
                  style={{ transform: [{ rotate: rotation2 }], opacity: iconOpacity2, position: 'absolute'}}>
                  <MaterialIcons name="close" size={36} color="black"/>
              </Animated.View>

          </TouchableOpacity>

        </Animated.View>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  rowWrap:{
    flexDirection: 'row',
    justifyContent: 'center',
    // alignItems: 'center'
  },
  mealWrapper:{
    // justifyContent: 'center',
    // alignItems: 'center'
  },
  image:{
    width: 80,
    height: 80
  },
  mealTitle:{
    fontSize: 18,
    color: "#fff",
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center'
  },
  button:{
    backgroundColor: '#e94560',
    width: 80,
    height: 80,
    borderRadius: 200,
    shadowRadius: 5,
    shadowOffset: {height:5},
    shadowOpacity: 0.3,
  },
  modal: {
    backgroundColor: '#ec5c73',
    width: 70,
    height: 70,
    borderRadius: 200,
    position: "absolute"
  }
})
