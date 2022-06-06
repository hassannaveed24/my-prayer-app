import dayjs from 'dayjs';
import * as Location from 'expo-location';
import { collection, documentId, getDocs, query, where } from 'firebase/firestore';
import { Platform } from 'react-native';
import { database } from '../database/firebaseDB';

const namazLabels = ['fajar', 'duhar', 'asar', 'maghrib', 'isha'];
export const getHours = $object => {
  const minutes = $object.minute();
  const hours = $object.hour();

  return (((hours + minutes / 60) * 100) / 24).toFixed(2);
};

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

export const excludeMasjids = $masjids => {
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
    if (prayerDifferences.length === 0) {
      return false;
    } else {
      const min = Math.min(...differencesinNum);

      let nearestPrayer = prayerDifferences.find($prayer => $prayer.difference === min);

      prayerDifferences.forEach($prayer => {
        const absoluteDifference = Math.abs((currentHours - $prayer.difference).toFixed(2));
        const reversedDifference = parseInt(currentHours, 10) + 100 - $prayer.difference;
        const difference =
          parseInt(currentHours, 10) > 75 ? reversedDifference : absoluteDifference;

        if (nearestPrayer.difference > difference) nearestPrayer = $prayer;
      });

      return dayjs(nearestPrayer.prayerTime)
        .set('date', parseInt(dayjs(currentTime).format('D'), 10))
        .set('month', parseInt(dayjs(currentTime).format('M') - 1, 10))
        .set('year', parseInt(dayjs(currentTime).format('YYYY'), 10))
        .isBefore(dayjs(currentTime));
    }
  });
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
    if (prayerDifferences.length === 0) {
      return false;
    } else {
      const min = Math.min(...differencesinNum);

      let nearestPrayer = prayerDifferences.find($prayer => $prayer.difference === min);

      prayerDifferences.forEach($prayer => {
        const absoluteDifference = Math.abs((currentHours - $prayer.difference).toFixed(2));
        const reversedDifference = parseInt(currentHours, 10) + 100 - $prayer.difference;
        const difference =
          parseInt(currentHours, 10) > 75 ? reversedDifference : absoluteDifference;

        if (nearestPrayer.difference > difference) nearestPrayer = $prayer;
      });

      return dayjs(nearestPrayer.prayerTime)
        .set('date', parseInt(dayjs(currentTime).format('D'), 10))
        .set('month', parseInt(dayjs(currentTime).format('M') - 1, 10))
        .set('year', parseInt(dayjs(currentTime).format('YYYY'), 10))
        .isBefore(dayjs(currentTime));
    }
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
    if (prayerDifferences.length === 0) {
      return false;
    } else {
      const min = Math.min(...differencesinNum);

      let nearestPrayer = prayerDifferences.find($prayer => $prayer.difference === min);

      prayerDifferences.forEach($prayer => {
        const absoluteDifference = Math.abs((currentHours - $prayer.difference).toFixed(2));
        const reversedDifference = parseInt(currentHours, 10) + 100 - $prayer.difference;
        const difference =
          parseInt(currentHours, 10) > 75 ? reversedDifference : absoluteDifference;

        if (nearestPrayer.difference > difference) nearestPrayer = $prayer;
      });

      return !dayjs(nearestPrayer.prayerTime)
        .set('date', parseInt(dayjs(currentTime).format('D'), 10))
        .set('month', parseInt(dayjs(currentTime).format('M') - 1, 10))
        .set('year', parseInt(dayjs(currentTime).format('YYYY'), 10))
        .isBefore(dayjs(currentTime));
    }
  });
};

export const transformMasjids = $masjids => {
  return $masjids.map($masjid => {
    const latitude = $masjid?.geometry?.location?.lat || $masjid?.coordinate?.latitude;

    const longitude = $masjid?.geometry?.location?.lng || $masjid?.coordinate?.longitude;
    const title = $masjid?.name || $masjid?.title;
    const image =
      $masjid?.icon ||
      'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/worship_islam-71.png';
    const place_id = $masjid?.place_id;
    const prayerTimes = $masjid?.prayerTimes || {
      fajar: null,
      duhar: null,
      asar: null,
      maghrib: null,
      isha: null,
    };
    const customMessage = $masjid?.customMessage || null;

    return {
      coordinate: { latitude, longitude },
      title,
      image,
      place_id,
      prayerTimes,
      customMessage,
    };
  });
};

export const getAllMasjids = async () => {
  const masjidCollectionRef = collection(database, 'masjids');
  const masjidSnapshot = await getDocs(masjidCollectionRef);

  const masjids = [];
  masjidSnapshot.forEach($doc => masjids.push($doc.data()));
  return masjids;
};

export const getTimelyMasjids = $masjids => {
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
    if (prayerDifferences.length === 0) {
      return false;
    } else {
      const min = Math.min(...differencesinNum);

      let nearestPrayer = prayerDifferences.find($prayer => $prayer.difference === min);

      if (prayerDifferences.length > 1) {
        prayerDifferences.forEach($prayer => {
          const absoluteDifference = Math.abs((currentHours - $prayer.difference).toFixed(2));
          const reversedDifference = parseInt(currentHours, 10) + 100 - $prayer.difference;
          const difference =
            parseInt(currentHours, 10) > 75 ? reversedDifference : absoluteDifference;

          if (nearestPrayer.difference > difference) nearestPrayer = $prayer;
        });
      }

      const normalizedPrayerDate = parseInt(dayjs(currentTime).format('D'), 10);
      // const normalizedPrayerDate = 2;
      const normalizedPrayerMonth = parseInt(dayjs(currentTime).format('M'), 10);
      const normalizedPrayerYear = parseInt(dayjs(currentTime).format('YYYY'), 10);

      const normalizedPrayerTime = dayjs(nearestPrayer.prayerTime)
        .date(normalizedPrayerDate + 1)
        .month(normalizedPrayerMonth - 1)
        .year(normalizedPrayerYear);

      const isBefore = normalizedPrayerTime.isBefore(dayjs(currentTime));

      return !isBefore;
    }
  });
};

// Generic helper function that can be used for the intersection, inFirstOnly, inSecondOnly operations:
const operation = (array1, array2, isUnion = false) =>
  array1.filter(
    (
      set => a =>
        isUnion === set.has(a.place_id)
    )(new Set(array2.map(b => b.place_id))),
  );

export const intersectionOfTwoArrays = (array1, array2) => operation(array1, array2, true);
export const inFirstOnly = operation;
export const inSecondOnly = (array1, array2) => inFirstOnly(array2, array1);
