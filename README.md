### Cloud9 Launcher

It's a Nodejs application allows you manage your Cloud9 IDE workflows on your own server without the need of a terminal.

### Install

#### Cloud9 IDE

reference [c9/core](https://github.com/c9/core)

#### Cloud9 Launcher

```sh
git clone https://github.com/ALiangLiang/cloud9-launcher.git
cd cloud9-launcher
cp config/default-0.json5 config/local-0.json5
vim config/local-0.json5 # fill this configure file
npm start
```