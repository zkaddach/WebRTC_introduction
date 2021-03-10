# RTC Data Channels
WebRTC permet donc la communication en temps-réel en P2P entre des navigateurs web. Jusque là nous avons vu comment envoyer des flux vidéos/audios, maintenant nous allons voir comment envoyer n'importe quelle données.

Pour faire cela, on apprendra à utiliser l'API **RTCDataChannel**.

La encore on utilisera les objets RTCPeerConnection pour permettre la communication entre nos pairs, le code ne diffère pas des chapitres précédants.

## 1. Pair qui envoie le message
Pour envoyer des données avec RTCDataChannel channel, le pair appelant doit créer le "channel" :
```js
/** On crée un data channel pour le pair local.
 * Puis on définit les méthodes permettant de gérer les evenements
 * 'onopen' et 'onclose'. Ces evenements ont lieu lorsque le canal pour
 * transmettre les donnnees est etabli/ferme.
 */
sendChannel = localPc.createDataChannel('sendChannel');
sendChannel.onopen = handleSendChannelStatusChange;
sendChannel.onclose = handleSendChannelStatusChange;
```

Note : Dans la méthode `handleSendChannelStatusChange()` on peut récupérer l'état du channel de la facon suivante
`var state = sendChannel.readyState;`

Puis pour envoyer un message il suffit d'utiliser la méthode `sendChannel.send(monMessage)`.

## 2. Pair qui recoit le message
Pour recevoir et traiter les données recues on utilise la propriété 'ondatachannel' qu'on associe à une méthode callback. A travers celle-ci on récupère l'objet qui represente le channel, et on définit des callback pour traiter l'ouverture et la fermeture du channel et la récéption de message.
```js
/**
 * La propriété 'ondatachannel' permet de gérer l'événement 'datachanne' qui a lieu
 * lorsque un RTCDataChannel est ajouté par le pair distant avec la méthode
 * createDataChannel().
 */
remotePc.ondatachannel = receiveChannelCallback;

/**
 * Methode qui gere l'ajout d'un canal de transmission par le pair distant.
 * ici : On recupere le canal, le message, et on définit les méthodes de gestion
 * d'ouverture et fermeture du canal.
 */
function receiveChannelCallback(event) {
    receiveChannel = event.channel;
    receiveChannel.onmessage = handleReceiveMessage;
    receiveChannel.onopen = handleReceiveChannelStatusChange;
    receiveChannel.onclose = handleReceiveChannelStatusChange;
  }
```
