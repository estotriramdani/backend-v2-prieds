/**
 * @function mapPayload
 * @param {{payload: string}[]} payloads
 * @return {string[]}
 */
const mapPayload = (payloads) => {
  return payloads.map((item) => item.payload);
};

/** @typedef {object} MasterData
 * @property {string} _id
 * @property {string} company_id
 * @property {string} scanned_time
 * @property {string} created_time
 * @property {string} last_updated
 * @property {number} qty
 * @property {any} attribute_list
 * @property {string} line_id
 * @property {string} line_type
 * @property {string} count_string
 * @property {number} count
 * @property {string} payload
 * @property {string} order_no
 * @property {string} prodis_line_id
 * @property {string} prodis_line_type
 * @property {any} qr_list
 * @property {number} status_repacking
 * @property {number} status_move_to_bin
 * @property {number} status
 * @property {number} status_qc
 * @property {number} status_sync
 * @property {string} last_synced
 * @property {number} status_pick
 * @property {number} stock_type
 * @property {number} __v
 */
/**
 * @function changePayloadStatuses
 * @param {Object} params
 * @param {MasterData[]} params.masterData - commentParam1
 * @param {string[]} params.rejects - commentParam2
 * @return {MasterData[]}
 */
const changePayloadStatuses = (params) => {
  const { masterData, rejects } = params;
  return masterData.map((data) => {
    if (rejects.includes(data.payload)) {
      return {
        ...data,
        status: 0,
        status_qc: 1,
      };
    }
    return data;
  });
};

/**
 * @function changePayloadStatuses
 * @param {Object} params
 * @param {MasterData[]} params.masterData - commentParam1
 * @return {{ status: 1|0; status_qc: 1|0; status_sync: 1|0; status_pick: 1|0 }}
 */
const finalStatusDecider = (params) => {
  const { masterData } = params;
  const zeroStatues = {
    status: 0,
    status_qc: 0,
    status_sync: 0,
    status_pick: 0,
  };
  const roundUp = Math.ceil(masterData.length / 2);
  const decider = (zero) => {
    return zero > roundUp ? 0 : 1;
  };
  masterData.forEach((data) => {
    if (data?.status === 0) {
      zeroStatues.status += 1;
    }
    if (data?.status_qc === 0) {
      zeroStatues.status_qc += 1;
    }
    if (data?.status_sync === 0) {
      zeroStatues.status_sync += 1;
    }
    if (data?.status_pick === 0) {
      zeroStatues.status_pick += 1;
    }
  });
  return {
    status: decider(zeroStatues.status),
    status_qc: decider(zeroStatues.status_qc),
    status_sync: decider(zeroStatues.status_sync),
    status_pick: decider(zeroStatues.status_pick),
  };
};

module.exports = { changePayloadStatuses, finalStatusDecider, mapPayload };
