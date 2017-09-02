import React from 'react';
import Swiper from 'react-native-swiper'
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Image, Dimensions, InteractionManager, Alert } from 'react-native';
import { ExpoLinksView } from '@expo/samples';

import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import BioScreen from '../screens/BioScreen';

import * as FirebaseAPI from '../modules/firebaseAPI'

const {height, width} = Dimensions.get('window');

export default class IndexScreen extends React.Component {
  static navigationOptions = {
    title: 'Ice Breakerr',
    headerLeft: null,
    gesturesEnabled: false,
  };

  componentWillMount() {
      this.state = {
        user: this.props.screenProps.user, 
        scrollEnabled: true,
      }

      if(!('createdDate' in this.state.user)) {
          const now = new Date();

          InteractionManager.runAfterInteractions(() => {
            FirebaseAPI.updateUser(this.state.user.uid, 'createdDate', now)
          })

          InteractionManager.runAfterInteractions(() => {
            FirebaseAPI.getPhotoUrlsFromFbCb(this.state.user.id, this.state.user.fbAuthToken, (urls) => {
              FirebaseAPI.mergeUserPhotoUrls(this.state.user.uid, urls.slice(0,6))
            })
          })

          InteractionManager.runAfterInteractions(() => {
            FirebaseAPI.getUserCb(this.state.user.uid, (currentUser) => {
              InteractionManager.runAfterInteractions(() => {
                this.setState({user: currentUser})
              })
            })
          })
      }
  }

  componentDidMount() {
    // setTimeout(() => {
    //     Alert.alert(
    //     ('Be sure to create an interesting profile before you message!'),
    //     'Edit your profile now?',
    //     [
    //       {text: 'OK', onPress: () => {
    //         InteractionManager.runAfterInteractions(() => {
    //            this.props.navigation.navigate('Edit', 
    //             {user: this.state.user, cb: (user) => { this.setState({user}) }})
    //         })
    //       }},
    //       {text: 'Cancel', onPress: () => {}, style: 'cancel'},
    //     ],
    //     { cancelable: false }
    //   )}, 4000)
  }

  viewStyle() {
    return {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }
  }

  changeScrollBool(bool) {
    if(bool != this.state.scrollEnabled)
      this.setState({scrollEnabled: bool})
  }

  render() {
    let index = 0;
    if('navigation' in this.props 
      && 'state' in this.props.navigation 
      && 'params' in this.props.navigation.state 
      && 'index' in this.props.navigation.state.params)
      index = this.props.navigation.state.params.index;

    return(
      <Swiper
          horizontal={true}
          loop={false}
          showsPagination={true}
          paginationStyle={{
            height: width/7,
            bottom: 0,
            backgroundColor: '#efefef',
            borderTopWidth: 1,
            borderColor: 'lightgrey',
          }}
          index={index}
          scrollEnabled={this.state.scrollEnabled}>
          <View style={this.viewStyle()}>
            <SettingsScreen screenProps={this.state} navigation={this.props.navigation}/>
          </View>
          <View style={this.viewStyle()}>
            <BioScreen screenProps={this.state} navigation={this.props.navigation}/>
          </View>
          <View style={this.viewStyle()}>
            <HomeScreen scrollBoolCb={(bool) => {this.changeScrollBool(bool)}} screenProps={this.state} navigation={this.props.navigation}/>
          </View>
      </Swiper>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
  view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
