import { get, patch, post } from '../utils/http.js';

export default {
  // Post Earthquake Report
  async postEarthquakeReport(data) {
    return await post('/earthquake/report', data);
  },
  async getEarthquakeReport() {
    return await get('/earthquake/report');
  },
  async patchEarthquakeReport(data) {
    return await patch('/earthquake/report', data);
  },
  async postEarthquakePrediction(data) {
    return await post('/earthquake/prediction', data);
  },
};
