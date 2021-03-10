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
Pour utiliser socket.io il suffit de l'inclure et de créer une instance grâce à l'objet *httpsServer* crée juste avant.
`js let io = require('socket.io')(httpsServer);`

#### 2-A. Côté serveur (app.js)
Le serveur permet de transmettre les messages de contrôle entre nos deux pairs. Récapitulons ce que nous avons vu dans le chapitre précédent.
D'abord nous avons besoin d'envoyer la **Description de la Session** en créant une offre depuis le pair appelant.
Ensuite le pair appelé doit renvoyer une **Réponse contenant sa propre description**.
Et enfin il faut que les pairs puissent s'échanger leur **ICE candidat**.

Nous avons donc besoin de 3 événements que nous appelerons :
- *offer*
- *answer*
- *candidate*

Bien entendu le serveur a besoin d'identifier chacun des pairs avec un identifiant unique, nous utiliserons alors l'ID automatiquement définit par socket.io.

Socket IO s'utilise de la facon suivant :
Pour emettre à un socket spécifique : `js socket.to(socketID).emit("NomDeLEvenement", donnees)`
Pour recevoir : `js socket.on("NomDeLEvenement", (donnees) => {/* traitement des donnees*/ })`

Voici donc le code de notre serveur pour être utilisé comme canal de signalisation :
```js
// A chaque nouvelle connection on crée les événements appropriés.
io.on('connection', socket => {
  console.log("A user connected");
  socket.emit("newUser", "Coucou user :  " + socket.id)

  // Evenement pour l'offre du pair appelant
  socket.on("offer", ({offer, to}) => {
    console.log("Server received offer, transmitting to : ", to)
    socket.to(to).emit("offer", {offer, from: socket.id})
  })
  // Evenement pour la transmission du candidat entre les pairs  
  socket.on("candidate", ({candidate, to}) => {
    console.log("Server received candidate, transmitting to : ", to)
    socket.to(to).emit("candidate", {candidate, from: socket.id})
  })
  // Evenement pour la réponse du pair appelé
  socket.on("answer", ({answer, to}) => {
    console.log("Server received answer, transmitting to : ", to)
    socket.to(to).emit("answer", {answer, from: socket.id})
  })
})
```

Remarque : On ajoutera un message qui affiche à l'utilisateur son propre socket ID afin que celui-ci puisse le communiquer à l'autre pair. Ce dernier pourra alors le contacter au traver de notre serveur de signalisation. 

#### 2-B. Côté client


## 3. ICE Servers

#### 3-A STUN servers

#### 3-B TURN servers
