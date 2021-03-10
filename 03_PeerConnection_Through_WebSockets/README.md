# Peer Connection with WebSockets
Dans ce troisième tutoriel il s'agit, comme précédemment, d'établir la connexion entre deux pairs, afin de faire communiquer des navigateurs en P2P en temps-réel, mais cette fois-ci en reposant sur les WebSockets comme canal de signalisation et non plus sur des "méthodes fictives".

Pour réaliser cela nous devons commencer par mettre en place un serveur NodeJS.

Note importante : Nous devons mettre en place un serveur **HTTPS**. Car l'utilisation de WebRTC doit se faire dans un contexte sécurisé. Ainsi nous commencerons par montrer comment mettre en place un serveur HTTPS.
> A savoir que la connexion *localhost* est considérée comme étant un contexte sécurisé.

<details>
<summary> Prérequis : installation de NodeJS </summary>
Installation des librairies NodeJS avec *npm* suivantes :

**express**
```sh
npm install -S express
```

**socket.io**
```sh
npm install -S socket.io
```
</details>

## 1. Serveur HTTPS avec NodeJS
Nous utiliserons des clés "self-signed" (l'idéal étant d'avoir des clés signés par une autorité...).
Il faut commencer par générer les clés publiques et privées, avec *openssl*.  
Pour plus de détails sur les options sur [linuxize](https://linuxize.com/post/creating-a-self-signed-ssl-certificate/)
```bash
openssl req -newkey rsa:4096 \
            -x509 \
            -sha256 \
            -days 3650 \
            -nodes \
            -out example.crt \
            -keyout example.key
```

Ensuite il suffit d'ouvrir la clé publique et le certificat avec la librairie *js* et on définit un objet credentials comme suit :
```js
var fs = require('fs');

// "Public Self-Signed Certificates" pour la connexion HTTPS
var privateKey  = fs.readFileSync('./certificates/key.pem', 'utf8');
var certificate = fs.readFileSync('./certificates/cert.pem', 'utf8');
// Création de l'objet crédentials avec la clé et le certificat
var credentials = {key: privateKey, cert: certificate};
```

Finallement on peut utiliser notre clé et certificat SSL avec l'objet HTTPS.
```js
// On utilise la librairie express
const express = require('express');
const app = express();
var https  = require('https');

// On crée l'objet https
var httpsServer = https.createServer(credentials, app);
```

## 2. Les WebSockets avec socket.io

#### 2-A. Côté serveur

#### 2-B. Côté client


## 3. ICE Servers

#### 3-A STUN servers

#### 3-B TURN servers
