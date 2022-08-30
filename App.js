import { StyleSheet, Text, View, Image, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { FontAwesome5, MaterialCommunityIcons, FontAwesomeIcon } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';


import DateTime from './components/DateTime';
import HourlyWeather from './components/HourlyWeather';
import UnitPicker from './components/UnitPicker';
import WeatherBox from './components/WeatherBox';
import LocationsScreen from './components/screens/LocationsScreen';
import DailyForecast from './components/DailyForecast';




function HomeScreen({ weather, units }) {
  // Main elements, including location name, temperature, description, highest and lowest temp
  if (weather != null && weather != undefined) {
    if (weather.weather) {
      let currentWeather = weather.weather[0];
      let currentWeatherIcon = currentWeather.icon;
      let main = weather.main;
      let iconURL = `http://openweathermap.org/img/wn/${currentWeatherIcon}@4x.png`;
      let _unit = units == 'metric' ? 'C' : 'F';
      return (<View style={styles.headerContainer}>
        <Text style={styles.tempText}>{weather.name}</Text>

        {iconURL !== null ? (<>
          <Image style={styles.mainIcon} source={{ uri: iconURL }} />
        </>) : <></>}

        {main !== undefined ? (<>
          <Text style={styles.subText}>{Math.round(main["temp"])}&#176;{_unit}</Text>
        </>) : <></>}

        <Text style={styles.descriptionText}>{currentWeather["description"]}</Text>

        <View style={styles.tempMinMax}>
          {main !== undefined ? (<>
            <Text style={styles.tempMinMax}>H {Math.round(main["temp_max"])}&#176;{_unit}</Text>
          </>) : <></>}

          {main !== undefined ? (<>
            <Text style={styles.tempMinMax}>L {Math.round(main["temp_min"])}&#176;{_unit}</Text>
          </>) : <></>}

        </View>
      </View>)

    } else {
      return <View style={styles.headerContainer}>
        <Text>Loading...</Text>
      </View>
    }


  } else {
    return <View style={styles.headerContainer}>
      <Text>Loading...</Text>
    </View>
  }
}


function MyTabBar({ state, descriptors, navigation }) {
  return (
    <View style={{ flexDirection: 'row', margin: 10, justifyContent: "center" }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={`tab-button-${label}`}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ flex: 1 }}
          >
            <Text style={{ color: isFocused ? '#673ab7' : '#222' }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const Tab = createBottomTabNavigator();


export default function App() {

  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [unitSystem, setUnitSystem] = useState('metric');

  useEffect(() => {

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg("Permission Denied");
        return;

      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);


      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&units=${unitSystem}&exclude=minutely&appid=e408f93a18925399e2ea9e9eaa9d2e78`, {

        method: "POST",
        headers: {
          Accept: 'application/json',
          'Current-Type': 'application/json'
        }
      })
        .then((response) => response.json())
        .then((json) => {
          setWeather(json);
        })
        .catch((error) => {
          console.log(error);
        })

    })();
  }, [unitSystem]);

  if (errorMsg !== null) {
    //there's been  an error
    return (
      <View style={styles.container}>
        <Text>There's been an error {errorMsg}</Text>
      </View>
    );

  } else if (location !== null && location !== undefined && weather !== null && weather !== undefined) {
    // success

    let main = weather.main;
    let sys = weather.sys;

    const LocationsScreenTab = () => {
      return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, flexDirection: 'column' }}>
          <View style={styles.locationContainer}>
            <Text style={styles.tempText}> Locations </Text>
            <LocationsScreen units={unitSystem} />
          </View>
        </ScrollView>
      )
    }

    const HomeTab = () => {
      return (<SafeAreaView>
        <ScrollView contentContainerStyle={{ flexGrow: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
          <View style={styles.container}>
            <DateTime />
            <UnitPicker unitSystem={unitSystem} setUnitSystem={setUnitSystem} />
            <HomeScreen weather={weather} units={unitSystem} />
            <HourlyWeather weather={weather} units={unitSystem} />
            <Text style={styles.title}> 10 Days forecast </Text>
            <DailyForecast weather={weather} units={unitSystem} />
            <WeatherBox weather={weather} />
          </View>
        </ScrollView>
      </SafeAreaView>);

    }


    return (<>
      <NavigationContainer style={styles.navContainer} >
        <Tab.Navigator style={styles.navBar} tabBar={(props) => <MyTabBar {...props} />}>
          <Tab.Screen name="Home" options={{ headerShown: false }} component={HomeTab} />
          <Tab.Screen name="Locations" options={{ headerShown: false }} component={LocationsScreenTab} />
        </Tab.Navigator>
      </NavigationContainer>

    </>)
  } else {
    // waiting
    return (
      <View style={styles.container}>
        <Text style={styles.descriptionText} >Welcome to Simply Weather</Text>
      </View>
    );

  }

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#EEDECE',
    color: '#3a3b3c',
    justifyContent: "center"

  },

  locationContainer: {
    flex: 1,
    backgroundColor: '#EEDECE',
    color: '#3a3b3c',
    paddingTop: 50,
  },

  headerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 100,

  },
  tempText: {
    fontSize: 36,
    color: '#3a3b3c',
  },

  subText: {
    fontSize: 64,
    color: '#3a3b3c'
  },
  mainIcon: {
    width: 200,
    height: 200
  },
  descriptionText: {
    fontSize: 22,
    color: '#3a3b3c'
  },
  tempMinMax: {
    fontSize: 18,
    color: '#3a3b3c',
    flexDirection: "row",
    justifyContent: "center",
    padding: 10,
  },
  navContainer: {
    flex: 1
  },
  navBar: {
    backgroundColor: '#5B29C1',
    borderBottomColor: '#48209A',
    borderBottomWidth: 1
  },
  title: {
    fontSize: 18,
    color: '#3a3b3c',
    margin: 10,
  }


});
