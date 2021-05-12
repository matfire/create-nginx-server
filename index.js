const args = require("arg");
const { execSync } = require("child_process");
const fs = require("fs");

const spec = {
  "--domain": String,
  "--port": String,
};

const createSymLink = (domain) => {
  try {
    execSync(
      `sudo ln -s /etc/nginx/sites-available/${domain}.conf /etc/nginx/sites-enabled`
    );
  } catch (error) {
    console.error(`Could not create symbolic link for domain ${domain}`);
  }
};

const restartNginx = () => {
  execSync("sudo systemctl restart nginx");
};

const generateCertificate = (domain) => {
  execSync(`sudo certbot --nginx --domain ${domain}`);
};

const main = async () => {
  const parsedArgs = args(
    spec,
    (options = { permissive: false, argv: process.argv.slice(2) })
  );
  const sampleFile = fs.readFileSync("./sample_conf.conf");
  const sampleFileString = sampleFile
    .toString()
    .replace("example.com", parsedArgs["--domain"])
    .replace(":1111", ":" + parsedArgs["--port"]);
  try {
    fs.writeFileSync(
      `/etc/nginx/sites-available/${parsedArgs["--domain"]}.conf`,
      sampleFileString
    );
    createSymLink(parsedArgs["--domain"]);
    restartNginx();
    generateCertificate(parsedArgs["--domain"]);
  } catch (error) {
    console.error("something went wrong while trying to execute commands.");
  }
};

main();
