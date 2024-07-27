import axios from 'axios';
import store from '@/store';
import { ElMessage } from 'element-plus';
import { getToken } from './auth';

const service = axios.create({
  baseURL: 'http://127.0.0.1:8080',
  timeout: 10000
});

service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['X-token'] = getToken();
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  response => {
    const res = response.data;
    if (res.code && res.code !== 200) {
      ElMessage.error({
        message: res.message || '请求出错',
        duration: 5 * 1000
      });
      return Promise.reject(res);
    } else {
      return res;
    }
  },
  error => {
    return Promise.reject(error);
  }
);

export default service;
