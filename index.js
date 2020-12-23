const Discord = require("discord.js");
const client = new Discord.Client();
var prefix = "/";
let SalonMembres = "0";
let reactionMessages = [];
client.login(process.env.TOKEN);
const fs = require('fs');
client.setMaxListeners(30);

//les fichiers ne se modifientpas sur github, créer une bas de données mySQL grâce a heroku addons

//on ready
client.on("ready", () => {
  console.log("Working")
  client.user.setPresence({
    game: {
        name: "/help pour de l'aide",
        type: "Playing",
        url: "https://discordapp.com/"
    }
});
  //ajout des messages au cache 
  let tableauDataAutorole = fs.readFileSync("data_autorole.txt", "utf-8").split("\n");  //tableauDataAutorole contiendra les lignes du fichier texte data
  let avancement_cache = 0;
  for(var i = 0;  i < tableauDataAutorole.length; i++){
    if(tableauDataAutorole[i] != ""){
      client.guilds.cache.find(guild => guild.id === tableauDataAutorole[i].split("&@")[0]).channels.cache.find(channel => channel.id === tableauDataAutorole[i].split("&@")[1]).messages.fetch(tableauDataAutorole[i].split("&@")[2]).then(message => {
        avancement_cache++
        console.log(avancement_cache + "/" + (tableauDataAutorole.length-1))
      }).catch(err => {
        console.log(err)
      });
    }
  }

});




//ajout d'une réaction                                                          nice v12
client.on("messageReactionAdd", (reaction, user) => {
  console.log("Reaction ajoutée")
  reactionMessages = [];    //réinitialisation du tableau contenant les réactions
  let tableauDataAutorole = fs.readFileSync("data_autorole.txt", "utf-8").split("\n");  //tableauDataAutorole contiendra les lignes du fichier texte data
  for(var i = 0;  i < tableauDataAutorole.length; i++){
    if(tableauDataAutorole[i] != ""){
      reactionMessages.push([tableauDataAutorole[i].split("&@")[0],tableauDataAutorole[i].split("&@")[1],tableauDataAutorole[i].split("&@")[2],tableauDataAutorole[i].split("&@")[3]]) //ajout de la data au tableau des réactions
    }
  }
  if(user.bot)return  //si l'utilisateur est un bot, stopper;
    reactionMessages.forEach((e) => {
      if(reaction.message.guild.id === e[0] && reaction.message.channel.id === e[1] && reaction.message.id === e[2]){
        if(reaction.emoji.name === e[3].split(",")[0].split(":")[1] || reaction.emoji.name === e[3].split(",")[0]){
            //si message trouvé dans le tableau

        if(reaction.message.guild.roles.cache.find(role => role.name === e[3].split(",")[1])){  //si role trouvé, l' ajouter a l'utilisateur
          var member = reaction.message.guild.members.cache.find(member => member.id === user.id);
          var role = member.guild.roles.cache.find(role => role.name === e[3].split(",")[1]);
          member.roles.add(role);
          console.log("Rôle ajouté à " + user.username)
        }
        else{
          console.log("Role non trouvé")
        }
      }
    }
    })
});


//suppression d'une réaction                                                      nice v12
client.on("messageReactionRemove", (reaction, user) => {
  console.log("Réaction retirée")
  reactionMessages = [];    //réinitialisation du tableau contenant les réactions

  let tableauDataAutorole = fs.readFileSync("data_autorole.txt", "utf-8").split("\n");  //tableauDataAutorole contiendra les lignes du fichier texte data
  for(var i = 0;  i < tableauDataAutorole.length; i++){
    if(tableauDataAutorole[i] != ""){
      reactionMessages.push([tableauDataAutorole[i].split("&@")[0],tableauDataAutorole[i].split("&@")[1],tableauDataAutorole[i].split("&@")[2],tableauDataAutorole[i].split("&@")[3]]) //ajout de la data au tableau des réactions
    }
  }
  if(user.bot)return  //si l'utilisateur est un bot, stopper;
    reactionMessages.forEach((e) => {
      if(reaction.message.guild.id === e[0] && reaction.message.channel.id === e[1] && reaction.message.id === e[2]){
        if(reaction.emoji.name === e[3].split(",")[0] || reaction.emoji.name === e[3].split(",")[0].split(":")[1]){
          var member = reaction.message.guild.members.cache.find(member => member.id === user.id);
          var role = member.guild.roles.cache.find(role => role.name === e[3].split(",")[1]);
          if(member.roles.cache.has(role.id)){
            member.roles.remove(role.id);
            console.log("Rôle retiré à " + user.username)
          }
        }
      }
      else{
        //message non trouvé dans le tableau
        //console.log("message non trouvé");
      }
    })
});



// arrivée sur un serveur                                 nice v12
client.on("guildCreate", guild => {
  let defaultChannel = "";
  guild.channels.cache.forEach((channel) => {
  if(channel.type == "text" && defaultChannel == "") {
    if(channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
      defaultChannel = channel;
    }
  }
})
defaultChannel.send(prefix + "help")
});


//quand on rejoins                                                                 nice v12

client.on("guildMemberAdd", user =>{        
  let tableauDataMember = fs.readFileSync("data_member_channels.txt", "utf-8").split("\n");
  for(var i = 0;  i < tableauDataMember.length; i++){
    if(tableauDataMember[i] != ""){
      if(tableauDataMember[i].split("&@")[0] === user.guild.id){
        SalonMembres = tableauDataMember[i].split("&@")[1];
      }
    }
  }
  if(user.guild.channels.cache.find(channel => channel.name === SalonMembres)){                                   
    const embedJoin = new Discord.MessageEmbed()
      .setColor("#2feec3")
      .setAuthor(user.user.username, user.user.displayAvatarURL)
      .setDescription("**" + user.user.username + "** est arrivé sur **" + user.guild.name + "**,\n"
      + " nous sommes **" + user.guild.memberCount + "** sur le serveur 🤗!")
      .setFooter("(ಠ⌣ಠ)")
    user.guild.channels.cache.find(channel => channel.name === SalonMembres).send(embedJoin);

  /*  if(user.guild.roles.cache.find(role => role.name === "Membres")){
      user.roles.add(user.guild.roles.cache.find(role => role.name === "Membres")).catch(console.error);
    }
    else{
      user.guild.roles.create({
        data : {
          name: 'Membres',
          color : 'white',
        }
      })
        user.roles.add(user.guild.roles.cache.find(role => role.name === "Membres")).catch(console.error);
    }
    */
  }
});


//quand on quitte                                                                        nice v12

client.on("guildMemberRemove", user =>{
  let tableauDataMember = fs.readFileSync("data_member_channels.txt", "utf-8").split("\n");
  for(var i = 0;  i < tableauDataMember.length; i++){
    if(tableauDataMember[i] != ""){
      if(tableauDataMember[i].split("&@")[0] === user.guild.id){
        SalonMembres = tableauDataMember[i].split("&@")[1];
      }
    }
  }
  if(user.guild.channels.cache.find(channel => channel.name === SalonMembres)){  
    const embedLeave = new Discord.MessageEmbed()
      .setColor("#ec0808")
      .setAuthor(user.user.username, user.user.displayAvatarURL)
      .setDescription("Sniff..." + user.user.username + " est reparti 🙁")
      .setFooter("(ಠ⌣ಠ)")
    user.guild.channels.cache.find(channel => channel.name === SalonMembres).send(embedLeave);
  }
});



//commande hello                                                          nice v12
client.on("message", message =>{
    if(!message.guild) return
    if(message.content.indexOf(prefix + "hello") == 0){
      message.channel.send("Bonjour " + message.author.username + "!")
    }
});

//commande msg                                                        nice v12
client.on("message", message =>{
  if(!message.guild) return
  if(message.content.indexOf(prefix + "msg") == 0){
    if(message.member.hasPermission("MANAGE_MESSAGES")){
     let messageClient = message.content;
      message.delete();
      message.channel.send(messageClient.substr(4))
    }
  else{
  message.channel.send("Vous n'avez pas la permission.")
  }
}
});

//commande clear                                                  nice v12
client.on("message", message =>{
  if(!message.guild) return
  if(message.content.indexOf(prefix + "clear") == 0){
    if(message.member.hasPermission("MANAGE_MESSAGES")){
      message.delete().catch(err => console.log("Erreur dans la commande clear : " + err));
      let args = message.content.trim().split(/ +/g);
      if(args[1]){
        if(!isNaN(args[1]) && args[1] >= 1 && args[1] <= 99){
          message.channel.bulkDelete(args[1]);
        }
        else{
          message.channel.send("Veuillez entrer un nombre entre 1 et 99.");
        }
      }
    }
    else{
      message.channel.send("Vous n'avez pas la permission.")
    }
  }
});

//commande test                                                       nice v12
client.on("message", message =>{
  if(!message.guild) return
  if(message.content.indexOf(prefix + "test") == 0){
    const embed = new Discord.MessageEmbed()
    .setColor("#00FF3F")
    .setTitle('Test execution 5/5')
    .setFooter("(ಠ⌣ಠ)")
    message.channel.send(embed);
    message.delete();
  }
});



//commande kick (expulser)                                                          nice v12
client.on("message", message =>{
  if(!message.guild) return
  if(message.content.indexOf(prefix + "kick") == 0){
    if(message.member.hasPermission("KICK_MEMBERS")){
     if(message.mentions.users.size === 0){
      return message.channel.send("Vous n'avez pas mentionné d'utilisateur");
     }
     else{
       let kick = message.guild.member(message.mentions.users.first());
        if(!kick){
         return message.channel.send("Utilisateur introuvable.");
       }
      if(kick.kickable){
        if(kick.roles.highest.position < message.member.roles.highest.position){
          kick.kick().then(member =>{
          let kickEmbed = new Discord.MessageEmbed()
            .setColor("#ec0808")
            .setAuthor(member.user.username, member.user.displayAvatarURL)
            .setDescription(member.user.username + " a été expulsé par " + message.author.username)
            .setFooter("(ಠ⌣ಠ)")
          message.channel.send(kickEmbed);
          message.delete();
        })
      }
      else{
        let kickEmbed = new Discord.MessageEmbed()
        .setColor("#ec0808")
        .setDescription("Vous ne pouvez pas expulser **" + kick.user.username + "** (hiérarchie)")
        .setFooter("(ಠ⌣ಠ)")
        message.channel.send(kickEmbed);
        message.delete();
      }
    }
    else{
      let kickEmbed = new Discord.MessageEmbed()
      .setColor("#ec0808")
      .setDescription("Je ne peux pas expulser **" + kick.user.username + "** (hiérarchie)")
      .setFooter("(ಠ⌣ಠ)")
      message.channel.send(kickEmbed);
      message.delete();
    }
    }
  }
  else{
   message.channel.send("Vous n'avez pas la permissions.")
  }
}
});

//commande mute                                                     nice v12
client.on("message", message =>{
  if(!message.guild) return
  if(message.content.indexOf(prefix + "mute") == 0){
    if(message.member.hasPermission("MANAGE_MESSAGES")){
     if(message.mentions.users.size === 0){
      return message.channel.send("Vous n'avez pas mentionné d'utilisateur");
     }
     else{
       let member = message.guild.member(message.mentions.users.first());
        if(!member){
         return message.channel.send("Utilisateur introuvable.");
       }
       if(message.member.roles.highest.position > member.roles.highest.position){
       let muteRole = message.guild.roles.cache.find(role => role.name === "Muted")
      if(muteRole){
        member.roles.add(muteRole)
        let muteEmbed = new Discord.MessageEmbed()
        .setColor("#ec0808")
        .setAuthor(member.user.username, member.user.displayAvatarURL)
        .setDescription(member.user.username + " a été mute par " + message.author.username)
        .setFooter("(ಠ⌣ಠ)")
      message.channel.send(muteEmbed)
      }
      else{
        message.guild.roles.create({
          data : {
            name : 'Muted',
            permissions : 0,
          }
        }).then((role)=>{ 
          message.guild.channels.cache.filter(channel => channel.type === 'text').forEach(channel =>{
            channel.overwritePermissions(role,{
              SEND_MESSAGES : false
            })
          })
          member.roles.add(muterole).catch(console.error)
          let muteEmbed = new Discord.MessageEmbed()
          .setColor("#ec0808")
          .setAuthor(member.user.username, member.user.displayAvatarURL)
          .setDescription(member.user.username + " a été mute par " + message.author.username)
          .setFooter("(ಠ⌣ಠ)")
        message.channel.send(muteEmbed);
        })
      }
    }
    else{
      let muteEmbed = new Discord.MessageEmbed()
      .setColor("#ec0808")
      .setDescription("Vous ne pouvez pas mute **" + member.user.username + "** (hiérarchie)")
      .setFooter("(ಠ⌣ಠ)")
      message.channel.send(muteEmbed);
    }
      message.delete();
    }
  }
  else{
   message.channel.send("Vous n'avez pas la permissions.")
  }
}
});

  //unmute                                                                 nice v12

  client.on("message", message =>{
    if(!message.guild) return
      if (message.content.indexOf(prefix + "unmute") == 0) {
        if(!message.member.hasPermission('MANAGE_MESSAGES')){
          message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.")
        }
        else{
          let member = message.mentions.members.first()
          if(!member){
            message.channel.send("Membre introuvable")
          }
          else{
              let muterole = message.guild.roles.cache.find(role => role.name === 'Muted')
              if(muterole){
                member.roles.remove(muterole)
                let unmuteEmbed = new Discord.MessageEmbed()
                  .setColor("#00FF3F")
                  .setAuthor(member.user.username, member.user.displayAvatarURL)
                  .setDescription(member.user.username + " a été unmute par " + message.author.username)
                  .setFooter("(ಠ⌣ಠ)")
                message.channel.send(unmuteEmbed);
                }
                else{
                  message.channel.send("/unmute : une erreur est survenue");
                }
                message.delete();
          }
        }   
      }
  });





//commande changer de salon staff                                            nice v12
client.on("message", message =>{
  if(!message.guild) return
  if(message.content.indexOf(prefix + "memberChannel") == 0){
    if(message.member.hasPermission("MANAGE_CHANNELS")){
      let args = message.content.trim().split(/ +/g);
      if(args[1] && message.guild.channels.cache.find(channel => channel.name === args[1])){
        SalonMembres = args[1];
        let channelMembreEmbed = new Discord.MessageEmbed()
          .setColor("#FFFF00")
          .setTitle("/memberChannel " + args[1])
          .setAuthor(message.author.username, message.author.displayAvatarURL)
          .setFooter("(ಠ⌣ಠ)")
        message.channel.send(channelMembreEmbed);
        
        let data_member_without_bis = ""
        let data_member = fs.readFileSync("data_member_channels.txt", "utf-8").split("\n");
        for(var i = 0; i < data_member.length; i++){        //vérifier qu'un salon n'est pas déjà définint pour ce serveur
          if(data_member[i].split("&@")[0] === message.guild.id){
            console.log("Serveur identique")
          }
          else{
            if(data_member[i] != ""){             //si la ligne contient une information
              data_member_without_bis = data_member_without_bis + data_member[i] + "\n";
            }
          }
        }
        console.log(data_member_without_bis);
        fs.writeFileSync("data_member_channels.txt" , data_member_without_bis , "utf-8")
        to_add_to_data_member = message.guild.id + "&@" + args[1] + "\n";
        fs.writeFileSync("data_member_channels.txt" , fs.readFileSync("data_member_channels.txt", "utf-8") + to_add_to_data_member , "utf-8", (err) =>{      //écrire dans le fichier data_member_channels contenant les salons dédiés aux membres associés à leur guilde
          if (err) return console.log(err);   //si erreur
        })
      }
      else{
        let errorStaffEmbed = new Discord.MessageEmbed()
          .setColor("#ec0808")
          .setTitle("/memberChannel")
          .setDescription("Veuillez rentrer un nom de salon valable.Tapez /help pour obtenir de l'aide.")
          .setAuthor(message.author.username, message.author.displayAvatarURL)
          .setFooter("(ಠ⌣ಠ)")
        message.channel.send(errorStaffEmbed)
      }
    }
    else{
      let errorStaffEmbed = new Discord.MessageEmbed()
        .setColor("#ec0808")
        .setTitle("/memberChannel")
        .setDescription("Vous n'avez pas la permission d'éxécuter cette commande.")
        .setAuthor(message.author.username, message.author.displayAvatarURL)
        .setFooter("(ಠ⌣ಠ)")
      message.channel.send(errorStaffEmbed)
      message.delete();
    }
    message.delete();
  }
});





//commande help                                                      nice v12
client.on("message", message =>{
  if(!message.guild) return
  if(message.content.indexOf(prefix + "help") == 0){
    const helpEmbed = new Discord.MessageEmbed()
    .setColor("#00FF3F")
    .setTitle('/help')
    .setDescription("**__Liste des commandes :__**\n\n"
    + "**/help** : Afficher les commandes.\n\n"
    + "**/test** : Tester si le bot fonctionne.\n\n"
    + "**/clear **[**1**] : Effacer des messages.\n_Ex : /clear 7_\n\n"
    + "**/mute @personne** : Mute une personne.\n\n"
    + "**/unmute @personne** : Unmute une personne.\n\n"
    + "**/ban @personne** : Bannir quelqu'un.\n\n"
    + "**/unban [id]** : Débannir quelqu'un.\n\n"
    + "**/tempban @personne [minutes]** : Tempban quelqu'un.\n**Momentanemment Indisponible**\n\n"
    + "**/kick @personne** : Expulser quelqu'un.\n\n"
    + "**/warn @personne** : Warn quelqu'un. `5 warn < 1H = tempban 30min``.\n**Momentanemment Indisponible**\n\n"
    + "**/msg **[**texte**] : Faire parler le bot.\n_Ex : /msg Bonjour_\n\n"
    + "**/memberChannel **[**salon**] : Changer le salon pour les message d'arrivée.\n_Ex : /memberChannel annonces_\n**Momentanemment Indisponible**\n\n"
    + "**/embed **[**type**] [**contenu**] : Créer un embed.\n_Ex : /embed titre: ceci est un titre._\n\n"
    + "**/help embed** : Obtenir de l'aide sur l'utilisation de la commande **/embed**\n\n"
    + "**/horaire [H1] [H2]** : Envoyer un créneau horaire.\n_Ex : /horaire 14H30 15H30_")
    .setFooter("(ಠ⌣ಠ)")
    message.channel.send(helpEmbed);
    message.delete();
  }
});



//commande /embed                                                     nice v12


client.on("message", message =>{
  if(!message.guild) return
  if(message.content.indexOf(prefix + "embed") == 0){
    if(!message.member.hasPermission('MANAGE_MESSAGES')){
      message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.")
    }
    else{
    let args = message.content.trim().split(/ +/g);   //args renvoie un tableau avec tout les mots du message
    if(args[1]){
      let type = "error"
      let titre = "";
      let description = "";
      let auteur = "";
      let couleur = "";
      let reaction = [];
      let image = "";
      let reactionAdd = true;
      for(i = 1; i<args.length; i++){
        if(args[i] === "titre:"){                   //vérification du type, 
          type = "titre";
        }
        else if(args[i] === "description:"){
          type = "description";
        }
        else if(args[i] === "auteur:"){
          type = "auteur";
        }
        else if(args[i] === "couleur:"){
          type = "couleur";
        }
        else if (args[i] === "reaction:"){
          type = "reaction";
        }
        else if(args[i] === "image:"){
          type = "image";
        }
        else if(type === "titre"){            //si le mots renvoyé par args[i] n'est pas un type, alors, si le mot précédent était un type,
          titre = titre + " " + args[i];       //ce mot fera parti de l'embed dans le type renvoyé precedemment
        }
        else if(type === "description"){                            //+saut de ligne
          description = description + " " + args[i];
        }
        else if(type === "auteur"){
          auteur = auteur + " " + args[i];
        }
        else if(type === "couleur"){
          couleur = args[i];
        }
        else if (type === "reaction"){  //si le type est réaction,
          let fullReaction = "";
          if(args[i].split(",").length != 1){       //si un rôle est associé à la réaction,
            if(message.member.hasPermission('MANAGE_ROLES')){
              while(args[i] != "reaction:" && args[i] != "titre:" && args[i] != "description:" && args[i] != "auteur:" && args[i] != "couleur:" && args[i] != undefined){   //tant qu'on ne passe pas à un autre type,
                fullReaction = fullReaction + args[i];          //fullReaction contiendra l'emoji et le role séparés d'une virgule
                i++
                if(args[i] != "reaction:" && args[i] != "titre:" && args[i] != "description:" && args[i] != "auteur:" && args[i] != "couleur:" && args[i]){
                  fullReaction = fullReaction + " ";            //ajouter un espace à full réaction si le mot prochain n'est pas un type et fait donc partie du rôle(il peut y avoir des espaces dans les rôles)
                }
              }
              if(!message.guild.roles.cache.find(role => role.name === fullReaction.split(",")[1])){  //si le rôle n'existe pas, le créer
                message.guild.roles.create({
                  data: {
                    name: fullReaction.split(",")[1],
                    color : 'white',
                  }
                }).then(console.log).catch(console.error);
                reaction.push(fullReaction);
                fullReaction = ""
              }
              else if (message.guild.roles.cache.find(role => role.name === fullReaction.split(",")[1]).editable){      //si le bot a le droit de l'attribuer,
                reaction.push(fullReaction);        //le tableau réaction contient toute les réactions(associées à leu role) à ajouter à l'embed
                fullReaction = "";
              }
              else{
                console.log("Je ne peux pas")
                type = "close";
              }
            }
            else{
              console.log("Vous n'avez pas la permission")
            }
          }
          else{
            //si aucun rôle n'est spécifié, ajouter simplement le mot actuel (un emoji)
            reaction.push(args[i]);
          }
        }
        else if(type === "image"){
          image = image + args[i];
        }
        else if(type === "error"){        //si aucun type n'as été précisé dés le début de la commande,
          if(args[i] != undefined){
            message.channel.send("Veuillez spécifier une propriété de l'embed (titre:/description:/auteur:/couleur:)");
            type = "close";
            break;
          }
        }
    }
    if(type != "close"){
      let embed = new Discord.MessageEmbed()
        .setColor(couleur)
        .setTitle(titre)
        .setDescription(description)
        .setImage(image)
        .setAuthor(auteur)
      message.delete();
      message.channel.send(embed).then(embedMessage =>{       //envoyer l'embed
        for(var i = 0; i < reaction.length; i++){             //lui envoyer toutes les réactions contenues dans le tableau "reaction"
          embedMessage.react(reaction[i].split(",")[0]).catch(err =>{
            message.channel.send("Erreur lors du chargement de l'emoji.")
            console.log("Erreur lors du chargement de l'emoji : " + err)
            reactionAdd = false;
          })
          if(reactionAdd){
            reactionMessages.push([embedMessage.guild.id,embedMessage.channel.id,embedMessage.id,reaction[i]]);     //ajouter au tableau contenant tout les messages avec des "reactionroles", la guild, le salon, le message et la réaction

            to_add_to_data_autorole = embedMessage.guild.id + "&@" +embedMessage.channel.id + "&@" + embedMessage.id + "&@" + reaction[i] + "\n";
            fs.writeFileSync("data_autorole.txt" , fs.readFileSync("data_autorole.txt", "utf-8") + to_add_to_data_autorole , "utf-8", (err) =>{      //écrire dans le fichier data_autorole contenant tout les messages avec des "reactionroles", la guild, le salon, le message et la réaction
              if (err) return console.log(err);   //si erreur
            })
          }
          else{
            reactionAdd = true;
          }
      }
      });
    }
  }
  }
}
})

// Commande warn

client.on("message", message =>{
  if(message.content.indexOf(prefix + "warn") == 0){
    if(message.member.hasPermission("BAN_MEMBERS")){
      if(message.mentions.users.size === 0){
        return message.channel.send(message.author.username + "Vous n'avez pas mentionné d'utilisateur");
      }
      else{
        let cible = message.mentions.members.first();
        if(cible.kickable){
          if(message.member.roles.highest.position > cible.roles.highest.position){             //si tout est bon
            let raisonWarn = "";
            if(message.content.trim().split(" ")[2] != undefined){                        //raison du warn
              for(var i = 2; i < message.content.split(" ").length; i++){
                raisonWarn = raisonWarn + message.content.trim().split(" ")[i] + " ";
              }
            }
            let date = new Date;
            let to_add_to_data_warns = message.guild.id + "&@" + cible.id + "&@" + date.getDay() + "&@" + date.getHours() + "&@" + date.getMinutes();
            fs.writeFileSync("data_warns.txt", fs.readFileSync("data_warns.txt" , "utf-8") + "\n" + to_add_to_data_warns , "utf-8");
            let embed = new Discord.MessageEmbed()
              .setTitle("/warn")
              .setDescription(cible.user.username + " a été warn par " + message.author.username)
              .setColor("#ec0808")
            message.channel.send(embed);
            message.mentions.members.first().createDM();
            message.mentions.members.first().send("Vous avez été warn sur " + message.guild.name + ". \n Respectez les règles la prochaine fois ! \n" + raisonWarn);   //mp

            let data_warn = fs.readFileSync("data_warns.txt" , "utf-8").split("\n");
            let data_warn_without_unavailables = "";
            for(var i = 0; i < data_warn.length; i++){                            //enlever les warns de plus d'une heure
              if(parseInt(data_warn[i].split("&@")[2], 10) === date.getDay()){
                let actualMinutes = date.getHours() * 60 + date.getMinutes(); //minutes depuis 0H00
                let warnMinutes = parseInt(data_warn[i].split("&@")[3], 10) * 60 + parseInt(data_warn[i].split("&@")[4], 10);
                if(actualMinutes - warnMinutes < 60){              //si le warn n'a pas plus d'une heure
                  data_warn_without_unavailables = data_warn_without_unavailables + data_warn[i] + "\n";
                }
              }
            }
            fs.writeFileSync("data_warns.txt", data_warn_without_unavailables , "utf-8");
            let nbrWarn = 0;
            for(var i = 0; i < data_warn.length; i++){    //vérifier le nombre de warns
              if(data_warn[i].split("&@")[0] === message.guild.id){
                if(data_warn[i].split("&@")[1] === cible.id){
                  nbrWarn++;
                }
              }
            }
            if(nbrWarn >= 5){     //si l'utilisateur a eu 5 warns
              let data_tempban = fs.readFileSync("data_tempban.txt" , "utf-8").split("\n");       //tempban le joueur
              let data_tempban_without_unavailables = "";
              for(var i = 0; i < data_tempban.length; i++){                            //enlever les anciens tempbans de cet utilisateur
                if(data_tempban[i].split("&@")[0] === message.guild.id){
                  if(!data_tempban[i].split("&@")[1] === cible.id){
                    data_tempban_without_unavailables = data_tempban_without_unavailables + data_tempban[i];
                  }
                }
              }
              fs.writeFileSync("data_tempban.txt", data_tempban_without_unavailables , "utf-8");
              let date = new Date;
              let sinceBeginning = date.getFullYear()*365*24*60 + date.getMonth()*31*24*60 + date.getDate()*24*60 + date.getHours()*60 + date.getMinutes();
              let tempbanEnd = 30 + sinceBeginning;     //durée du tempban : 30 mins

              let to_add_data_tempban = message.guild.id + "&@" + cible.id + "&@" + sinceBeginning + "&@" + tempbanEnd + "\n";
              fs.writeFileSync("data_tempban.txt" , fs.readFileSync("data_tempban.txt" , "utf-8") + to_add_data_tempban , "utf-8");
              let banReason = "Warns x 5 en moin d'une heure";
              cible.ban({days : 1, reason : banReason})
              let embed = new Discord.MessageEmbed()
              .setTitle(prefix +"warn")
              .setDescription(cible.user.username + " a été tempban par " + message.author.username + "\n (" + banReason + ")")
              .setColor("#ec0808")
            message.channel.send(embed);
            }
            message.delete();
          }
          else{
            return message.channel.send(message.author.username + " Vous n'avez pas la permission de warn cet utilisateur.");
          }
        }
        else{
          return message.channel.send(message.author.username + " Je n'ai pas la permission de warn cet utilisateur.");
        }
      }
    }
    else{
      return message.channel.send(message.author.username + "Vous n'avez pas la permission de warn des utilisateurs.");
    }
  }
});



//tempban
client.on("message", message =>{
  if(message.content.indexOf(prefix + "tempban") == 0){
    if(message.member.hasPermission("BAN_MEMBERS")){
      if(message.mentions.users.size >= 1){
        let cible = message.mentions.members.first();
        if(cible.bannable){
          if(message.member.roles.highest.position > cible.roles.highest.position){
            if(message.content.trim().split(" ").length >= 3){
              let data_tempban = fs.readFileSync("data_tempban.txt" , "utf-8").split("\n");
              let data_tempban_without_unavailables = "";
              for(var i = 0; i < data_tempban.length; i++){                            //enlever les anciens tempbans de cet utilisateur
                if(data_tempban[i].split("&@")[0] === message.guild.id){
                  if(!data_tempban[i].split("&@")[1] === cible.id){
                    data_tempban_without_unavailables = data_tempban_without_unavailables + data_tempban[i];
                  }
                }
              }
              fs.writeFileSync("data_tempban.txt", data_tempban_without_unavailables , "utf-8");
              let date = new Date;
              let sinceBeginning = date.getFullYear()*365*24*60 + date.getMonth()*31*24*60 + date.getDate()*24*60 + date.getHours()*60 + date.getMinutes();
              let tempbanEnd = parseInt(message.content.trim().split(" ")[2]) + sinceBeginning;
              
              if(tempbanEnd.toString() === "NaN")return message.channel.send("Veuillez entrer une durée valable.")

              let to_add_data_tempban = message.guild.id + "&@" + cible.id + "&@" + sinceBeginning + "&@" + tempbanEnd + "\n";
              fs.writeFileSync("data_tempban.txt" , fs.readFileSync("data_tempban.txt" , "utf-8") + to_add_data_tempban , "utf-8");
              let banReason = "";
              if(message.content.trim().split(" ").length >= 4){
                for(var i = 3; i < message.content.trim().split(" "); i++){
                  banReason = banReason + " " + message.content.trim().split(" ")[i];
                }
              }
              cible.ban({days : 1, reason : banReason})
              let embed = new Discord.MessageEmbed()
              .setTitle(prefix + "tempban")
              .setDescription(cible.user.username + " a été tempban par " + message.author.username)
              .setColor("#ec0808")
            message.channel.send(embed);
            message.delete();

            }
            else{
              message.channel.send(message.author.username + " veuillez définir une durée (en minutes) de ban.");
            }
          }
          else{
            message.channel.send(message.member.user.username + " vous n'avez pas la permission de tempban cet utilisateur.")
          }
        }
        else{
          message.channel.send(message.member.user.username + " je ne peux pas tempban cet utilisateur.")
        }
      }
      else{
        message.channel.send(message.member.user.username + " veuillez spécifier un utilisateur.")
      }
    }
    else{
      message.channel.send(message.member.user.username + " vous n'avez pas la permission d'utiliser cette commande.");
    }
  }
});





//ban
client.on("message", message =>{
  if(message.content.indexOf(prefix + "ban") == 0){
    if(message.member.hasPermission("BAN_MEMBERS")){
      if(message.mentions.users.size >= 1){
        let cible = message.mentions.members.first();
        if(cible.bannable){
          if(message.member.roles.highest.position > cible.roles.highest.position){
            let banReason = "";
            if(message.content.trim().split(" ").length >= 3){
              for(var i = 2; i < message.content.trim().split(" "); i++){
                banReason = banReason + " " + message.content.trim().split(" ")[i];
              }
            }
            cible.ban({days : 7, reason : banReason})
              .then(console.log)
              .catch(console.error);
            let embed = new Discord.MessageEmbed()
              .setTitle(prefix + "ban")
              .setDescription(cible.user.username + " a été banni par " + message.author.username + "\n Pour le débannir : \n `/unban " + cible.id + "`")
              .setColor("#ec0808")
            message.channel.send(embed);
            message.delete();

          }
          else{
            message.channel.send(message.member.user.username + " vous n'avez pas la permission de bannir cet utilisateur.")
          }
        }
        else{
          message.channel.send(message.member.user.username + " je ne peux pas bannir cet utilisateur.")
        }
      }
      else{
        message.channel.send(message.member.user.username + " veuillez spécifier un utilisateur.")
      }
    }
    else{
      message.channel.send(message.member.user.username + " vous n'avez pas la permission d'utiliser cette commande.");
    }
  }
});





//unban
client.on("message", message =>{
  if(message.content.indexOf(prefix + "unban") == 0){
    if(message.member.hasPermission("BAN_MEMBERS")){
      if(message.content.trim().split(" ").length >= 2){
        message.guild.members.unban(message.content.trim().split(" ")[1])
          .then(console.log)
          .catch(console.error);
        embed = new Discord.MessageEmbed()
          .setTitle(prefix + "unban")
          .setDescription(message.content.trim().split(" ")[1] + " a été unban par " + message.author.username)
          .setColor("#00FF3F")
        message.channel.send(embed);
        message.delete();
      }
    }
    else{
      message.channel.send(message.member.user.username + " vous n'avez pas la permission d'utiliser cette commande.");
    }
  }
});


//actualisation du tempban
client.on("message", message =>{
  if(message.content.indexOf(prefix + "tempban") == 0){
      //ne rien faire 
  }
  else{
  let date = new Date();
  let sinceBeginning = date.getFullYear()*365*24*60 + date.getMonth()*31*24*60 + date.getDay()*24*60 + date.getHours()*60 + date.getMinutes();
  let data_tempban = fs.readFileSync("data_tempban.txt" , "utf-8").split("\n");
  let data_tempban_without_unavailables = "";

  data_tempban.forEach((e) =>{
    if(e != ""){
      if(sinceBeginning >= parseInt(e.split("&@")[3])){
          client.guilds.fetch(e.split("&@")[0]).then(guild => {                       //si délai dépassé, unban la personne
            guild.members.unban(e.split("&@")[1]).catch((err => console.log("Erreur lors du /unban : " + err)));
          }).catch(err => console.log("Erreur lors du fetch : " + err));
      }
      else{
        data_tempban_without_unavailables = data_tempban_without_unavailables + e;          //délai non dépassé
      }
      fs.writeFileSync("data_tempban.txt" , data_tempban_without_unavailables , "utf-8");
    }
  })
  }
})



//commande /info

client.on("message", message =>{
  if(message.content.trim().indexOf(prefix + "info") == 0){
    let data_member_channels = fs.readFileSync("data_member_channels.txt" , "utf-8").split("\n");
    let memberChannelInfo
      data_member_channels.forEach((line) =>{
        if(line.split("&@")[0] === message.guild.id){
          if(line.split("&@").length >= 2){
            memberChannelInfo = line.split("&@")[1];      //la variable contiendra le nom du salon dédié aux membres
          }
        }
      });
    if(memberChannelInfo && memberChannelInfo != ""){
      let embed = new Discord.MessageEmbed()
        .setColor("#FFFF00")
        .setTitle("Infos du serveur " + message.guild.name)
        .setDescription("**Membres :**`" + message.guild.memberCount + "`\n"
        + "**Salon dédié aux membres :**`" + memberChannelInfo + "`\n"
        + "**Fondateur : **`" + message.guild.owner.user.username + "`\n"
        + "**Créé le : **`" + message.guild.createdAt.getDate() + "/" + message.guild.createdAt.getMonth() + "/" + message.guild.createdAt.getFullYear() + "`")
        .setFooter("(ಠ⌣ಠ)")
      message.channel.send(embed);
      message.delete();
    }
    else{                         //si aucun channel pour les membres n'a été trouvé
      let embed = new Discord.MessageEmbed()
        .setColor("#FFFF00")
        .setTitle("Infos du serveur " + message.guild.name)
        .setDescription("**Membres :**`" + message.guild.memberCount + "`")
        .setFooter("(ಠ⌣ಠ)")
      message.channel.send(embed);
    }
  }
});


// commande /help embed

client.on("message", message =>{
  if(message.content.indexOf(prefix + "help_embed") == 0){
    let embed = new Discord.MessageEmbed()
      .setTitle(prefix + "help_embed")
      .setColor("#00FF3F")
      .setTitle(prefix + "help embed")
      .setDescription("Pour utiliser la commande " + prefix + "embed, il faut d'abord renseigner le type de ce que vous voulez ajouter à l'embed.\n"
      + "_Ex : " + prefix + "embed titre: ceci est le titre_\n"
      + "Renverra :")
    message.channel.send(embed);
    embed = new Discord.MessageEmbed()
      .setTitle("ceci est le titre")
    message.channel.send(embed);
    embed = new Discord.MessageEmbed()
      .setColor("#00FF3F")
      .setDescription("Il existe aussi le type `couleur:` qui permet de changer la couleur de l'embed.\n"
      + "La couleur doit être renseignée en héxadécimal. Le fonctionnement de l'héxadécimal est assez complexe :\n"
      + "Les valeurs héxadécimales sont composées de 6 lettres ou chiffres, les 2 premiers sont la quantité de rouge, les 2 suivants sont la "
      + "quantité de vert et les 2 derniers la quantité de bleu.\n"
      + "_Ex : #00FF00_\n"
      + "Les chiffres qui peuvent être renseignés sont `01223456789ABCDEF`, `F` étant la valeur la plus haute.\n"
      + "Voici un ordre allant de `00` à `FF` pour vour clarifier les idées :\n"
      + "`00`,`01`,`02` ... `09`,`0A` ... `0F`,`10`,`11` ... `19`,`1F` ... `FF`\n"
      + "N'oubliez pas le `#` avant les valeurs.\n"
      + "_Ex : " + prefix + "embed titre: ceci est le titre couleur: #0000FF_\n"
      + "Renverra :")
    message.channel.send(embed);
    embed = new Discord.MessageEmbed()
      .setTitle("ceci est le titre")
      .setColor("#0000FF")
    message.channel.send(embed);
    embed = new Discord.MessageEmbed()
      .setColor("#00FF3F")
      .setDescription("Il faut savoir également que si vous faites des mélanges de couleurs, plus les valeurs seront hautes, plus la couleur sera claire.\n"
      + "_Ex : " + prefix + "embed titre: ceci est le titre couleur: #FFAAAA_\n"
      + "Renverra :")
    message.channel.send(embed);
    embed = new Discord.MessageEmbed()
      .setTitle("ceci est le titre")
      .setColor("#FFAAAA")
    message.channel.send(embed);
    embed = new Discord.MessageEmbed()
      .setColor("#00FF3F")
      .setTitle("Liste des types :")
      .setDescription("-`titre:`\n-`couleur:`\n-`description:`\n-`auteur:`\n")
      .setFooter("(ಠ⌣ಠ)")
    message.channel.send(embed);
  }
});




// commande /horaire


client.on("message", message =>{
  if(message.content.indexOf(prefix + "horaire") == 0){
    if(message.content.trim().split(" ").length >= 3){
      let embed = new Discord.MessageEmbed()
        .setAuthor(message.member.user.username)
        .setTitle("**" + message.content.trim().split(" ")[1] + "** à **" + message.content.trim().split(" ")[2] + "**")
        .setColor("#AA2222")
      message.channel.send(embed);
      message.delete();
    }
    else{
      message.channel.send("Veuillez préciser aux moins 2 horaires(horaire début + horaire fin)")
    }
  }
})



