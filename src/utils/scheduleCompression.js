import pako from 'pako';

/**
 * Compresses data to Base64 string using pako
 */
export const compressToBase64 = (data) => {
  try {
    const stringData = JSON.stringify(data);
    const compressed = pako.deflate(stringData, { to: 'string' });
    return btoa(compressed);
  } catch (error) {
    console.error('Error compressing data:', error);
    return null;
  }
};

/**
 * Processes schedule data and compresses scoreddata fields
 */
export const processScheduleForStorage = (schedule) => {
  if (!schedule?.units) return schedule;

  return {
    ...schedule,
    units: schedule.units.map(unit => ({
      ...unit,
      items: unit.items.map(item => {
        if (!item.assessmentData?.scoreddata) return item;

        return {
          ...item,
          assessmentData: {
            ...item.assessmentData,
            scoreddata: compressToBase64(item.assessmentData.scoreddata)
          }
        };
      })
    }))
  };
};

/**
 * Decompresses Base64 string using pako
 */
export const decompressFromBase64 = (base64String) => {
  if (!base64String) return null;
  
  try {
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const decompressed = pako.inflate(bytes, { to: 'string' });
    return JSON.parse(decompressed);
  } catch (error) {
    console.error('Error decompressing data:', error);
    return null;
  }
};