const App = require("../source/App");

module.exports = async () => {
    require("dotenv").config({ path: __dirname + "/../.test.env" });

    console.log();  // New line
    global.server = new App();
    await global.server.run();
};
