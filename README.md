# Introduction à WebRTC
Ce projet est un workshop introductif à WebRTC. Nous allons dans un premier temps définir ce qu'est WebRTC
puis nous présenterons le programme de ce workshop.

+ L'objectif à la fin de ce workshop étant de développer une application web utilisant WebRTC.

## Définitions
WebRTC permet l’échange de données en temps réel et de pair à pair (P2P) entre les navigateurs web.
Les composants nécessaires à cela sont implémentés dans les navigateurs et peuvent être utiliser à travers des APIs en JavaScript.

Construit à travers 3 principales APIs :
- API d’accès aux appareils (caméra, microphone, écran).
- API pour se connecter à un autre utilisateur et communiquer des flux audios et vidéos en temps-réel.
- API pour communiquer n’importe quelles données.

On retrouve ses APIs à travers trois objets qui sont respectivement MediaStream, RTCPeerConnection et RTCDataChannel.

## Agenda
1. MediaStream pour accéder aux appareils de l'utilisateur.
2. RTCPeerConnection pour la communication P2P entre navigateurs (en local).
3. RTCPeerConnection pour la communication P2P entre navigateurs (avec les websockets).
4. RTCDataChannel pour transmettre n'importe quelles données.
5. Réalisation d'une application web simple avec WebRTC.
