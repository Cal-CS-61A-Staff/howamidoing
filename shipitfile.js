/* eslint-disable global-require */
module.exports = (shipit) => {
    // Load shipit-deploy tasks
    require("shipit-deploy")(shipit);

    shipit.initConfig({
        deploy: {
            servers: "ee16a@ashby.cs.berkeley.edu",
            key: "~/.ssh/id_rsa",
        },
    });

    shipit.task("default", async () => {
        // await shipit.local("yarn build");
        await shipit.copyToRemote("./deploy", "/home/ff/ee16a/status_check");
        const rawgrep = await shipit.remote("ps ax|grep gunicorn");
        const lines = rawgrep[0].stdout.split("\n");
        const toKill = [];
        for (const line of lines) {
            if (line.includes("status_check")) {
                toKill.push(line.trim().split(" ")[0]);
            }
        }
        for (const pid of toKill) {
            // eslint-disable-next-line no-await-in-loop
            try {
                await shipit.remote(`kill ${pid}`);
            } catch (e) {
                // ignore
            }
        }
        shipit.remote("nohup /home/ff/ee16a/.local/bin/gunicorn"
            + " status_check.deploy.app:app -b"
            + " 0.0.0.0:21618");
    });
};
