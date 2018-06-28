/* @flow */
import pmx from 'pmx';

import { getIdentityMaps } from '../context/maps';

/** Track how many connected websockets are currently active. */
let contextMapMetrics;

function getContextMaps() {
  if (!contextMapMetrics) {
    contextMapMetrics = Object.keys(getIdentityMaps() || {}).reduce((metricMaps, identity) => {
      metricMaps[identity] = pmx.probe().metric({
        name: `Map Size: ${identity}`,
      });
      metricMaps[identity].set(0);
      return metricMaps;
    }, {});
  }
  return contextMapMetrics;
}

export default getContextMaps;
