'use strict';

const Datastore = require('nedb');

const databases = {};

function query(operation) {
    return (data, database) => {
        if(databases[database] == undefined) {
            databases[database] = new Datastore({ filename: `./db/${database}.db`, autoload: true });
        }
    
        return new Promise((resolve, reject) => {
            databases[database][operation](data, (err, docs) => {
                if(err) {
                    return reject(err);
                }
    
                return resolve(docs);
            });
        });
    }
}

function save(data, database) {
    if(databases[database] == undefined) {
        databases[database] = new Datastore({ filename: `./db/${database}.db`, autoload: true });
    }

    return databases[database].insert(data);
}

function update(selector, data, database) {
    if(databases[database] == undefined) {
        databases[database] = new Datastore({ filename: `./db/${database}.db`, autoload: true });
    }

    return new Promise((resolve, reject) => {
        databases[database].update(selector, data, {}, (err, doc) => {
            if(err) {
                return reject(err);
            }

            return resolve(doc);
        });
    });
}

module.exports = {
    save,
    update,
    find: query('find'),
    findOne: query('findOne')
};