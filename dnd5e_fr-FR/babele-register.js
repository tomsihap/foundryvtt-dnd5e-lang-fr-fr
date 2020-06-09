
import Actor5e from "../../systems/dnd5e/module/actor/entity.js";
import SpellCastDialog from "../../systems/dnd5e/module/apps/spell-cast-dialog.js";
import AbilityTemplate_fr from "./ability-template_fr.js";

// surcharge "largeur" du template du rayon (hard coded)
export class Actor5e_fr extends Actor5e {

    /**
   * Cast a Spell, consuming a spell slot of a certain level
   * @param {Item5e} item   The spell being cast by the actor
   * @param {Event} event   The originating user interaction which triggered the cast
   */
  async useSpell(item, {configureDialog=true}={}) {
	//super.useSpell(item, {configureDialog=true}={});
    if ( item.data.type !== "spell" ) throw new Error("Wrong Item type");
    const itemData = item.data.data;

    // Configure spellcasting data
    let lvl = itemData.level;
    const usesSlots = (lvl > 0) && CONFIG.DND5E.spellUpcastModes.includes(itemData.preparation.mode);
    const limitedUses = !!itemData.uses.per;
    let consume = `spell${lvl}`;
    let placeTemplate = false;

    // Configure spell slot consumption and measured template placement from the form
    if ( usesSlots && configureDialog ) {
      const spellFormData = await SpellCastDialog.create(this, item);
      const isPact = spellFormData.get('level') === 'pact';
      const lvl = isPact ? this.data.data.spells.pact.level : parseInt(spellFormData.get("level"));
      if (Boolean(spellFormData.get("consume"))) {
        consume = isPact ? 'pact' : `spell${lvl}`;
      } else {
        consume = false;
      }
      placeTemplate = Boolean(spellFormData.get("placeTemplate"));

      // Create a temporary owned item to approximate the spell at a higher level
      if ( lvl !== item.data.data.level ) {
        item = item.constructor.createOwned(mergeObject(item.data, {"data.level": lvl}, {inplace: false}), this);
      }
    }

    // Update Actor data
    if ( usesSlots && consume && (lvl > 0) ) {
      await this.update({
        [`data.spells.${consume}.value`]: Math.max(parseInt(this.data.data.spells[consume].value) - 1, 0)
      });
    }

    // Update Item data
    if ( limitedUses ) {
      const uses = parseInt(itemData.uses.value || 0);
      if ( uses <= 0 ) ui.notifications.warn(game.i18n.format("DND5E.ItemNoUses", {name: item.name}));
      await item.update({"data.uses.value": Math.max(parseInt(item.data.data.uses.value || 0) - 1, 0)})
    }

    // Initiate ability template placement workflow if selected
    if ( placeTemplate && item.hasAreaTarget ) {
      const template = AbilityTemplate_fr.fromItem(item);
      if ( template ) template.drawPreview(event);
      if ( this.sheet.rendered ) this.sheet.minimize();
    }

    // Invoke the Item roll
    return item.roll();
  }
}

Hooks.once('init', () => {
	CONFIG.Actor.entityClass = Actor5e_fr;

	var remplLanguages = {
		"giant eagle": "Aigle Géant",
		"worg":"Worg",
		"winter wolf":"Loup Artique",
		"sahuagin":"Sahuagin",
		"giant owl, understands but cannot speak all but giant owl":"Chouette Géante, comprend mais ne peut pas parler sauf en Chouette Géante",
		"giant elk but can't speak them":"Elan Géant, mais ne peut pas le parler",
		"understands infernal but can't speak it":"comprend l'infernal mais ne peut pas le parler",
		"understands draconic but can't speak":"comprend le draconic mais ne peut pas le parler",
		"understands common but doesn't speak it":"comprend le commun mais ne peut pas le parler",
		"understands abyssal but can't speak":"comprend l'infernal mais ne peut pas le parler",
		"understands all languages it knew in life but can't speak":"comprend toutes les langues qu'il a apprises dans sa vie mais ne peut pas les parler",
		"understands commands given in any language but can't speak":"comprend les ordres donnés dans n'importe quelle langue mais ne peut pas parler",
		"(can't speak in rat form)":"(Ne peut pas parler sous forme de rat)",	
		"(can't speak in boar form)":"(ne peut pas parler sous forme de sanglier)",
		"(can't speak in bear form)":"(ne peut pas parler sous forme d'ours)",
		"(can't speak in tiger form)":"(ne peut pas parler sous forme de tigre)",
		"any one language (usually common)":"une langue quelconque (généralement le commun)",
		"any two languages":"deux langues quelconques",
		"any four languages":"quatre langues quelconques",
		"5 other languages":"5 autres langues",
		"any, usually common":"généralement le commun",
		"one language known by its creator":"une langue connue de son créateur",
		"the languages it knew in life":"les langues qu'il connaissait dans la vie",
		"those it knew in life":"les langues qu'il connaissait dans la vie",
		"all it knew in life":"les langues qu'il connaissait dans la vie",
		"any it knew in life":"les langues qu'il connaissait dans la vie",
		"all, telepathy 120 ft.":"toutes, télépathie 36m",
		"telepathy 60 ft.":"télépathie 18m",
		"telepathy 60ft. (works only with creatures that understand abyssal)":"télépathie 18m (seulement avec les créatures qui connaissent l'abyssal)",
		"telepathy 120 ft.":"télépathie 36m",
		"but can't speak":"mais ne peut pas parler",
		"but can't speak it":"mais ne peut pas le parler",
		"choice":"au choix",
		"understands the languages of its creator but can't speak":"comprend les langues de son créateur mais ne paut pas les parler",
		"understands common and giant but can't speak":"comprend le géant et le commun mais ne peut pas les parler",
		"cannot speak": "Ne parle pas"	
	}

	var typeAlignement = {
		"chaotic evil": "Chaotique Mauvais",	
		"chaotic neutral":"Chaotique Neutre",	
		"chaotic good":"Chaotique Bon",	
		"neutral evil":"Neutre Mauvais",	
		"true neutral":"Neutre",	
		"neutral":"Neutre",	
		"neutral good":"Neutre Bon",	
		"lawful evil":"Loyal Mauvais",	
		"lawful neutral":"Loyal Neutre",	
		"lawful good":"Loyal Bon",
		"chaotic good evil":"Chaotique Bon/Mauvais",
		"lawful chaotic evil":"Loyal/Chaotique Mauvais",	
		"unaligned":"Sans alignement"	
	}
		
	var typeCreature = {
		"aberration (shapechanger)":"Aberration (métamorphe)",         
		"aberration":"Aberration",                          
		"beast":"Bête",
		"celestial (titan)":"Céleste (titan)",                  
		"celestial":"Céleste",                          
		"construct":"Créature artificielle",                          
		"dragon":"Dragon",                              
		"elemental":"Élémentaire",                          
		"fey":"Fée",                                
		"fiend (demon)":"Fiélon (démon)",                      
		"fiend (demon, orc)":"Fiélon (démon, orc)",                  
		"fiend (demon, shapechanger)":"Fiélon (démon, métamorphe)",        
		"fiend (devil)":"Fiélon (diable)",                      
		"fiend (devil, shapechanger)":"Fiélon (diable, métamorphe)",        
		"fiend (gnoll)":"Fiélon (gnoll)",                      
		"fiend (shapechanger)":"Fiélon (métamorphe)",                
		"fiend (yugoloth)":"Fiélon (yugoloth)",                    
		"fiend":"Fiélon",                              
		"giant (cloud giant)":"Géant (géant des nuages)",                
		"giant (fire giant)":"Géant (géant du feu)",                  
		"giant (frost giant)":"Géant (géant du givre)",                
		"giant (hill giant)":"Géant (géant des collines)",                  
		"giant (stone giant)":"Géant (géant des pierres)",                
		"giant (storm giant)":"Géant (géant des tempêtes)",                
		"giant":"Géant",                              
		"humanoid (aarakocra)":"Humanoïde (aarakocra)",                
		"humanoid (any race)":"Humanoïde (toute race)",                
		"humanoid (bullywug)":"Humanoïde (brutacien)",                
		"humanoid (dwarf)":"Humanoïde (nain)",                    
		"humanoid (elf)":"Humanoïde (elfe)",                      
		"humanoid (firenewt)":"Humanoïde (triton du feu)",                
		"humanoid (gith)":"Humanoïde (gith)",                    
		"humanoid (gnoll)":"Humanoïde (gnoll)",                    
		"humanoid (gnome)":"Humanoïde (gnome)",                    
		"humanoid (goblinoid)":"Humanoïde (gobelinoïde)",                
		"humanoid (grimlock)":"Humanoïde (torve)",                
		"humanoid (grung)":"Humanoïde (grung)",                    
		"humanoid (human)":"Humanoïde (humain)",                    
		"humanoid (human, shapechanger)":"Humanoïde (humain, métamorphe)",      
		"humanoid (kenku)":"Humanoïde (kenku)",                    
		"humanoid (kobold)":"Humanoïde (kobold)",                  
		"humanoid (kuo-toa)":"Humanoïde (kuo-toa)",                  
		"humanoid (lizardfolk)":"Humanoïde (homme-lézard)",              
		"humanoid (merfolk)":"Humanoïde (homme-poisson)",                  
		"humanoid (orc)":"Humanoïde (orc)",                      
		"humanoid (quaggoth)":"Humanoïde (quaggoth)",                
		"humanoid (sahuagin)":"Humanoïde (sahuagin)",                
		"humanoid (shapechanger)":"Humanoïde (métamorphe)",           
		"humanoid (thri-kreen)":"Humanoïde (thri-kreen)",              
		"humanoid (troglodyte)":"Humanoïde (troglodyte)",              
		"humanoid (xvart)":"Humanoïde (xvart)",                    
		"humanoid (yuan-ti)":"Humanoïde (yuan-ti)",                  
		"humanoid":"Humanoïde",		                            
		"monstrosity (shapechanger)":"Créature monstrueuse (métamorphe)",          
		"monstrosity (shapechanger, yuan-ti)":"Créature monstrueuse (métamorphe, yuan-ti)",
		"monstrosity (titan)":"Créature monstrueuse (titan)",                
		"monstrosity":"Créature monstrueuse",                        
		"ooze":"Vase",                                
		"plant":"Plante",                              
		"swarm of Tiny beasts":"Nuée de bêtes",                
		"undead (shapechanger)":"Mort-vivant (métamorphe)",              
		"undead":"Mort-vivant"        
	};
	
	function rempl(chaine) {
			var regexp = /([0-9]+)/gi; // recherche des valeurs numériques
			if (chaine.includes('ft')) { 
	 	 		chaine = chaine.replace(/ft/gi, 'm'); // toutes les occurences en ft
	 	 		chaine = chaine.replace(/Walk/gi, 'Marche');
	 	 		chaine = chaine.replace(/Fly/gi, 'Vol'); 	 		
	 	 		chaine = chaine.replace(/Swim/gi, 'Nage');
	 	 		chaine = chaine.replace(/Climb/gi, 'Escalade');  
	 			chaine = chaine.replace(/Burrow/gi, 'Creuse');  
	 	 		chaine = chaine.replace((chaine.match(regexp)), parseInt(chaine.match(regexp))*0.3);
  		return chaine;
  	};
	  console.log("non transco =>" + chaine + "<<");
	  return chaine;
	}
	
	function remplSens(chaine) {
		var regexp = /([0-9]+)/gi; // recherche des valeurs numériques
 	 	chaine = chaine.replace(/ft/gi, 'm'); // toutes les occurences en ft
 	 	chaine = chaine.replace(/feet/gi, 'm'); // toutes les occurences en feet (pfff)
 	 	chaine = chaine.replace(/Darkvision/gi, "Vision dans le noir"); 
 	 	chaine = chaine.replace(/Darvision/gi, "Vision dans le noir"); //bug ^^
 		chaine = chaine.replace(/Blindsight/gi, "Vision aveugle");
 		chaine = chaine.replace(/Truesight/gi, "Vision véritable"); 	 		
		 chaine = chaine.replace(/tremorsense/gi, "Perception des vibrations");
		 chaine = chaine.replace(/Blind Beyond/gi, "Aveugle au-delà"); 
		 chaine = chaine.replace(/this radius/gi,"de ce rayon");
 		chaine = chaine.replace((chaine.match(regexp)), parseInt(chaine.match(regexp))*0.3);
 	 	chaine = chaine.replace("(blind beyond this radius)", "(aveugle au-delà de ce rayon)");
		return chaine;
	}

	function remplDi(chaine) {
		chaine = chaine.replace(/bludgeoning/gi, 'contondant'); 
		chaine = chaine.replace(/piercing/gi, 'perforant'); 
		chaine = chaine.replace(/and/gi, 'et'); 
		chaine = chaine.replace(/slashing/gi, 'tranchant'); 
		chaine = chaine.replace(/from/gi, 'd\''); 
		chaine = chaine.replace(/nonmagical attacks/gi, 'attaques non magiques'); 
		chaine = chaine.replace(/that aren't silvered/gi, 'non réalisées avec des armes en argent');
		chaine = chaine.replace(/not made with silvered weapons/gi, 'non réalisées avec des armes en argent');
		return chaine;
	}


	if(typeof Babele !== 'undefined') {
		
		Babele.get().register({
			module: 'dnd5e_fr-FR',
			lang: 'fr',
			dir: 'compendium'
		});

		Babele.get().registerConverters({
			"weight": (value) => { return parseInt(value)/2 },
			"range": (range) => {
				if(range) {
					if(range.units === 'ft') {
						if(range.long) {
							range = mergeObject(range, { long: range.long*0.3 });
						}
						return mergeObject(range, { value: range.value*0.3 });
					}
					if(range.units === 'mi') {
						if(range.long) {
							range = mergeObject(range, { long: range.long*1.5 });
						}
						return mergeObject(range, { value: range.value*1.5 });
					}
					return range;
				}
			},
			"alignement": (alignement) => {
	   			return typeAlignement[alignement.toLowerCase()];
    	},
			"type": (typeC) => {
					return typeCreature[typeC.toLowerCase()];
			},	
			"speed": (testV) => {
					//console.log(JSON.parse(JSON.stringify(testV))); //{value: "Fly 80 ft.", special: "Walk 10 ft."}
					if (testV.special) {
						const testVspecial = testV.special.split('. ');
						var vitesseSpe = '';
						testVspecial.forEach(function(el){
							vitesseSpe = rempl(el) + ' ' + vitesseSpe;
							//console.log(JSON.parse(JSON.stringify(vitesseSpe)));
							}	
						);
						testV = mergeObject(testV, { special: vitesseSpe });
				  }
					const testVval = testV.value.split('. ');
					var vitesse = '';
					testVval.forEach(function(el){
						vitesse = rempl(el) + ' ' + vitesse;
						//console.log(JSON.parse(JSON.stringify(vitesse)));
							}	
					);
					return	mergeObject(testV, { value: vitesse });
			},
			"senses": (sens) => {
				if (sens != null ) {
					//console.log(JSON.parse(JSON.stringify(sens)));
					const sensSplit = sens.split(', ');
					//console.log(JSON.parse(JSON.stringify(sensSplit)));
					var sensTr = '';
					sensSplit.forEach(function(el){
						//console.log(JSON.parse(JSON.stringify(el))); 
						sensTr = remplSens(el) + ' ' + sensTr;
						}	
					);
					return sensTr; 
				}
			},
			"di": (diC) => {
				return remplDi(diC); 
			},
			"languages": (languages) => {
				if (languages != null ) {
					//console.log(JSON.parse(JSON.stringify(languages)));
					const languagesSplit = languages.split('; ');
					var languagesFin = '';
					var languagesTr = '';
					languagesSplit.forEach(function(el){
						languagesTr = remplLanguages[el.toLowerCase()] ;
						if (languagesTr != null) {
							if (languagesFin == '') {
								languagesFin = languagesTr;
							}  else {
								languagesFin = languagesFin + ' ; '  + languagesTr;
							}
						} 
					});
					return languagesFin; 
				}
			}
	});
	CONFIG.DND5E.encumbrance.currencyPerWeight = 100;
	CONFIG.DND5E.encumbrance.strMultiplier = 7.5;
	}	
});

// pour passer les scenes en 1.5
Hooks.on('preCreateScene', (scenedata) => {
    scenedata.gridDistance = 1.5
    scenedata.gridUnits = "m"
})
