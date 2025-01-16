import shelljs from 'shelljs';
import axios from 'axios';
import fs from 'fs';

const { exec, cd, mv } = shelljs;

console.log('Welcome to use pake-cli to build app');
console.log('Node.js info in your localhost ', process.version);
console.log('\n=======================\n');
console.log('Pake parameters is: ');
console.log('url: ', process.env.URL);
console.log('name: ', process.env.NAME);
console.log('icon: ', process.env.ICON);
console.log('height: ', process.env.HEIGHT);
console.log('width: ', process.env.WIDTH);
console.log('fullscreen: ', process.env.FULLSCREEN);
console.log('hide-title-bar: ', process.env.HIDE_TITLE_BAR);
console.log('more config: ', process.env.EXT_DATA);
console.log('===========================\n');

cd('node_modules/pake-cli');
let params = `node cli.js ${process.env.URL} --name ${process.env.NAME} --height ${process.env.HEIGHT} --width ${process.env.WIDTH}`;

if (process.env.HIDE_TITLE_BAR === 'true') {
  params = `${params} --hide-title-bar`;
}

if (process.env.FULLSCREEN === 'true') {
  params = `${params} --fullscreen`;
}

const downloadIcon = async iconFile => {
  try {
    const response = await axios.get(process.env.ICON, { responseType: 'arraybuffer' });
    fs.writeFileSync(iconFile, response.data);
    return `${params} --icon ${iconFile}`;
  } catch (error) {
    console.error('Error occurred during icon download: ', error);
  }
};

const main = async () => {
  if (process.env.ICON && process.env.ICON !== '') {
    let iconFile;
    switch (process.platform) {
      case 'linux':
        iconFile = 'icon.png';
        break;
      case 'darwin':
        iconFile = 'icon.icns';
        break;
      case 'win32':
        iconFile = 'icon.ico';
        break;
      default:
        console.log("Unable to detect your OS system, won't download the icon!");
        process.exit(1);
    }

    params = await downloadIcon(iconFile);
  } else {
    console.log("Won't download the icon as ICON environment variable is not defined!");
  }

  // 解析为 JSON
  const extDataJson = JSON.parse(process.env.EXT_DATA);
  if(extDataJson['--multi-arch']){
    exec('rustup target add aarch64-apple-darwin');
    params = `${params} --multi-arch`;
  }
  if(extDataJson['--disabled-web-shortcuts']){
    params = `${params} --disabled-web-shortcuts`
  }
  if (extDataJson['--show-system-tray'] || process.platform === 'win32' || process.platform === 'linux') {
    params = `${params} --show-system-tray`;
  }
  if(extDataJson['--use-local-file']){
    params = `${params} --use-local-file`
  }
  if(extDataJson['--always-on-top']){
    params = `${params} --always-on-top`
  }
  if(extDataJson['--dark-mode']){
    params = `${params} --dark-mode`
  }
  if(extDataJson['--debug']){
    params = `${params} --debug`
  }

  if (extDataJson['--activation-shortcut']) {
    params = `${params} --activation-shortcut=${extDataJson['--activation-shortcut']}`;
  }
  if (extDataJson['--installer-language']) {
    params = `${params} --installer-language=${extDataJson['--installer-language']}`;
  }
  if (extDataJson['--system-tray-icon']) {
    params = `${params} --system-tray-icon=${extDataJson['--system-tray-icon']}`;
  }
  if (extDataJson['--proxy-url']) {
    params = `${params} --proxy-url=${extDataJson['--proxy-url']}`;
  }
  if (extDataJson['--app-version']) {
    params = `${params} --app-version=${extDataJson['--app-version']}`;
  }
  if (extDataJson['--user-agent']) {
    params = `${params} --user-agent=${extDataJson['--user-agent']}`;
  }
  if (extDataJson['--targets']) {
    params = `${params} --targets=${extDataJson['--targets']}`;
  }
  if (extDataJson['--inject']) {
    params = `${params} --inject=${extDataJson['--inject']}`;
  }

  console.log('Pake parameters is: ', params);
  console.log('Compile....');
  exec(params);

  if (!fs.existsSync('output')) {
    fs.mkdirSync('output');
  }
  mv(`${process.env.NAME}.*`, 'output/');
  console.log('Build Success');
  cd('../..');
};

main();
