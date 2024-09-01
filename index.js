const http = require("http");

module.exports = async function (RED) {
    const data1 = JSON.stringify({ "name": "granite-code" });
    const options1 = {
        hostname: "localhost",
        port: 11434,
        path: "/api/pull",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": data1.length
        }
    };

    RED.log.info("loading model...");
    const req1 = http.request(options1, function (res1) {
        res1.on("data", function (chunk) {
            let status = JSON.parse(chunk);
            RED.log.info("downloding model... " + parseInt(100 * status.completed / status.total) + "%");
        });
        res1.on("end", function () {
            RED.log.info("model for codecompletion is loaded");
            RED.comms.publish('completion', { "message": "model for code completion is loaded" });
        });
    });

    req1.on("error", function (error) {
        RED.log.info("failed to connect to Ollama server");
        RED.comms.publish('completion', {
            "message": "failed to connect to Ollama server",
            "options": { "type": "error" }
        });
    });
    req1.write(data1);
    req1.end();

    RED.httpAdmin.post("/completion", RED.auth.needsPermission("completion.write"), async function (req, res) {
        let code = req.body.code;
        code = code.replace("\nreturn msg;", "");

        const data2 = JSON.stringify({
            "model": "granite-code",
            "raw": true,
            "keep_alive": 1800,
            "options": {
                "temperature": 0.01,
                "num_predict": 1024,
                "stop": [
                    "<fim_prefix>",
                    "<fim_suffix>",
                    "<fim_middle>",
                    "<|endoftext|>",
                    "<file_sep>",
                    "</fim_middle>",
                    "</code>",
                    "\n\n",
                    "\r\n\r\n",
                    "/src/",
                    "#- coding: utf-8",
                    "```",
                    "t.",
                    "\nt",
                    "<file_sep>",
                    "\nfunction",
                    "\nclass",
                    "\nmodule",
                    "\nexport",
                    "\nimport"
                ],
                "num_ctx": 4096
            },
            "prompt": "<fim_prefix>" + code + "<fim_suffix><fim_middle>"
        });

        const options2 = {
            hostname: "localhost",
            port: 11434,
            path: "/api/generate",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": data2.length
            }
        };

        RED.log.info("generating code...");
        const req2 = http.request(options2, function (res2) {
            let completion = "";
            res2.on("data", function (chunk) {
                let parsedChunk = JSON.parse(chunk);
                if (parsedChunk.error) {
                    RED.log.info(parsedChunk.error);
                    RED.comms.publish('completion', {
                        "message": parsedChunk.error,
                        "options": { "type": "error" }
                    });
                } else if (parsedChunk.response) {
                    completion += parsedChunk.response;
                }
            });
            res2.on("end", function () {
                completion = completion.replace(/console.log/g, "node.warn");
                res.json({ "completion": completion });
            });
        });

        req2.on("error", function (error) {
            RED.log.info("failed to connect to Ollama server");
            RED.comms.publish('completion', {
                "message": "failed to connect to Ollama server",
                "options": { "type": "error" }
            });
        });
        req2.write(data2);
        req2.end();
    });

    RED.plugins.registerPlugin("completion", { type: "completion" });
};