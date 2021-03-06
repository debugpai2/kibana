/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/*
 * TODO: deprecate this API in 7.0
 */
import { wrap } from 'boom';
import { callClusterFactory } from '../../../lib/call_cluster_factory';
import { getKibanaUsageCollector, getReportingUsageCollector } from '../../../../../monitoring/server/kibana_monitoring';

export function kibanaStatsRoute(server) {
  server.route({
    path: '/api/_kibana/v1/stats',
    method: 'GET',
    handler: async (req, reply) => {
      const server = req.server;
      // require that http authentication headers from req are used to read ES data
      const callCluster = callClusterFactory(server).getCallClusterWithReq(req);

      try {
        const kibanaUsageCollector = getKibanaUsageCollector(server, callCluster);
        const reportingCollector = getReportingUsageCollector(server, callCluster); // TODO instead of hardcoding, loop through a set of usage collectors that have been registered to a server method

        const [ kibana, reporting ] = await Promise.all([
          kibanaUsageCollector.fetch(),
          reportingCollector.fetch(),
        ]);

        reply({
          kibana,
          reporting,
        });
      } catch(err) {
        req.log(['error'], err);

        if (err.isBoom) {
          return reply(err);
        }
        reply(wrap(err, err.statusCode, err.message));
      }
    }
  });
}
