export interface GeocodeResponse {
  latitude: number;
  longitude: number;
  locality: string;
  city: string;
  countryName: string;
  state: string | null;
}

export async function reverseGeocode(
  lat: number,
  lon: number,
  language: string = "ru",
): Promise<GeocodeResponse> {
  // Проверка валидности координат
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new Error(
      "Invalid coordinates: latitude must be between -90 and 90, longitude between -180 and 180",
    );
  }

  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${language}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Формирование ответа с необходимыми полями
    const result: GeocodeResponse = {
      latitude: data.latitude,
      longitude: data.longitude,
      locality: data.locality || "",
      city: data.city || "",
      countryName: data.countryName || "",
      state: data.principalSubdivision || null,
    };

    return result;
  } catch (error) {
    throw new Error(
      `Failed to fetch geocode data: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export function formatLocation(location: GeocodeResponse): string {
  const { countryName, state, locality } = location;

  let result = [];
  if (countryName) {
    result.push(countryName);
  }
  if (state) {
    result.push(state);
  }
  if (locality && locality !== state) {
    result.push(locality);
  }

  // Если state есть, включаем все три части; если нет, только countryName и locality
  return result.join(", ");
}
