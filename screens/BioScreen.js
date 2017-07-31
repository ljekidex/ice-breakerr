import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Image, Dimensions } from 'react-native';
import { ExpoLinksView } from '@expo/samples';

import * as FirebaseAPI from '../modules/firebaseAPI'

const {height, width} = Dimensions.get('window');

export default class LinksScreen extends React.Component {
  static navigationOptions = {
    title: 'People Near You',
    headerLeft: null,
    gesturesEnabled: false,
  };

  componentWillMount() {
      this.state = {
        user: this.props.screenProps.user, 
        profiles: [],
      }

      FirebaseAPI.getAllUsers((users) => {
        //Filter out the current user from the other individuals
        this.setState({profiles: users.filter((user) => {
          return user.uid != this.state.user.uid 
        })})
      })
  }

  componentDidUpdate() {
    setTimeout(() => {
      FirebaseAPI.getAllUsers((users) => {
        //Filter out the current user from the other individuals
        this.setState({profiles: users.filter((user) => {
          return user.uid != this.state.user.uid 
        })})
      })
    }, 500)
  }

  showProfile(profile) {
    this.props.navigation.navigate('Profile', {profile: profile, user: this.state.user})
  }

  getFbImageUrl(profile) {
    const fbImageUrl = `https://graph.facebook.com/${profile.id}/picture?height=${height}`
    return fbImageUrl
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
        {
          this.state.profiles.map((profile) => {
            return (
              <TouchableOpacity onPress={() => {this.showProfile(profile)}}
              key={profile.uid+"-touchable"} >
                <View style={styles.match}  key={profile.uid+"-container"}>
                  <View style={styles.shadow} key={profile.uid+"-shadow"}>
                    <View style={styles.headerContainer}>
                      <Text style={styles.name}>{profile.name.split(' ')[0]}</Text>
                      <Text style={styles.age}>23 years old</Text>
                      <Text style={styles.subtitle}>Work info goes here...</Text>
                    </View>
                    <Text style={styles.bio}>{profile.bio}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        }
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    color: '#2B2B2B',
    fontSize: 18,
    marginTop: 15,
    textAlign: 'left',
  },
  match: {
    width: width,
    justifyContent: 'center', 
    alignItems: 'center',
    paddingBottom: 20,
  },
  shadow: {
    shadowColor: '#000000', 
    shadowOffset: {width: 0, height: 0}, 
    shadowRadius: 7, 
    shadowOpacity: 0.3,
    borderWidth: 1,
    borderColor: 'lightgrey'
  },
  bio: {
    flex: 1,
    width: width,
    alignSelf: 'flex-start',
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize:18,
    color: '#565656',
    textAlign: 'left',
    backgroundColor: 'white',
  },
  headerContainer: {
    paddingTop: 5,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor:'white',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  name: {
    color: '#2B2B2B',
    fontSize: 24,
    marginTop: 5,
    marginBottom: 1,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  age: {
    color: '#2B2B2B',
    textAlign: 'left',
    fontSize: 16,
    marginTop: 2,
    marginBottom: 3,
    color: 'gray',
  },
});