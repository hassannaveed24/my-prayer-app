import { StatusBar, Button } from "expo-status-bar";
import React from "react";
import { StyleSheet,Text,View,SafeAreaView } from "react-native";
import MapView from 'react-native-maps';
import { PROVIDER_GOOGLE } from "react-native-maps";
import prayer from './prayer';


export default function Maps({navigation}){
  return (
<SafeAreaView style={styles.container}>  
        
      <MapView style={{height:'100%', width:'100%'}}
      provider={PROVIDER_GOOGLE}
      showsUserLocation={true}></MapView>
    
    </SafeAreaView>

)
}
const styles= StyleSheet.create({
 container:{
    flex:1,
    backgroundColor:'#fff',
    alignItems:'center',
    justifyContent:'center'
  }
})