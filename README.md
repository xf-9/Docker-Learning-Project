# Docker Learning Project
---
## 这是一个 Docker Learning Project
该项目的目的是学习Docker的基本知识、如何使用Docker容器来运行MongoDB及其管理界面MongoDB Express、以及如何使用Docker Compose来管理多容器应用。
详细教程请查看 **Docker Learning Project.mb**

### 目录：
1. [安装 WSL 与 Docker Desktop](#1-安装-docker-desktop-和-wsl)
2. [该项目中可能会遇到的问题](#2-该教程中可能会遇到的问题)
3. [Amazon Web Services（AWS）](#3-amazon-web-services-aws)
4. [Docker Commands](#4-docker-commands)
5. [创建 MongoDB 和 MongoDB Express 容器](#5-创建-mongodb-和-mongodb-express-容器)
6. [Docker Compose](#6-docker-compose)
7. [Dockerfile](#7-dockerfile)
8. [使用 Docker Compose 同时启动 Demo 应用程序，MongoDB 和 MongoDB Express](#8-使用docker-compose-同时启动demo应用程序-mongodb-和-mongodb-express)


---
## 1. 安装 **Docker Desktop** 和 **WSL**

- Docker 安装教程（请仔细阅读**系统要求**）：https://docs.docker.com/desktop/install/windows-install/  
- Docker Desktop 安装：https://www.docker.com/products/docker-desktop/
- WSL 安装：https://learn.microsoft.com/en-us/windows/wsl/install
---
## 2. 该教程中可能会遇到的问题
### Docker 问题
- **问题示例图 1**
![图片描述](./picture/IMG_3078.png){:width="500px" height="300px"} 
- **问题示例图 2**
![图片描述](./picture/IMG_3079.png){:width="500px" height="300px"} 
- **遇到 问题示例图 1 和 问题示例图 2 中的错误时，请重装 WSL** 
  <br>

### MongoDB 问题
- **问题示例图 3**
![图片描述](./picture/IMG_3080.png){:width="500px" height="300px"} 
- **问题示例图 4**
![图片描述](./picture/IMG_3081.png){:width="300px" height="200px"} 
**当 MongoDB 容器名为 mongodb，且 Mongo Express 的环境变量 ME_CONFIG_MONGODB_SERVER 也设置为 mongodb 时，Mongo Express 日志中会出现 “mongo: Name does not resolve” 错误**
<br>

### Demo 应用程序

如果 Demo 应用程序未设置环境变量（用于识别当前运行环境是在本地还是在容器中），那么在容器化后将无法正确连接到 MongoDB。原因如下：

1. 本地运行时，localhost:3000 指向宿主机的端口 3000，应用程序可以直接访问本地 MongoDB 服务。

2. 容器中运行时，localhost:3000 指向的是容器自身的端口 3000，而不是宿主机或其他容器的端口。因此，在 Docker 容器中运行的应用无法通过 localhost 连接到 MongoDB 容器。

3. 为了使应用程序能够在容器中访问 MongoDB 容器，应用代码中需要根据环境动态设置 MongoDB 连接字符串。在容器中运行时，应使用 MongoDB 容器的服务名称（例如 mongo）而不是 localhost。

代码示例：
正确的代码（自动检测环境）：

<details>
  <summary>点我展开查看正确的Demo应用程序代码</summary>
  <pre><code>

// Demo应用程序中，根据环境选择MongoDB连接字符串
let mongoUrl = process.env.NODE_ENV === 'production' ? 
  "mongodb://admin:password@mongo:27017" : // 生产环境：连接Docker中的MongoDB
  "mongodb://admin:password@localhost:27017"; // 本地开发环境：连接本地MongoDB
  
</code></pre>
</details>

Dockerfile设置：
<details>
  <summary>点我展开看Dockerfile的代码</summary>
  <pre><code>

ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PWD=password \
    NODE_ENV=production 
通过在 Dockerfile 中设置 NODE_ENV=production，应用在 Docker 环境中会选择 mongoUrlDocker，从而通过服务名 mongo 连接 MongoDB 容器。
  
</code></pre>
</details>

<br>
错误的代码（未检测环境）：
如果未根据环境动态选择连接字符串，应用程序会始终使用 mongoUrlLocal：

<details>
  <summary>点我展开查看错误的Demo应用程序代码</summary>
  <pre><code>
// 固定使用本地MongoDB连接字符串
let mongoUrlLocal = "mongodb://admin:password@localhost:27017";
由于 Dockerfile 中没有设置 NODE_ENV 或类似变量，容器化后的应用程序无法识别其运行在 Docker 环境中，因此仍然会试图使用 localhost 连接数据库，而无法连接到 MongoDB 容器。

</code></pre>
</details>


---
## 3. Amazon Web Services (AWS)

- ### 在WSL中验证AWS Credential
  - <https://www.youtube.com/watch?v=vZXpmgAs91s&t=321s> 

---

- ### Push 镜像到 AWS Elastic Container Registry 中
  - AWS: Push a Docker image <https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html>
1. 在 WSL中输入 Docker Login 登录到 Docker Hub。
2. 验证AWS Credential
3. 登录到AWS官网，然后在右上方的搜索框中搜索 Elastic Container Registry，进入仓库页面。如果没创建过仓库，则在右边点击 **Create Repository** 来创建仓库并命名为 my-app（仓库名一般使用的是程序的名字）。
 4. 进入 my-app 仓库，在右上方点击 **View Push Command** , 复制第一个行用于验证身份的代码到WSL。
 5. 身份验证成功后，通过Docker Build 命令创建出想要上传的镜像
 6. 复制 **View Push Command** 着 第3步的代码来将刚创建的镜像标记。类似这样：docker tag `<ImageName>`:`<version1>` 878787878787.dkr.ecr.us-east-1.amazonaws.com/my-app:`<version2>`。这里imageNmae和version1 是Docker中的镜像名和tag，version2则是 aws 仓库中 image tag。
 7. 标记好镜像就可以通过 **View Push Command** 中的第四步的代码来讲镜像Push到AWS仓库中。类似：docker push 878787878787.dkr.ecr.us-east-1.amazonaws.com/my-app:`<version>`.
- **镜像** 会根据**AWS**设置的当前地区来 **Push** 到特定地区的 **Repository** 中，比如上面就会 **Push** 到**us-east**地区中。在其他地区中 **Repository** 是看不到该镜像的。
---

## 4. Docker Commands
以下是接下来会用到Docker指令 在下面所有代码中 [] 内的都是可选选项,这里只会写每个指令的一部分选项。 在Linux中 CTRL + C 可以终止当前在终端中运行的进程。

- **拉取镜像**：Docker pull `<imageName>`[:`<version>`] , Docker pull 会从Docker Hub 或其他指定仓库中拉取Docker image，标签是个可选选项，默认是拉取latest version，例如 docker run redis:7.4.1 则会指定拉取redis 7.4.1版。
- **创建容器**：Docker run [--name] [-d] [-e] [--net] [-p] `<imageName/imageID>` --name 用于给容器指定一个名字。-d 选项会让容器在后台运行。 -e 设置环境变量。-p 将host的端口绑定到容器的端口上。--net绑定容器到指定网络中。
- **启动容器**：Docker start `<ContainID/Name>`
- **停止容器**：Docker stop [-f] `<ContainID/Name>`, -f可以强制终止一个或多个Docker容器
- **删除容器**：Docker rm [-f] `<ContainID/Name>`, -f可以强制终止一个或多个Docker容器
- **删除镜像**： Docker rmi `<imageName/imageID>`
- **查看当前Docker主机上所有的网络**：Docker network ls
- **创建网络**：Docker network create `<networkName>`
- **删除网络**：Docker network rm `<networkName>`
- **查看指定网络的详细信息**（网络的各项属性和关联的容器）：Docker inspect `<netwowrkName>`
- **查看当前运行的容器**: Docker ps [-a], -a可以查看当前停止的容器
- **查看当前存在的镜像**：Docker images
- **查看容器的日志**：Docker logs `<ContainID/Name>`
- **查看容器信息**：Docker inspect `<ContainName/ID>`
- **命令一个运行中的容器内执行命令**：Docker exec [-it] `<ContainID/Name>`, -it 进行交互式，与/bin/bash一起使用可启动交互式终端，例如 docker exec -it <容器ID或名称> /bin/bash （当没有bash时：docker exec -it <容器ID或名称> /bin/sh）
- **Docker Compose启动**：Docker-compose -f `<DockerComposeFile>` up -d，-f选项用于指定一个Compose文件的路径或名字
- **创建镜像**：Docker build -t `<ImageName>`:`<version>` . ，-t选项用于指定镜像的名称和标签。**.**表示当前目录，这意味着该Docker build指令会根据当前目录下的Dockerfile来创建镜像。
 ---
## 5. 创建 MongoDB 和 MongoDB express 容器
 - **Good to know about how to Run MongoDB in Docker** <https://www.youtube.com/watch?v=gFjpv-nZO0U&t=1s>
1. **获取镜像**：通过在WSL终端中输入`docker pull mongo`和`docker pull mongo-express`来获取最新的Mongo和Mongo Express镜像。（`docker pull mongo-express:<version>`来获取指定的版本）
2. **创建网络**：`docker network create mongo-network`
3. **须知Mongo的默认通信端口是27017，Mongo Express的默认通信端口是8081**
4. **创建Mongo容器**
代码：`docker run -d \ #(\ 可以在命令行中作为“续行符”，表示命令在下一行继续。这在编写多行脚本或长命令时非常有用。)`
&emsp;&emsp;&emsp;`-p27017:27017 \ # 将容器的端口映射到本地，Local:Container`
&emsp;&emsp;&emsp;`-e MONGO_INITDB_ROOT_USERNAME=admin \ # Mongo的环境变量Root的用户名等于admin，现实中应该用其他更高安全性的用户名`
&emsp;&emsp;&emsp;`-e MONGO_INITDB_ROOT_PASSWORD=password # Mongo的环境变量Root的密码，这里password是因为这是个示例。现实中应该使用安全性更高的密码\`
&emsp;&emsp;&emsp;`--name mongo \ # 指定容器名`
&emsp;&emsp;&emsp;`--net mongo-network \ # 指定使用哪个网络`
&emsp;&emsp;&emsp;`mongo # 选择使用mongo镜像`
5. **创建Mongo Express**
代码：`docker run -d `
&emsp;&emsp;&emsp;`-p8081:8081 \`
&emsp;&emsp;&emsp;`-e ME_CONFIG_MongoDB_ADMINUSERNAME=admin \ # 用于与MongoDB进行连接的用户名。请确保该用户存在MongoDB中，以及拥有足够的权限访问希望管理的数据库和集合`
    - **`一般这里ME_CONFIG_MongoDB_ADMINUSERNAME和其PASSWORD会与Mongo容器里的MONGO_INITDB_ROOT_USERNAME一致，这样可以确保Mongo Express能够以管理员身份访问 MongoDB （ME_CONFIG_MongoDB_ADMINUSERNAME和Password应该等于MongoDB中管理员用户）`**
`-e ME_CONFIG_MongoDB_ADMINPASSWORD=password \ `
`-e ME_CONFIG_MongoDB_SERVER=mongo \ # 这个变量的名字应与Mongo容器名一致`
`-e ME_CONFIG_BASICAUTH_USERNAME=test \ # 设置基本认证用户，以便可以在Localhost:8081访问该数据库`
`-e ME_CONFIG_BASICAUTH_PASSWORD=1234 \ # 基本认证用户在 Mongo Express 中的作用是增加一层安全保护，确保只有授权用户才能访问和管理 MongoDB 数据库`
`--net mongo-network \ `
`--name mongo-express \`
`mongo-express`
6. **验证MongoDB Express是否正常启动**：在浏览器中访问 localhost:8081(localhost:Express的端口)以验证MongoDB Express是否正常启动。如果MongoDB Express正常启动的话，这里会要求账号密码，只需要输入基本认证用户和密码即可。
**默认情况下，Docker 容器中的数据是临时性的。所以每次容器停止或删除是，其中的数据会被清空。除非使用卷（Volume）进行数据持久化**
---
## 6. Docker Compose
- Docker Compose 是一个用于定义和管理多容器 Docker 应用的工具。它通过 YAML 文件 (docker-compose.yml) 定义应用的服务、网络和存储卷等配置，允许用户使用一条命令便能启动、停止和管理这些多容器应用。  

### 使用Docker Compose 同时启动MongoDB 和 MongoDB Express
1. **创建YAML/YML文件**：在当前或指定目录下创建一个空的文件夹，通过 VScode 在该文件夹中创建一个以`.yaml`或`.yml`作为文件扩展名的文件。在这里我创建了 `docker-compose.yaml`
2. **编写Docker Compose的代码**：

<details>
  <summary>点我展开看代码</summary>
  <pre><code>
 # 注意在Compose文件中代码的缩进很重要，因为它代表着层次结构。
 # 定义Compose文件所以使用的配置版本（通常使用最新的版本）
version: '3'
 # 定义应用中的所有服务，每个服务会运行在独立的容器中。
services:
  # 容器的名字
  mongo:
    # 使用官方 MongoDB 镜像
    image: mongo
    # 设置端口
    ports:
      # 映射主机的 27017 端口到容器的 27017 端口
      - 27017:27017
    # 设置环境变量
    environment:
      # MongoDB root 用户名
      - MONGO_INITDB_ROOT_USERNAME=admin
      # MongoDB root 密码
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      # 持久化 MongoDB 数据
      - mongo-data:/data/db
  mongo-express:
    image: mongo-express
    restart: always # 解决因MongoDB未启动引起的MongoNetworkError，MongoDB Express比MongoDB先启动就会收到该错误
    ports:
      - 8080:8081
    environment:
      - ME_CONFIG_MongoDB_ADMINUSERNAME=admin
      - ME_CONFIG_MongoDB_ADMINPASSWORD=password
      - ME_CONFIG_MongoDB_SERVER=mongo
      - ME_CONFIG_BASICAUTH_USERNAME=mick
      - ME_CONFIG_BASICAUTH_PASSWORD=1234
# 挂载卷
volumes:
  mongo-data:
  # 使用本地驱动持久化数据
    driver: local

</code></pre>
</details>

&emsp;&emsp;3. **运行Docker Compose文件**：在WSL中输入 `Docker-compose -f docker-compose.yaml up`
&emsp;&emsp;4. **验证MongoDB Express是否正常启动**：使用浏览器访问 `localhost:8080` 来验证容器是否正常启动了
&emsp;&emsp;5. **关闭容器**：在WSL中输入 `Docker-compose -f docker-compose.yaml down`即可一次性关闭该文件中所有容器。

---
## 7. Dockerfile
- Dockerfile 是一个文本文件，用于定义如何构建一个 Docker 镜像。通过 Dockerfile，开发者可以指定要安装的软件、环境变量、复制的文件、运行的命令等，以构建一个包含所有依赖和配置的可移植应用环境。

**创建Dockerfile**：在VScode中新建一个文件并给该文件命名为Dockerfile即可。成功后该文件会在VScode的资源管理器中该文件前缀会有一条蓝色小鲸鱼的图标（如果没有显示小鲸鱼可以在VScode扩展中Docker扩展）。

### 使用Dockerfile将Demo程序做成镜像
1. **创建Dockerfile**
2. **编写Dockerfile代码**：
 <details>
  <summary>点我展开看代码</summary>
  <pre><code>
 # 指定基础镜像，由于该Demo程序是Javascript，所有这里使用Node.js镜像
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
 # 设置工作目录为 /home/app。如果不设置工作目录，则需要在CMD指令中添加/home/app路径到 server.js 前面。因为 Docker 默认的工作目录是根目录。
WORKDIR /home/app
 # 安装应用依赖
RUN npm install --production # 仅安装生产环境依赖（可选）
 # 指定容器启动时执行的命令
CMD ["node", "server.js"]


</code></pre>
</details>  

&emsp;&emsp;3. **创建镜像**：确保在WSL中当前目录中有Dockerfile文件，如果没有，通过 `cd` command 移到具有Dockerfile的目录中。如果当前目录下有Dockerfile，则在终端中输入`Docker build -t my-app:1.0 .`来创建镜像。

### Demo应用程序 + MongoDB + MongoDB Express
1. **启动MongoDB 和MongoDB Express容器**：在WSL终端中通过`Docker-compose`指令来启动含有MongoDB和MongoDB Express的Compose文件。Compose文件会在启动容器时同时创建一个网络，并且创建的容器将会使用该网络。
2. **创建数据库**：在浏览器中通过 `localhost:8080` 端口访问 MongoDB Express，并在里面创建名为 my-db 的数据库，以及在 my-db 数据库中创建 users 的集合。
3. **创建Demo应用程序的容器**：通过这段代码`Docker run -d -p 3000:3000 --net <Compose文件创建的网络> --name app my-app:2.1`创建该应用程序的容器，并绑定端口和网络（网络需要和MongoDB是同一个）
4. **访问Demo应用程序**：在浏览器中输入`localhost:3000`可以访问Demo应用程序。该应用程序的 `Edit Profile` 键可修改 `Name` `Email` `Interests`。并且修改的数据可以通过 `localhost:8080`看到。
   
---
## 8. 使用Docker compose 同时启动Demo应用程序 MongoDB 和 MongoDB Express
代码：
 <details>
  <summary>点我展开看代码</summary>
  <pre><code>
version: '3'
services:
  my-app:
    image: my-app:1.1 # Node.js 应用镜像
    ports:
      - 3000:3000 # 映射主机的 3000 端口到容器的 3000 端口
    depends_on:
      - mongo # 确保在 my-app 启动前 mongo 容器已启动
    environment:
      - NODE_ENV=production # 设置环境变量
  mongo:
    image: mongo # 使用官方 MongoDB 镜像
    ports:
      - 27017:27017 # 映射主机的 27017 端口到容器的 27017 端口
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin # MongoDB root 用户名
      - MONGO_INITDB_ROOT_PASSWORD=password # MongoDB root 密码
    volumes:
      - mongo-data:/data/db # 持久化 MongoDB 数据
  mongo-express:
    image: mongo-express # 使用官方 Mongo Express 镜像
    restart: always # 确保 Mongo Express 总是重启
    ports:
      - 8080:8081 # 映射主机的 8080 端口到容器的 8081 端口
    depends_on:
      - mongo    
    environment:
      - ME_CONFIG_MONGODB_ADMINUSERNAME=admin # Mongo Express 连接 MongoDB 的用户名
      - ME_CONFIG_MONGODB_ADMINPASSWORD=password # Mongo Express 连接 MongoDB 的密码
      - ME_CONFIG_MONGODB_SERVER=mongo # MongoDB 容器名称
      - ME_CONFIG_BASICAUTH_USERNAME=test # Mongo Express 的基本认证用户名
      - ME_CONFIG_BASICAUTH_PASSWORD=1234 # Mongo Express 的基本认证密码

volumes:
  mongo-data:
    driver: local # 使用本地驱动持久化数据

</code></pre>
</details>  











