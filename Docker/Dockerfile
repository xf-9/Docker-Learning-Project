# 指定基础镜像
FROM node:13-alpine

# 设置环境变量
ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PWD=password \
    NODE_ENV=production 
# 可选，设置应用运行环境为生产

# 创建应用目录
RUN mkdir -p /home/app

# 将应用代码复制到容器内
COPY ./app /home/app

# 设置工作目录为 /home/app
WORKDIR /home/app

# 安装应用依赖
RUN npm install --production # 仅安装生产环境依赖（可选）

# 指定容器启动时执行的命令
CMD ["node", "server.js"]
