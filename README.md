# landleg-node

地腿 Node.js 版本

**需要 Node.js 环境: [https://nodejs.org/zh-cn/download/](https://nodejs.org/zh-cn/download/)**

## 安装 & 使用

### 安装
```
$ npm install landleg -g
```

### 使用
```
# 登录
# 第一次运行需要填写账号密码
$ landleg 

# 填写账号密码登录（第一次使用或需要修改账号密码时使用）
$ landleg --login 
OR
$ landleg -i

# 直接设置账号密码登录（第一次使用或需要修改账号密码时使用）
$ landleg --login username@password
OR
$ landleg -i username@password

# 注销
$ landleg --logout
OR
$ landleg -o
```

将会把账号密码保存在 HOME 目录下的 `landleg.yml` 中（Linux / Mac 用户：`/User/xxxx/landleg.yml`，Windows 用户：`C:/Users/xxxx/landleg.yml`）

## 关于
该项目参考自 [xfkencon](https://github.com/xfkencon) 的 [land-leg-PY](https://github.com/xfkencon/land-leg-PY) 项目。