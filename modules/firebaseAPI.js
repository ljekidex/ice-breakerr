import * as firebase from 'firebase'
import GeoFire from 'geofire'
import * as _ from 'lodash'
import Exponent from 'expo'
import { Alert, } from 'react-native'

// export const loginUser = (accessToken) => {
//     const provider = firebase.auth.FacebookAuthProvider //declare fb provider
//     const credential = provider.credential(accessToken) //generate fb credential

//     return firebase.auth().signInWithCredential(credential) // signin to firebase using facebook credential
// }

export const login = (email, password, cb = () => {}) => {
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((data) => {
      getUserCb(data.uid, (user) => cb(user))
    })
    .catch((error) => logError(error));
}

const logError = (error) => {
  if (error.code === 'auth/wrong-password')
    alert('Wrong password.');
  else
    alert(error.message);
}

export const createUser = () => {
  const email = 'hays@gmail.com'
  const password = 'smokey28'

  firebase.auth().createUserWithEmailAndPassword(email, password)
  .then((user) => {
    var user = firebase.auth().currentUser;

    mergeUser(user.uid, token, response.json())
      .then(() => console.log('New user merge success'), () => this.showError('Could not add you to database'))

    // console.log('USER CREATED SUCCESSFULLY. HERE IS THE DATA: ', user)
  })
  .catch((error) => {
    console.log(error)
  });
}

export const logoutUser = () => {
  return firebase.auth().signOut()
}

export const createNewStatus = (uid, status, location, func) => {

}

export const getRecentStatuses = (func) => {

}

export const getImgurClientId = (func) => {
  firebase.database().ref().once("value").then((snap) => {
    func(snap.val().imgurClientId)
  })
}

export const getImgurGifs = (searchTerm, func) => {
  getImgurClientId((imgurClientId) => {
    let request = {
        method: 'GET',
        headers: {
            'Authorization': 'Client-ID ' + imgurClientId
        }  
    }  

    if(searchTerm == null) {
      searchOptions = ['art', 'super', 'cowboy', 'funny', 'spooky', 'cute', 'psychedelic', 'freak', 'rawr', 'games']

      searchTerm = searchOptions[Math.floor(Math.random() * 10)] //Random index from 0 to 9
    }


    fetch('https://api.imgur.com/3/gallery/search/viral/?q='+searchTerm+'&q_type=anigif&q_size_px=small', request).then((response) => {
      response.json().then((res) => {
        gifUrls = res.data.filter((item) => {
          return item.size <= 1500000
        }).map((item) => {
            return item.link;
        })

        gifUrls.length = 12

        func(gifUrls)
      })
    })
  })
}

export const setReceivedMessagesReadTrue = (chatKey, userKey) => {
  return firebase.database().ref().child('messages').child(chatKey).once('value').then((snap) => {
    if(snap.val() != null) {
      Object.keys(snap.val()).forEach((messageKey) => {
        firebase.database().ref().child('messages').child(chatKey).child(messageKey).once('value').then((snap) => {
          if(snap.val().sender != userKey && snap.val().read != true)
            firebase.database().ref().child('messages').child(chatKey).child(messageKey).update({['read']:true})
        })
      })
    }
  })
}

export const updateUser = (uid, key, value) => {
  firebase.database().ref().child('users').child(uid)
    .update({[key]:value})
}

export const updateAllUsers = (key, value) => {
  firebase.database().ref().child('users').once('value')
    .then((snap) => {
      if(snap.val() != null) {
        if(snap.val() != null)
          Object.keys(snap.val()).forEach((uid) => {
            updateUser(uid, key, value)
          })
      }
    })
}

export async function getLocationAsync(key) {
  const { Location, Permissions } = Expo;
  const { status } = await Permissions.askAsync(Permissions.LOCATION);
  if (status === 'granted') {
    watchUserLocation(key);

    return true
  } else {
     Alert.alert('Please Enable Location Services.', 
      'Go to Settings -> Ice Breakerr -> Location then select "While Using the App."');

    console.log('Location permission not granted');

    return false
  }
}

 export async function alertIfRemoteNotificationsDisabledAsync(func) {
  const { Permissions } = Expo;
  const { status } = await Permissions.getAsync(Permissions.LOCATION);
  if (status !== 'granted') {
    func(false)
  } else {
    func(true)
  }
}

export const mergeUser = (uid, token, newData) => {
  console.log('newData', newData)

  const firebaseRefAtUID = firebase.database().ref().child('users').child(uid)

  return firebaseRefAtUID.once("value").then((snap) => {
    const defaults = {
        maxDistance: 5,
        uid: uid,
        fbAuthToken: token,
        photoUrls: [],
        gifUrl: 'https://i.imgur.com/2lf2lNU.gif',
        bio: '',
        emojis: '',
        interests: '',
        discoverable: true,
    }
    const current = snap.val()
    const mergedUser = {...defaults, ...current, ...newData}

    firebaseRefAtUID.update(mergedUser)
  })  
}

export const getCurrentSchool = (id, token, func) => {
  fetch(`https://graph.facebook.com/${id}/education?access_token=${token}`)
    .then((response) => { 
        response.json().then((res) => { 
          console.log(res.data, id)
    })
  })
}

export const mergeUserPhotoUrls = (uid, urls) => {
  const firebaseRefAtUID = firebase.database().ref().child('users').child(uid)

  firebaseRefAtUID.update({photoUrls: urls})
}

export const getPhotoUrlsFromFbCb = (id, token, func) => { 
  fetch(`https://graph.facebook.com/${id}/albums?access_token=${token}`)
    .then((response) => { 
        response.json().then((res) => { 
          const album = res.data.filter((album) => {
            if(album.name == 'Profile Pictures')
              return album
          })

        if(album[0] != null)
          fetch(`https://graph.facebook.com/${album[0].id}/photos?access_token=${token}`)
            .then((response) => {
              response.json().then((res) => {
                func(res.data.map((photo) => {
                  return `https://graph.facebook.com/${photo.id}/picture?access_token=${token}`
                }))
              })
          })
        else
          func(['http://i.imgur.com/HNfWmVu.jpg'])
    })
  })
}

export const getAllPhotoUrlsFromFbCb = (id, token, func) => { 
  fetch(`https://graph.facebook.com/${id}/albums?access_token=${token}`)
    .then((response) => { 
        response.json().then((res) => { 
          const albums = res.data.map((album) => {
              return album
          })

        if(albums[0] != null)
          getAllPhotosFromAlbums(albums, 0, [], token, (photos) => {
            func(photos)
          })
        else
          func([])
    })
  })
}

//utilizes recursion to pull all photos from the api w nested calllbacks
export const getAllPhotosFromAlbums = (albums, index, prevPhotos, token, func) => {
  if(index < albums.length) {
    fetch(`https://graph.facebook.com/${albums[index].id}/photos?access_token=${token}`)
      .then((response) => {
        response.json().then((res) => {
          const curPhotos = res.data.map((photo) => {
            return `https://graph.facebook.com/${photo.id}/picture?access_token=${token}`
          })
          const allPhotos = prevPhotos.concat(curPhotos)

          getAllPhotosFromAlbums(albums, index+1, allPhotos, token, func)
        })
      })
  } else {
    func(prevPhotos)
  }
}

export const reportProfileFromUser = (userKey, profileKey) => {
  const now = new Date();

  firebase.database().ref().child('users').child(userKey).child('reports').update({[profileKey]:{reportFrom: userKey, date: now}})
  firebase.database().ref().child('users').child(profileKey).child('reports').update({[userKey]:{reportFrom: userKey, date: now}})
}

export const rejectProfileFromUser = (userKey, profileKey) => {
  const now = new Date();

  firebase.database().ref().child('users').child(userKey).child('rejections').update({[profileKey]:{date: now}})
  firebase.database().ref().child('users').child(profileKey).child('rejections').update({[userKey]:{date: now}})
}

export const likeProfileFromUser = (userKey, profileKey) => {
  const now = new Date();

  firebase.database().ref().child('users').child(userKey).child('likes').update({[profileKey]:{date: now}})
}

export const setMatchWithProfiles = (userKey, profileKey) => {
  const now = new Date();

  firebase.database().ref().child('users').child(userKey).child('matches').update({[profileKey]:{date: now}})
  firebase.database().ref().child('users').child(profileKey).child('matches').update({[userKey]:{date: now}})
}

export const checkForMatch = (userKey, profileKey, func) => {
  firebase.database().ref().child('users').child(profileKey).child('likes').once('value').then((snap) => {
    if(snap.val() != null) {
      const profileLikes = Object.keys(snap.val())

      firebase.database().ref().child('users').child(userKey).child('likes').once('value').then((snap) => {
        if(snap.val() != null) {
          const userLikes = Object.keys(snap.val())

          func(userLikes.some((userLike) => { 
            return profileLikes.some((profileLike) => {
              return userLike == profileLike
            })
          }))
        } else 
          func(false)
      })
    } else
     func(false)
  })
}

export const getUser = (key) => {
  return firebase.database().ref().child('users').child(key).once('value')
    .then((snap) => snap.val())
}

export const getUserCb = (key, func) => {
  firebase.database().ref().child('users').child(key).once('value')
    .then((snap) => func(snap.val()))
}

export const getUsersCb = (keyArray, func) => {
  firebase.database().ref().child('users').once('value')
    .then((snap) => {
      if(snap.val() != null) {
        const users = []

        keyArray.forEach((key) => {
          users.push(snap.val()[key])
        })

        func(users)
      }
    })
}

export const getSomeUsersCb = (keyArray, func) => {
  firebase.database().ref().child('users').once('value')
    .then((snap) => {
      if(snap.val() != null) {
        const randInt =  Math.floor(Math.random() * 10) //Generate random number from 0 to 9
        const users = []
        let index = 0

        keyArray.forEach((key) => {
          index++
          if(keyArray.length <= 20)
            users.push(snap.val()[key])
          else if(index%10 == randInt) //Speeds things up when large data arrays are present
            users.push(snap.val()[key])
        })

        func(users)
      }
    })
}


export const getChat = (key) => {
  return firebase.database().ref().child('messages').child(key).once('value')
    .then((snap) => snap.val())
}

export const getChatCb = (key, func) => {
  return firebase.database().ref().child('messages').child(key).once('value')
    .then((snap) => { func(snap.val()) })
}

export const getChatsCb = (keyArray, func) => {
  firebase.database().ref().child('messages').once('value')
    .then((snap) => {
      if(snap.val() != null) {
        const chats = []

        keyArray.forEach((key) => {
          chats.push(snap.val()[key])
        })

        func(chats)
      }
    })
}

export const getChatMessageCountFromUid = (chatID, uid) => {
  firebase.database().ref().child('messages').child(key).once('value')
    .then((snap) => {
      const messageCount = Object.values(snap.val()).filter((message) => {
        return message.sender == uid
      }).length

      return messageCount
    })
}

export const getChatWithProfiles = (userKey, profileKey, func) => {
  //Sort uid concatenation in order of greatness so every user links to the same chat
  const uidArray = [userKey, profileKey]
  uidArray.sort()
  const chatID = uidArray[0]+'-'+uidArray[1]

  getChatCb(chatID, (chat) => { func(chat) })
}

export const getChatIDsWithProfilesAndUser = (userKey, profileKeyArray, func) => {
  const chatIDs = []

  profileKeyArray.forEach((profileKey) => {
    const uidArray = [userKey, profileKey]
    uidArray.sort()
    const chatID = uidArray[0]+'-'+uidArray[1]

    chatIDs.push(chatID)
  })

  func(chatIDs)
}

export const getProfilesInChatsWithKey = (key, func) => {
  return firebase.database().ref().child('messages').once('value')
    .then((snap) => {
    if(snap.val() != null) {
        const profileUids = []

        Object.keys(snap.val()).forEach((chatID) => {
          if(chatID.split('-').some((uid) => {return uid == key}))
            profileUids.push(chatID.split('-').filter((uid) => {return uid != key}))
        })

        getUsersCb(profileUids, (profiles) => {func(profiles)})
      }
    })
}

export const checkForChat = (userKey, profileKey, func) => {
  firebase.database().ref().child('messages').once('value')
    .then((snap) => {
      if(snap.val() != null) {
        let hasChat = false

        Object.keys(snap.val()).forEach((chatID) => {
          if(chatID.split('-').some((uid) => {return uid == userKey}) && chatID.split('-').some((uid) => {return uid == profileKey}))
            hasChat = true
        })

        func(hasChat)
      } 
  })
}

export const watchForNewChat = (userKey, profileKey, func) => {
  firebase.database().ref().child('messages').on('value', (snap) => {
      if(snap.val() != null) {
        let hasChat = false

        Object.keys(snap.val()).forEach((chatID) => {
          if(chatID.split('-').some((uid) => {return uid == userKey}) && chatID.split('-').some((uid) => {return uid == profileKey})){
            hasChat = true
          }
        })

        func(hasChat)
      } 
  })
}

export const watchChat = (key, func) => {
  firebase.database().ref().child('messages').child(key).on('value', (snap) => {
      if(snap.val() != null) {
        func(snap.val())
      } 
  })
}

export const removeWatchForChat = () => {
  firebase.database().ref().child('messages').off()
}

export const watchChatForRecentMessage = (key, func) => {
  firebase.database().ref().child('message').child(key).on('value', (snap) => {
      if(snap.val() != null) {
        console.log('snapaf slkdjfalskdfjlkasjf')
        console.log(snap.val()[0])
        func(snap.val()[0])
      } 
  })
}

export const watchChatsWithProfilesInKey = (key, func) => {
  return firebase.database().ref().child('messages').on('value', (snap) => {
    if(snap.val() != null) {
        const profileUids = []

        Object.keys(snap.val()).forEach((chatID) => {
          if(chatID.split('-').some((uid) => {return uid == key}))
            profileUids.push(chatID.split('-').filter((uid) => {return uid != key}))
        })

        getUsersCb(profileUids, (profiles) => {func(profiles)})
      }
    })
}

export const getChatsWithUser = (key, func) => {
  return firebase.database().ref().child('messages').once('value').then((snap) => {
    if(snap.val() != null) {
        const profileUids = []

        Object.keys(snap.val()).forEach((chatID) => {
          if(chatID.split('-').some((uid) => {return uid == key}))
            profileUids.push(chatID.split('-').filter((uid) => {return uid != key}))
        })

        getUsersCb(profileUids, (profiles) => {func(profiles)})
      }
    })
}

export const watchChatsWithUser = (key, func) => {
  return firebase.database().ref().child('messages').on('value', (snap) => {
    if(snap.val() != null) {
        const profileUids = []

        Object.keys(snap.val()).forEach((chatID) => {
          if(chatID.split('-').some((uid) => {return uid == key}))
            profileUids.push(chatID.split('-').filter((uid) => {return uid != key}))
        })

        getUsersCb(profileUids, (profiles) => {func(profiles)})
      }
    })
}

export const turnOffChatListener = () => {
  return firebase.database().ref().child('messages').off()
}


export const getUsers = (func) => {
  firebase.database().ref().child('users').once('value')
    .then((snap) => {
      if(snap.val() != null) {
        if(snap.val() != null)
          getSomeUsersCb(Object.keys(snap.val()), (profiles) => {
            if(profiles != null){
              console.log('getUsers', profiles.map((profile) => { return profile.name }))
              profiles.length = 10
              func(profiles)
            }
          })
        else
          func(null)
      }
    })
}
export const watchUser = (key, func) => {
  firebase.database().ref().child('users/'+key).on('value', (snap) => {
    // console.log('called watch user for:', key)
    func(snap.val())
  })
}

export const removeWatchUser = (key) => {
  firebase.database().ref().child('users').child(key).off()
}

export const storeProfileLocation = (profile, func) => {
  const firebaseRef = firebase.database().ref()
  const geoFire = new GeoFire(firebaseRef.child('geoData/'))

  geoFire.get(profile.uid).then(location => {    
    const geoQuery = geoFire.query({
      center: location,
      radius: 3000 //user.maxDistance
    })

    geoQuery.on("ready", (res) => { // loaded geodata
      geoQuery.cancel()
    })
  }) 
}

export const getDistanceFromUser = (profileKey, userKey, func) => {
  const firebaseRef = firebase.database().ref()
  const geoFire = new GeoFire(firebaseRef.child('geoData/'))

  geoFire.get(profileKey).then((profileLocation) => {
    if(profileLocation != null)
      geoFire.get(userKey).then((userLocation) => {
        if(userLocation != null) {
          const distanceFromUser = GeoFire.distance(userLocation, profileLocation)
          func(distanceFromUser)
        }
      })
  })
}

export const watchUserLocation = (key) => {
  const firebaseRef = firebase.database().ref()
  const geoFire = new GeoFire(firebaseRef.child('geoData/'))
  const options ={
    enableHighAccuracy:false,
    timeInterval:100000,
    distanceInterval: 3000
  }
  Exponent.Location.watchPositionAsync(options,(pos)=>{
    const {latitude,longitude} = pos.coords
    geoFire.set(key, [latitude,longitude]).then(() => {
        // console.log("Key has been added to GeoFire");
      }, (error) => {
        // console.log("Error: " + error);
      })
  })
}
export const watchUserLocationDemo = (key) => {
  const firebaseRef = firebase.database().ref()
  const geoFire = new GeoFire(firebaseRef.child('geoData/'))
  const lat = -26.2041028
  const lon = 28.0473051
  geoFire.set(key, [lat, lon]).then(() => {
      // console.log("Key has been added to GeoFire");
    }, (error) => {
      // console.log("Error: " + error);
    })
}