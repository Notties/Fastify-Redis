"use strict";

module.exports = async function (fastify, opts) {
  fastify.get("/", async function (request, reply) {
    return "this is an example";
  });

  fastify.get("/foo", function (req, reply) {
    const { redis } = fastify;
    redis.get(req.query.key, (err, val) => {
      reply.send(
        err || {
          status: "ok",
          data: { key: req.query.key, value: val },
        }
      );
    });
  });

  fastify.post("/foo", function (req, reply) {
    const { redis } = fastify;
    redis.set(req.body.key, req.body.value, (err) => {
      reply.send(
        err || {
          status: "ok",
          data: { key: req.body.key, value: req.body.value },
        }
      );
    });
  });

  fastify.put("/foo/:key", function (req, reply) {
    const { redis } = fastify;
    const keyToEdit = req.params.key;
    const newValue = req.body.value;

    redis.get(keyToEdit, (err, oldValue) => {
      if (err) {
        reply.status(500).send({ error: "An error occurred" });
      } else if (oldValue === null) {
        reply.status(404).send({ error: "Key not found" });
      } else {
        redis.set(keyToEdit, newValue, (err) => {
          if (err) {
            reply.status(500).send({ error: "An error occurred" });
          } else {
            reply.send({
              status: "ok",
              message: `Value of key ${keyToEdit} updated to ${newValue}`,
            });
          }
        });
      }
    });
  });

  fastify.delete("/foo/:key", function (req, reply) {
    const { redis } = fastify;
    const keyToDelete = req.params.key;
    redis.del(keyToDelete, (err, result) => {
      if (err) {
        reply.status(500).send({ error: "An error occurred" });
      } else {
        reply.send({
          status: "ok",
          message: `Key ${keyToDelete} deleted from Redis`,
        });
      }
    });
  });
};

module.exports.autoPrefix = "/index";
