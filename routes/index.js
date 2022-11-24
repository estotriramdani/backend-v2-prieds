var express = require('express');
var router = express.Router();
const stock_read_log = require('../models/stock_read_log');
const FileSystem = require('fs');
const { changePayloadStatuses, mapPayload, finalStatusDecider } = require('../helpers');

router.use('/export-data', async (req, res) => {
  const list = await stock_read_log
    .aggregate([
      {
        $match: {},
      },
    ])
    .exec();

  FileSystem.writeFile('./stock_read_log.json', JSON.stringify(list), (error) => {
    if (error) throw error;
  });

  console.log('stock_read_log.json exported!');
  res.json({ statusCode: 1, message: 'stock_read_log.json exported!' });
});

router.use('/import-data', async (req, res) => {
  const list = await stock_read_log
    .aggregate([
      {
        $match: {},
      },
    ])
    .exec();

  FileSystem.readFile('./stock_read_log.json', async (error, data) => {
    if (error) throw error;

    const list = JSON.parse(data);

    const deletedAll = await stock_read_log.deleteMany({});

    const insertedAll = await stock_read_log.insertMany(list);

    console.log('stock_read_log.json imported!');
    res.json({ statusCode: 1, message: 'stock_read_log.json imported!' });
  });
});

router.use('/edit-repacking-data', async (req, res) => {
  const { reject_qr_list, new_qr_list, company_id, payload } = req.body;
  if (!reject_qr_list || !new_qr_list || !company_id || !payload) {
    return res
      .status(400)
      .json({ message: 'reject_qr_list, new_qr_list, company_id, and payload are required' });
  }
  try {
    const rejects = mapPayload(reject_qr_list);
    const payloads = [...mapPayload(reject_qr_list), ...mapPayload(new_qr_list)];
    const stocks = await stock_read_log
      .find({
        payload: { $in: payloads },
      })
      .lean();
    if (stocks.length === 0) {
      return res.status(404).json({
        message: 'Payloads not found',
      });
    }
    const updatedStatuses = changePayloadStatuses({ masterData: stocks, rejects });
    const finalStatus = finalStatusDecider({ masterData: stocks });
    const responseData = {
      ...stocks[0],
      qty: updatedStatuses.length,
      qr_list: updatedStatuses,
      company_id,
      payload,
      ...finalStatus,
    };
    res.status(201).json(responseData);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

router.use('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
