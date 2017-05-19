## ️☁️Cloud9 Launcher☁️ (In dev)

It's a Nodejs application allows you manage your Cloud9 IDE workflows on your own server without the need of a terminal.

Read this in other languages: [English](REAMDE.md), [中文](README.zh-tw.md)

![Screenshot](https://raw.githubusercontent.com/ALiangLiang/cloud9-launcher/master/screenshot.png)

### Feature

- Manage your cloud9 processes.
- GUI
- Use basic authorization
- Don't need database to save setting.

### Install

#### Cloud9 IDE

reference [c9/core](https://github.com/c9/core)

#### Cloud9 Launcher

```sh
git clone https://github.com/ALiangLiang/cloud9-launcher.git
cd cloud9-launcher
npm run init
vim ~/.config/configstore/cloud9-launcher.json # fill this configure file
npm start
```

### TODO

- Auto find a port which allow inbound connection.
- Add arguments setting to node or c9.
- Pause c9 process.
- Monitor processes on client side.

### About

This project is reference [c9ui](https://github.com/orditeck/c9ui). Coz I don't want to prepare environment about PHP 😛. BTW, I am not a English-speaker. So if you discover some grammar error, please help me fixed and PR. lol