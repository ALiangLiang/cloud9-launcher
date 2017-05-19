## ️️☁️Cloud9 Launcher☁️ (In dev)

It's a Nodejs application allows you manage your Cloud9 IDE workflows on your own server without the need of a terminal.

### Feature

- Manage your cloud9 processes.
- GUI

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

### TODO

- Authorization
- Auto find a port which allow inbound connection.
- Pause c9 process.
- Save changed settings.
- Monitor processes on client side.

### About

This project is reference [c9ui](https://github.com/orditeck/c9ui). Coz I don't want to prepare environment about PHP 😛. BTW, I am not English-speaker. So if you discover some grammar error, please help me fixed and PR. lol