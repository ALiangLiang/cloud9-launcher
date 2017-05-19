## ️☁️Cloud9 Launcher☁️ (開發中)

用圖形化介面管理你所有的 Cloud9 IDE，省下使用 CLI 的麻煩。

其他語言的 README：[English](REAMDE.md), [中文](README.zh-tw.md)

![截圖](https://raw.githubusercontent.com/ALiangLiang/cloud9-launcher/master/screenshot.png)

### 特色

- 管理你的 Cloud9 程序。
- 圖形化介面
- 使用 basic authorization。
- 不需要資料庫來儲存設定。

### 安裝

#### Cloud9 IDE

請參考 [c9/core](https://github.com/c9/core)

#### Cloud9 Launcher

```sh
git clone https://github.com/ALiangLiang/cloud9-launcher.git
cd cloud9-launcher
npm run init
vim ~/.config/configstore/cloud9-launcher.json # 請填寫設定
npm start
```

### TODO

- 自動掃描可以讓外部連入且沒在使用的 port。
- 可以對 node 或 cloud9 使用參數
- 凍結 cloud9 程序。
- 在圖形化介面上監控程序

### 關於

這個專案是啟發自 [c9ui](https://github.com/orditeck/c9ui)，因為我是台灣人，所以這個專案中的英文如果有錯，麻煩幫我修一下順便 PR 上來，拜託各為了QQ