import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 50,
  duration: '2m',
  thresholds: {
    http_req_failed: ['rate<0.02'],          
    http_req_duration: ['p(95)<100'],        
  },
};

const BASE = 'http://ft_transcendence:4242';

export default () => {
  
  check(http.get(`${BASE}/`),        { '200 /':  (r) => r.status === 200 });

  check(http.get(`${BASE}/api/user`), { '200 /api': (r) => r.status === 200 });
  sleep(1);
};
