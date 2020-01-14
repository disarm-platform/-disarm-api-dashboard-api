"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var dotenv_1 = __importDefault(require("dotenv"));
// import fs from "fs";
var lodash_1 = require("lodash");
if (process.env.NODE_ENV !== 'production') {
    dotenv_1.default.config();
}
exports.get_data = function (_, res) { return __awaiter(void 0, void 0, void 0, function () {
    var data, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, fetch_and_combine()];
            case 1:
                data = _a.sent();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
function fetch_and_combine() {
    return __awaiter(this, void 0, void 0, function () {
        var airtable_data, openfaas_data, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch_airtable()];
                case 1:
                    airtable_data = _a.sent();
                    return [4 /*yield*/, fetch_openfaas()];
                case 2:
                    openfaas_data = _a.sent();
                    // TODO: Remove debug files
                    // fs.writeFileSync('airtable_data.json', JSON.stringify(airtable_data))
                    // fs.writeFileSync('openfaas_data.json', JSON.stringifyopenfaas_datafn_status))
                    return [2 /*return*/, combine(airtable_data, openfaas_data)];
                case 3:
                    e_1 = _a.sent();
                    throw new Error('Cannot get OpenFaas or Airtable data - check connections and/or credentials?');
                case 4: return [2 /*return*/];
            }
        });
    });
}
function fetch_airtable() {
    return __awaiter(this, void 0, void 0, function () {
        var url, AIRTABLE_KEY, headers, res, records;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = 'https://api.airtable.com/v0/app2A1oMnkLm1B747/algos';
                    AIRTABLE_KEY = process.env.AIRTABLE_KEY;
                    headers = { Authorization: AIRTABLE_KEY };
                    return [4 /*yield*/, axios_1.default.get(url, { headers: headers })];
                case 1:
                    res = _a.sent();
                    records = lodash_1.get(res, 'data.records', []);
                    if (records) {
                        return [2 /*return*/, records.map(function (record) { return record.fields; })];
                    }
                    return [2 /*return*/, []];
            }
        });
    });
}
function fetch_openfaas() {
    return __awaiter(this, void 0, void 0, function () {
        var url, OPENFAAS_KEY, headers, res, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = 'https://faas.srv.disarm.io/system/functions';
                    OPENFAAS_KEY = process.env.OPENFAAS_KEY;
                    headers = { Authorization: OPENFAAS_KEY };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(url, { headers: headers })];
                case 2:
                    res = _a.sent();
                    //  Check response
                    if (res.data && res.data.length > 0) {
                        return [2 /*return*/, res.data.map(function (fields) { return fields; })];
                    }
                    throw new Error('Missing data from OpenFaas request');
                case 3:
                    e_2 = _a.sent();
                    throw new Error('Missing data from OpenFaas request');
                case 4: return [2 /*return*/];
            }
        });
    });
}
function combine(airtable_data, openfaas_data) {
    var uniq_names = all_unique_names(airtable_data, openfaas_data);
    return uniq_names.map(function (uniq_name) {
        var _a, _b;
        var airtable_record = find_airtable_record_by_name(uniq_name, airtable_data);
        var openfaas_record = find_openfaas_record_by_name(uniq_name, openfaas_data);
        var default_record = {
            function_name: uniq_name,
            missing_from_airtable: lodash_1.isUndefined((_a = airtable_record) === null || _a === void 0 ? void 0 : _a.function_name),
            missing_from_openfaas: lodash_1.isUndefined((_b = openfaas_record) === null || _b === void 0 ? void 0 : _b.image),
            // Airtable
            repo: null,
            hide_from_deploy: null,
            target_image_version: null,
            scale_to_zero: false,
            test_req: null,
            // OpenFaas
            deployed_image_version: null,
            deployed_invocation_count: null,
            available_replicas: null,
        };
        var airtable_fields = ['repo', 'hide_from_deploy', 'target_image_version', 'scale_to_zero', 'test_req'];
        var airtable_properties = lodash_1.pick(airtable_record, airtable_fields);
        var openfaas_fields = ['image', 'invocationCount', 'availableReplicas'];
        var openfaas_properties = lodash_1.pick(openfaas_record, openfaas_fields);
        var renamed_openfaas_properties = {
            deployed_image_version: !lodash_1.isUndefined(openfaas_properties.image) ? openfaas_properties.image : null,
            deployed_invocation_count: !lodash_1.isUndefined(openfaas_properties.invocationCount) ?
                openfaas_properties.invocationCount : null,
            available_replicas: !lodash_1.isUndefined(openfaas_properties.availableReplicas) ?
                openfaas_properties.availableReplicas : null,
        };
        var basic = __assign(__assign(__assign({}, default_record), airtable_properties), renamed_openfaas_properties);
        var computed = compute(basic);
        return __assign(__assign({}, basic), { computed: computed });
    });
}
exports.combine = combine;
function all_unique_names(airtable_data, openfaas_data) {
    var all_names = airtable_data.map(function (airtable_record) {
        return airtable_record.function_name;
    }).concat(openfaas_data.map(function (openfaas_record) {
        return openfaas_record.name;
    })).sort();
    var unique = lodash_1.uniq(all_names);
    return unique;
}
function find_airtable_record_by_name(name, airtable_data) {
    return airtable_data.find(function (r) { return r.function_name === name; });
}
function find_openfaas_record_by_name(name, openfaas_data) {
    return openfaas_data.find(function (r) { return r.name === name; });
}
function compute(basic) {
    var deployed = !!(basic.deployed_image_version !== null);
    var hideable = !!(deployed && basic.hide_from_deploy);
    var running = !!(deployed && basic.available_replicas && basic.available_replicas > 0);
    var sleeping = !!(deployed && (basic.scale_to_zero && basic.available_replicas === 0));
    var testable = !!(deployed && (basic.test_req !== null));
    var upgradable = !!(deployed && (basic.deployed_image_version !== basic.target_image_version));
    var computed = {
        deployed: deployed,
        hideable: hideable,
        running: running,
        sleeping: sleeping,
        testable: testable,
        upgradable: upgradable,
    };
    return computed;
}
