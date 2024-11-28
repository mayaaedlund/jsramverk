import express from 'express';
import data from "../models/data.mjs";
import auth from "../models/auth.mjs";

const router = express.Router();

router.get('/',
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => data.getAllDataForUser(res, req)
);

router.post('/',
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => data.createData(res, req)
);

router.put('/',
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => data.updateData(res, req)
);

router.delete('/',
    (req, res, next) => auth.checkToken(req, res, next),
    (req, res) => data.deleteData(res, req)
);

export default router;
