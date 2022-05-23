import dayjs from 'dayjs';
import * as Location from 'expo-location';
import { collection, documentId, getDocs, query, where } from 'firebase/firestore';
import { Platform } from 'react-native';
import { database } from '../database/firebaseDB';

const namazLabels = ['fajar', 'duhar', 'asar', 'maghrib', 'isha'];

export const getMasjidsByIds = async $masjidIds => {
  const masjids = [];
  const q = query(collection(database, 'masjids'), where(documentId(), 'in', $masjidIds));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(doc => {
    // doc.data() is never undefined for query doc snapshots
    masjids.push({
      coordinate: doc.data()?.coordinate,
      title: doc.data()?.title,
      image: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/worship_islam-71.png',
      place_id: doc.data()?.place_id,
      prayerTimes: doc.data()?.prayerTimes,
    });
  });
  return masjids;
};

export const getHours = $object => {
  const minutes = $object.minute();
  const hours = $object.hour();

  return (((hours + minutes / 60) * 100) / 24).toFixed(2);
};

export const excludeMasjidsWithPrayerTimeCondition = $masjids => {
  const currentTime = dayjs();
  const currentHours = getHours(currentTime);

  return $masjids.filter($masjid => {
    const prayerDifferences = [];
    const differencesinNum = [];

    namazLabels.forEach($namaz => {
      let prayerTime = $masjid.prayerTimes[$namaz];
      let prayerDifference = null;

      if (prayerTime) {
        prayerTime = dayjs(prayerTime.toDate());

        const prayerHours = getHours(prayerTime);

        const difference = Math.abs((prayerHours - currentHours).toFixed(2));

        prayerDifference = { label: $namaz, prayerTime, difference };
        differencesinNum.push(difference);
        prayerDifferences.push(prayerDifference);
      }
    });
    const min = Math.min(...differencesinNum);

    let nearestPrayer = prayerDifferences.find($prayer => $prayer.difference === min);

    prayerDifferences.forEach($prayer => {
      const absoluteDifference = Math.abs((currentHours - $prayer.difference).toFixed(2));
      const reversedDifference = parseInt(currentHours, 10) + 100 - $prayer.difference;
      const difference = parseInt(currentHours, 10) > 75 ? reversedDifference : absoluteDifference;

      if (nearestPrayer.difference > difference) nearestPrayer = $prayer;
    });

    return dayjs(nearestPrayer.prayerTime)
      .set('date', parseInt(dayjs(currentTime).format('D'), 10))
      .set('month', parseInt(dayjs(currentTime).format('M') - 1, 10))
      .set('year', parseInt(dayjs(currentTime).format('YYYY'), 10))
      .isBefore(dayjs(currentTime));
  });
};

export const getCurrentLocation = async () => {
  if (Platform.OS !== 'android') throw new Error('Invalid platform');
  const status = await Location.requestForegroundPermissionsAsync();
  if (status.status !== 'granted') throw new Error('Location not granted');

  const location = await Location.getCurrentPositionAsync({});

  // if (location.hasOwnProperty('mocked') && location.mocked) throw new Error('Please turn off mock location');

  return {
    latitude: location.coords?.latitude,
    longitude: location.coords?.longitude,
  };
};

export const filterMasjids = $masjids => {
  const currentTime = dayjs();
  const currentHours = getHours(currentTime);

  return $masjids.filter($masjid => {
    const prayerDifferences = [];
    const differencesinNum = [];

    namazLabels.forEach($namaz => {
      let prayerTime = $masjid.prayerTimes[$namaz];
      let prayerDifference = null;

      if (prayerTime) {
        prayerTime = dayjs(prayerTime.toDate());

        const prayerHours = getHours(prayerTime);

        const difference = Math.abs((prayerHours - currentHours).toFixed(2));

        prayerDifference = { label: $namaz, prayerTime, difference };
        differencesinNum.push(difference);
        prayerDifferences.push(prayerDifference);
      }
    });
    const min = Math.min(...differencesinNum);

    let nearestPrayer = prayerDifferences.find($prayer => $prayer.difference === min);

    prayerDifferences.forEach($prayer => {
      const absoluteDifference = Math.abs((currentHours - $prayer.difference).toFixed(2));
      const reversedDifference = parseInt(currentHours, 10) + 100 - $prayer.difference;
      const difference = parseInt(currentHours, 10) > 75 ? reversedDifference : absoluteDifference;

      if (nearestPrayer.difference > difference) nearestPrayer = $prayer;
    });

    return !dayjs(nearestPrayer.prayerTime)
      .set('date', parseInt(dayjs(currentTime).format('D'), 10))
      .set('month', parseInt(dayjs(currentTime).format('M') - 1, 10))
      .set('year', parseInt(dayjs(currentTime).format('YYYY'), 10))
      .isBefore(dayjs(currentTime));
  });
};

export const transformMasjids = $masjids =>
  $masjids.map($masjid => {
    const { lat, lng } = $masjid.geometry.location;
    return {
      coordinate: { latitude: lat, longitude: lng },
      title: $masjid?.name,
      image: $masjid?.icon,
      place_id: $masjid?.place_id,
    };
  });

export const getAllMasjids = async () => {
  const masjidCollectionRef = collection(database, 'masjids');
  const masjidSnapshot = await getDocs(masjidCollectionRef);

  const masjids = [];
  masjidSnapshot.forEach($doc => masjids.push($doc.data()));
  return masjids;
};
