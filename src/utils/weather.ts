import type { Weather } from '../types';

/**
 * 获取当前天气信息
 * 使用免费的天气 API（示例使用 wttr.in）
 */
export const getCurrentWeather = async (): Promise<Weather | null> => {
  try {
    // 使用 wttr.in 的简单 API（无需 API key）
    const response = await fetch('https://wttr.in/?format=j1');
    const data = await response.json();
    
    const current = data.current_condition[0];
    return {
      temp: parseInt(current.temp_C),
      description: current.weatherDesc[0].value,
    };
  } catch (error) {
    console.error('获取天气失败:', error);
    return null;
  }
};

/**
 * 获取当前地理位置
 */
export const getCurrentLocation = async (): Promise<string> => {
  try {
    // 使用浏览器的 Geolocation API
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const { latitude, longitude } = position.coords;

    // 使用反向地理编码获取地址（示例使用 Nominatim）
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=zh-CN`
    );
    const data = await response.json();

    const city = data.address.city || data.address.town || data.address.village || '';
    const district = data.address.suburb || data.address.district || '';
    
    return city && district ? `${city} · ${district}` : city || '未知位置';
  } catch (error) {
    console.error('获取位置失败:', error);
    return '';
  }
};
