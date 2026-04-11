-- ────────────────────────────────────────────────────────────
-- SwipEat — Seed 55 plats
-- Cuisines : française, italienne, japonaise, mexicaine,
--            indienne, américaine, asiatique, méditerranéenne,
--            végétarienne
-- ────────────────────────────────────────────────────────────

TRUNCATE TABLE dishes RESTART IDENTITY CASCADE;

INSERT INTO dishes (name, description, image_url, cuisine_type, prep_time, difficulty, calories, is_vegan, is_gluten_free, ingredients, recipe_steps) VALUES

-- ── Française ────────────────────────────────────────────────
(
  'Bœuf Bourguignon',
  'Bœuf mijoté dans un vin de Bourgogne, avec lardons, champignons et carottes. Un grand classique du dimanche.',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80&fit=crop',
  'française', 150, 'moyen', 520, false, true,
  '[{"name":"bœuf à braiser","qty":"800g"},{"name":"vin rouge de Bourgogne","qty":"75cl"},{"name":"lardons","qty":"150g"},{"name":"champignons","qty":"200g"},{"name":"carottes","qty":"3"},{"name":"oignons","qty":"2"},{"name":"ail","qty":"3 gousses"},{"name":"bouquet garni","qty":"1"}]',
  '["Couper le bœuf en gros cubes, saler et poivrer.","Faire revenir les lardons et réserver.","Dorer la viande dans la cocotte.","Ajouter les légumes et le vin rouge.","Laisser mijoter 2h à feu doux.","Ajouter les champignons 30 min avant la fin."]'
),
(
  'Coq au Vin',
  'Poulet fermier braisé dans un vin rouge avec des lardons, des champignons et des oignons grelots.',
  'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&q=80&fit=crop',
  'française', 90, 'moyen', 440, false, true,
  '[{"name":"poulet","qty":"1.5 kg"},{"name":"vin rouge","qty":"50cl"},{"name":"lardons","qty":"100g"},{"name":"champignons","qty":"200g"},{"name":"oignons grelots","qty":"150g"},{"name":"ail","qty":"2 gousses"},{"name":"cognac","qty":"5cl"}]',
  '["Faire mariner le poulet dans le vin 2h.","Faire revenir les lardons et oignons.","Dorer le poulet sur toutes faces.","Flamber au cognac.","Ajouter le vin et laisser mijoter 45 min.","Incorporer les champignons et finir la cuisson."]'
),
(
  'Ratatouille',
  'Tian de légumes du soleil mijotés à l''huile d''olive — courgettes, aubergines, poivrons et tomates.',
  'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=800&q=80&fit=crop',
  'française', 60, 'facile', 180, true, true,
  '[{"name":"courgettes","qty":"2"},{"name":"aubergines","qty":"2"},{"name":"poivrons","qty":"2"},{"name":"tomates","qty":"4"},{"name":"oignons","qty":"1"},{"name":"ail","qty":"3 gousses"},{"name":"huile d''olive","qty":"6 cs"},{"name":"herbes de Provence","qty":"2 cc"}]',
  '["Couper tous les légumes en rondelles fines.","Faire revenir l''oignon et l''ail.","Alterner les rondelles dans un plat.","Arroser d''huile d''olive et herbes.","Cuire 45 min à 180°C."]'
),
(
  'Quiche Lorraine',
  'La vraie : crème fraîche, lardons et gruyère dans une pâte brisée croustillante.',
  'https://images.unsplash.com/photo-1530648672449-81f6c723e2f1?w=800&q=80&fit=crop',
  'française', 50, 'facile', 380, false, false,
  '[{"name":"pâte brisée","qty":"1"},{"name":"lardons fumés","qty":"200g"},{"name":"crème fraîche","qty":"20cl"},{"name":"œufs","qty":"3"},{"name":"gruyère râpé","qty":"100g"},{"name":"noix de muscade","qty":"1 pincée"}]',
  '["Préchauffer le four à 200°C.","Foncer le moule avec la pâte brisée.","Faire revenir les lardons à sec.","Mélanger crème, œufs, sel, poivre, muscade.","Répartir lardons et gruyère sur le fond.","Verser l''appareil et cuire 30 min."]'
),
(
  'Soupe à l''oignon gratinée',
  'Bouillon de bœuf, oignons caramélisés et croûtons gratinés au comté. Réconfort absolu.',
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80&fit=crop',
  'française', 60, 'facile', 310, false, false,
  '[{"name":"oignons","qty":"6 gros"},{"name":"bouillon de bœuf","qty":"1.5L"},{"name":"beurre","qty":"50g"},{"name":"vin blanc","qty":"10cl"},{"name":"baguette","qty":"4 tranches"},{"name":"comté râpé","qty":"120g"}]',
  '["Émincer finement les oignons.","Faire caraméliser dans le beurre 30 min à feu doux.","Déglacer au vin blanc.","Ajouter le bouillon chaud, mijoter 15 min.","Répartir dans des bols allant au four.","Poser les croûtons, couvrir de comté et gratiner."]'
),
(
  'Tartiflette',
  'Gratin savoyard au reblochon, pommes de terre, lardons et oignons. Le plat d''hiver par excellence.',
  'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80&fit=crop',
  'française', 60, 'facile', 560, false, true,
  '[{"name":"pommes de terre","qty":"1.2 kg"},{"name":"reblochon","qty":"1"},{"name":"lardons","qty":"200g"},{"name":"oignons","qty":"2"},{"name":"crème fraîche","qty":"15cl"},{"name":"vin blanc","qty":"5cl"}]',
  '["Cuire les pommes de terre en robe des champs.","Faire revenir lardons et oignons.","Déglacer au vin blanc.","Éplucher et couper les pommes de terre.","Mélanger avec lardons, oignons et crème.","Couper le reblochon en deux et poser sur le dessus. Gratiner 25 min à 200°C."]'
),
(
  'Crêpes Suzette',
  'Crêpes fines flambées au Grand Marnier et beurre d''orange — un dessert spectaculaire.',
  'https://images.unsplash.com/photo-1551529834-525807d6b4f3?w=800&q=80&fit=crop',
  'française', 40, 'moyen', 290, false, false,
  '[{"name":"farine","qty":"200g"},{"name":"œufs","qty":"3"},{"name":"lait","qty":"50cl"},{"name":"beurre","qty":"50g"},{"name":"oranges","qty":"2"},{"name":"Grand Marnier","qty":"5cl"},{"name":"sucre","qty":"60g"}]',
  '["Préparer la pâte à crêpes et laisser reposer 30 min.","Cuire les crêpes.","Préparer le beurre Suzette avec jus d''orange, zeste, sucre et beurre.","Plier les crêpes en quatre et les napper de sauce.","Flamber au Grand Marnier au moment de servir."]'
),
(
  'Bouillabaisse',
  'La soupe de pêcheurs marseillaise : rouget, vive, saint-pierre, croûtons à la rouille.',
  'https://images.unsplash.com/photo-1539136788836-5699e78bfc75?w=800&q=80&fit=crop',
  'française', 90, 'difficile', 410, false, false,
  '[{"name":"poissons variés","qty":"1.5 kg"},{"name":"tomates","qty":"4"},{"name":"oignons","qty":"2"},{"name":"safran","qty":"1 dose"},{"name":"pastis","qty":"5cl"},{"name":"croûtons","qty":"8"},{"name":"rouille","qty":"100g"}]',
  '["Préparer le fumet avec les parures de poisson.","Faire revenir oignons, tomates, safran.","Ajouter les poissons par ordre de cuisson.","Mouiller avec le fumet et le pastis.","Servir avec croûtons et rouille."]'
),
(
  'Tarte Tatin',
  'Tarte renversée aux pommes caramélisées. Servie tiède avec une quenelle de crème fraîche épaisse.',
  'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&q=80&fit=crop',
  'française', 50, 'moyen', 320, false, false,
  '[{"name":"pommes Golden","qty":"6"},{"name":"pâte feuilletée","qty":"1"},{"name":"beurre","qty":"80g"},{"name":"sucre","qty":"150g"},{"name":"crème fraîche","qty":"100g"}]',
  '["Caraméliser le sucre et le beurre dans la poêle.","Ajouter les pommes épluchées et cuire 10 min.","Recouvrir de pâte feuilletée.","Cuire 25 min à 200°C.","Retourner délicatement sur un plat.","Servir tiède avec crème fraîche."]'
),
(
  'Flammekueche',
  'Tarte flambée alsacienne : fromage blanc, crème, lardons et oignons sur une pâte fine croustillante.',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&fit=crop',
  'française', 30, 'facile', 350, false, false,
  '[{"name":"pâte fine","qty":"1"},{"name":"fromage blanc","qty":"150g"},{"name":"crème fraîche","qty":"100g"},{"name":"lardons","qty":"150g"},{"name":"oignons émincés","qty":"2"}]',
  '["Étaler finement la pâte.","Mélanger fromage blanc et crème, étaler.","Répartir lardons et oignons.","Cuire 10 min à four très chaud (260°C).","Servir immédiatement."]'
),

-- ── Italienne ─────────────────────────────────────────────────
(
  'Spaghetti Carbonara',
  'La vraie recette romaine : spaghetti, guanciale, jaunes d''œufs et pecorino. Sans crème.',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80&fit=crop',
  'italienne', 25, 'moyen', 580, false, false,
  '[{"name":"spaghetti","qty":"400g"},{"name":"guanciale","qty":"150g"},{"name":"jaunes d''œufs","qty":"4"},{"name":"pecorino","qty":"80g"},{"name":"poivre noir","qty":"1 cc"}]',
  '["Cuire les pâtes al dente.","Faire revenir le guanciale à sec.","Mélanger jaunes, pecorino et poivre.","Hors du feu, mélanger pâtes, guanciale et appareil.","Ajouter un peu d''eau de cuisson pour lier."]'
),
(
  'Pizza Margherita',
  'La reine des pizzas : tomate San Marzano, mozzarella di bufala, basilic frais.',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&fit=crop',
  'italienne', 90, 'moyen', 420, false, false,
  '[{"name":"farine à pizza","qty":"400g"},{"name":"levure","qty":"7g"},{"name":"tomates San Marzano","qty":"400g"},{"name":"mozzarella di bufala","qty":"200g"},{"name":"basilic","qty":"10 feuilles"},{"name":"huile d''olive","qty":"3 cs"}]',
  '["Préparer la pâte et laisser lever 1h.","Étaler finement.","Étaler la sauce tomate.","Ajouter mozzarella déchirée.","Cuire 8 min à 280°C.","Garnir de basilic et huile d''olive."]'
),
(
  'Risotto aux champignons',
  'Riz arborio crémeux aux champignons porcini séchés et champignons frais, fini au parmesan.',
  'https://images.unsplash.com/photo-1476224203913-f93050a1db7f?w=800&q=80&fit=crop',
  'italienne', 40, 'moyen', 460, false, true,
  '[{"name":"riz arborio","qty":"320g"},{"name":"champignons porcini séchés","qty":"30g"},{"name":"champignons frais","qty":"300g"},{"name":"bouillon de légumes","qty":"1.2L"},{"name":"parmesan","qty":"80g"},{"name":"beurre","qty":"40g"},{"name":"vin blanc","qty":"10cl"}]',
  '["Réhydrater les porcini dans l''eau chaude.","Faire revenir les champignons frais.","Nacrer le riz dans le beurre.","Déglacer au vin blanc.","Ajouter le bouillon louche par louche.","Finir avec beurre et parmesan hors du feu."]'
),
(
  'Lasagnes bolognaise',
  'Couches de pâtes fraîches, ragù de bœuf mijoté, béchamel et parmesan.',
  'https://images.unsplash.com/photo-1540189549336-e6e99de663ad?w=800&q=80&fit=crop',
  'italienne', 120, 'moyen', 620, false, false,
  '[{"name":"pâtes à lasagnes","qty":"12"},{"name":"bœuf haché","qty":"500g"},{"name":"tomates concassées","qty":"400g"},{"name":"lait","qty":"50cl"},{"name":"beurre","qty":"50g"},{"name":"farine","qty":"50g"},{"name":"parmesan","qty":"100g"},{"name":"oignons","qty":"1"}]',
  '["Préparer le ragù bolognaise (mijoter 1h).","Préparer la béchamel.","Alterner couches de pâtes, ragù et béchamel.","Finir par béchamel et parmesan.","Cuire 40 min à 180°C.","Laisser reposer 10 min avant de découper."]'
),
(
  'Osso Buco alla Milanese',
  'Jarret de veau braisé dans une sauce tomate et vin blanc, servi avec risotto au safran.',
  'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80&fit=crop',
  'italienne', 100, 'difficile', 490, false, true,
  '[{"name":"jarret de veau","qty":"4 tranches"},{"name":"tomates concassées","qty":"400g"},{"name":"vin blanc","qty":"20cl"},{"name":"carottes","qty":"1"},{"name":"céleri","qty":"1 branche"},{"name":"oignon","qty":"1"},{"name":"zeste de citron","qty":"1"},{"name":"persil","qty":"1 bouquet"}]',
  '["Fariner et dorer les jarrets.","Faire revenir le soffritto (carotte, céleri, oignon).","Déglacer au vin blanc.","Ajouter tomates et bouillon.","Braiser 1h30 à couvert.","Préparer la gremolata (persil, zeste, ail) et servir."]'
),
(
  'Penne all''Arrabbiata',
  'Penne dans une sauce tomate épicée à l''ail et au piment. Simple, rapide, diavolo.',
  'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=800&q=80&fit=crop',
  'italienne', 20, 'facile', 400, true, false,
  '[{"name":"penne","qty":"400g"},{"name":"tomates concassées","qty":"400g"},{"name":"ail","qty":"4 gousses"},{"name":"piments rouges","qty":"2"},{"name":"huile d''olive","qty":"5 cs"},{"name":"persil","qty":"1 bouquet"}]',
  '["Cuire les pâtes al dente.","Faire revenir ail et piments dans l''huile.","Ajouter les tomates, cuire 15 min.","Mélanger avec les pâtes égouttées.","Parsemer de persil frais."]'
),
(
  'Saltimbocca alla Romana',
  'Escalopes de veau, jambon de Parme et sauge frits au beurre — en 15 minutes chrono.',
  'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80&fit=crop',
  'italienne', 20, 'facile', 340, false, true,
  '[{"name":"escalopes de veau","qty":"4"},{"name":"jambon de Parme","qty":"4 tranches"},{"name":"sauge fraîche","qty":"8 feuilles"},{"name":"beurre","qty":"50g"},{"name":"vin blanc","qty":"10cl"}]',
  '["Poser sauge et jambon sur chaque escalope, fixer avec un cure-dent.","Fariner légèrement du côté viande.","Faire sauter côté jambon 2 min puis retourner.","Déglacer au vin blanc.","Servir avec le jus de cuisson."]'
),
(
  'Tiramisu',
  'Mascarpone, savoiardi trempés dans l''expresso et cacao amer. La douceur italienne ultime.',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80&fit=crop',
  'italienne', 30, 'facile', 380, false, false,
  '[{"name":"mascarpone","qty":"500g"},{"name":"jaunes d''œufs","qty":"5"},{"name":"sucre","qty":"100g"},{"name":"blancs d''œufs","qty":"4"},{"name":"savoiardi","qty":"30"},{"name":"expresso","qty":"30cl"},{"name":"cacao amer","qty":"3 cs"}]',
  '["Fouetter jaunes et sucre jusqu''au ruban.","Incorporer le mascarpone.","Monter les blancs en neige et incorporer.","Tremper les biscuits dans l''expresso.","Alterner couches de crème et biscuits.","Saupoudrer de cacao et réfrigérer 4h."]'
),

-- ── Japonaise ─────────────────────────────────────────────────
(
  'Ramen Tonkotsu',
  'Bouillon de porc laiteux mijouté 12h, nouilles épaisses, chashu, œuf mollet et champignons.',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80&fit=crop',
  'japonaise', 720, 'difficile', 610, false, false,
  '[{"name":"os de porc","qty":"1 kg"},{"name":"nouilles ramen","qty":"400g"},{"name":"poitrine de porc","qty":"400g"},{"name":"œufs","qty":"4"},{"name":"sauce soja","qty":"10cl"},{"name":"mirin","qty":"5cl"},{"name":"nori","qty":"4 feuilles"},{"name":"oignons verts","qty":"4"}]',
  '["Blanchir les os puis mijoter 12h pour le bouillon.","Braiser la poitrine en chashu.","Préparer les œufs marinés la veille.","Cuire les nouilles.","Assembler le bol : bouillon, nouilles, garnitures."]'
),
(
  'Plateau de sushis',
  'Assortiment de nigiris et makis : saumon, thon, daurade, concombre et avocat.',
  'https://images.unsplash.com/photo-1565557623262-b51e2b0f55bb?w=800&q=80&fit=crop',
  'japonaise', 60, 'difficile', 380, false, true,
  '[{"name":"riz à sushi","qty":"400g"},{"name":"saumon frais","qty":"200g"},{"name":"thon rouge","qty":"150g"},{"name":"daurade","qty":"150g"},{"name":"nori","qty":"6 feuilles"},{"name":"vinaigre de riz","qty":"6 cs"},{"name":"wasabi","qty":"20g"},{"name":"gingembre mariné","qty":"50g"}]',
  '["Préparer le riz à sushi vinaigré et refroidir.","Découper le poisson en tranches fines.","Former les nigiris avec les mains mouillées.","Préparer les makis avec le bambou.","Servir avec soja, wasabi et gingembre."]'
),
(
  'Gyoza poêlés',
  'Raviolis japonais farcis porc/chou, dorés à la poêle et cuits vapeur. Sauce ponzu.',
  'https://images.unsplash.com/photo-1546069901-522a32781b52?w=800&q=80&fit=crop',
  'japonaise', 45, 'moyen', 290, false, false,
  '[{"name":"feuilles à gyoza","qty":"30"},{"name":"porc haché","qty":"250g"},{"name":"chou chinois","qty":"200g"},{"name":"gingembre","qty":"2 cm"},{"name":"sauce soja","qty":"3 cs"},{"name":"huile de sésame","qty":"1 cs"},{"name":"oignons verts","qty":"3"}]',
  '["Mélanger farce porc, chou émincé, gingembre, soja, sésame.","Garnir les feuilles et plisser.","Faire dorer à l''huile dans une poêle.","Ajouter de l''eau et couvrir pour finir vapeur.","Servir avec sauce ponzu-soja."]'
),
(
  'Katsu Curry',
  'Côtelette de porc panée sur lit de curry japonais doux-épicé et riz blanc.',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&fit=crop',
  'japonaise', 40, 'moyen', 660, false, false,
  '[{"name":"escalope de porc","qty":"2"},{"name":"panko","qty":"100g"},{"name":"œufs","qty":"2"},{"name":"roux à curry japonais","qty":"100g"},{"name":"carottes","qty":"1"},{"name":"pommes de terre","qty":"1"},{"name":"oignon","qty":"1"},{"name":"riz japonais","qty":"300g"}]',
  '["Préparer le curry avec légumes et roux.","Paner les escalopes dans farine, œuf, panko.","Frire jusqu''à dorure.","Servir le katsu tranché sur le riz avec le curry."]'
),
(
  'Okonomiyaki',
  'La galette japonaise : chou, crevettes et porc, nappée de sauce okonomi et mayonnaise.',
  'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&q=80&fit=crop',
  'japonaise', 30, 'facile', 420, false, false,
  '[{"name":"farine","qty":"150g"},{"name":"chou","qty":"300g"},{"name":"œufs","qty":"3"},{"name":"dashi","qty":"15cl"},{"name":"crevettes","qty":"100g"},{"name":"porc en tranches","qty":"100g"},{"name":"sauce okonomi","qty":"4 cs"},{"name":"mayo japonaise","qty":"3 cs"},{"name":"katsuobushi","qty":"10g"}]',
  '["Mélanger farine, œufs, dashi pour la pâte.","Incorporer le chou émincé et crevettes.","Cuire dans une poêle huilée 5 min par côté.","Napper de sauce okonomi et mayo.","Garnir de katsuobushi et aonori."]'
),
(
  'Tempura de crevettes',
  'Crevettes enrobées d''une pâte légère et croustillante, frites à l''huile. Sauce tentsuyu.',
  'https://images.unsplash.com/photo-1476224203913-f93050a1db7f?w=800&q=80&fit=crop',
  'japonaise', 25, 'moyen', 310, false, false,
  '[{"name":"crevettes","qty":"16"},{"name":"farine tempura","qty":"150g"},{"name":"eau glacée","qty":"20cl"},{"name":"dashi","qty":"20cl"},{"name":"mirin","qty":"2 cs"},{"name":"sauce soja","qty":"3 cs"},{"name":"gingembre râpé","qty":"1 cc"}]',
  '["Préparer la sauce tentsuyu.","Mélanger rapidement farine et eau glacée.","Tremper les crevettes et frire à 180°C.","Égoutter sur papier absorbant.","Servir immédiatement avec la sauce."]'
),
(
  'Donburi au saumon teriyaki',
  'Bol de riz vinaigré surmonté de saumon laqué teriyaki, avocat et graines de sésame.',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80&fit=crop',
  'japonaise', 25, 'facile', 500, false, true,
  '[{"name":"filet de saumon","qty":"2"},{"name":"riz japonais","qty":"300g"},{"name":"sauce teriyaki","qty":"4 cs"},{"name":"avocat","qty":"1"},{"name":"concombre","qty":"1/2"},{"name":"sésame","qty":"1 cs"},{"name":"oignons verts","qty":"2"}]',
  '["Cuire le riz japonais.","Mariner et cuire le saumon à la poêle avec teriyaki.","Trancher avocat et concombre.","Servir le riz dans un bol, disposer les garnitures.","Saupoudrer de sésame."]'
),
(
  'Yakitori',
  'Brochettes de poulet grillées sur charbon, glacées à la sauce tare sucrée-salée.',
  'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&q=80&fit=crop',
  'japonaise', 30, 'facile', 220, false, true,
  '[{"name":"cuisses de poulet","qty":"500g"},{"name":"sauce soja","qty":"6 cs"},{"name":"mirin","qty":"4 cs"},{"name":"sucre","qty":"2 cs"},{"name":"sake","qty":"3 cs"},{"name":"oignons verts","qty":"4"}]',
  '["Couper le poulet en dés réguliers.","Préparer la sauce tare (soja, mirin, sucre, sake).","Monter les brochettes en alternant poulet et oignon vert.","Griller en nappant de sauce régulièrement."]'
),

-- ── Mexicaine ─────────────────────────────────────────────────
(
  'Tacos al Pastor',
  'Porc mariné aux ananas et achiote, servi dans des tortillas de maïs avec coriandre et oignon.',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&fit=crop',
  'mexicaine', 180, 'moyen', 390, false, true,
  '[{"name":"porc (épaule)","qty":"800g"},{"name":"ananas","qty":"1/2"},{"name":"piments guajillo","qty":"4"},{"name":"achiote","qty":"2 cs"},{"name":"tortillas de maïs","qty":"12"},{"name":"coriandre","qty":"1 bouquet"},{"name":"oignon blanc","qty":"1"}]',
  '["Préparer la marinade achiote, piments, épices.","Mariner le porc 2h.","Griller à feu vif en tranches.","Faire griller les ananas.","Servir dans les tortillas chaudes avec coriandre et oignon."]'
),
(
  'Guacamole & nachos',
  'Avocat, citron vert, coriandre, tomate et jalapeño. Chips de maïs frites maison.',
  'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80&fit=crop',
  'mexicaine', 15, 'facile', 310, true, true,
  '[{"name":"avocats","qty":"3"},{"name":"citrons verts","qty":"2"},{"name":"tomates cerises","qty":"100g"},{"name":"oignon rouge","qty":"1/2"},{"name":"jalapeño","qty":"1"},{"name":"coriandre","qty":"1/2 bouquet"},{"name":"nachos","qty":"200g"}]',
  '["Écraser les avocats à la fourchette.","Ajouter jus de citron, sel.","Incorporer tomate, oignon, jalapeño, coriandre.","Servir immédiatement avec nachos."]'
),
(
  'Enchiladas vertes',
  'Tortillas garnies de poulet effiloché, nappées de sauce tomatillo et gratinées au fromage.',
  'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&q=80&fit=crop',
  'mexicaine', 60, 'moyen', 480, false, true,
  '[{"name":"tortillas de maïs","qty":"8"},{"name":"poulet cuit effiloché","qty":"400g"},{"name":"tomatillos","qty":"500g"},{"name":"piments serrano","qty":"2"},{"name":"fromage râpé","qty":"150g"},{"name":"crème sûre","qty":"100g"},{"name":"coriandre","qty":"1 bouquet"}]',
  '["Préparer la sauce verde (tomatillos, piments, coriandre).","Garnir les tortillas de poulet.","Napper de sauce verte.","Gratiner 20 min à 180°C.","Servir avec crème sûre."]'
),
(
  'Chili con Carne',
  'Bœuf haché, haricots rouges, tomates et épices fumées. Mijotés longtemps pour plus de goût.',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80&fit=crop',
  'mexicaine', 60, 'facile', 430, false, true,
  '[{"name":"bœuf haché","qty":"500g"},{"name":"haricots rouges","qty":"400g"},{"name":"tomates concassées","qty":"400g"},{"name":"oignon","qty":"1"},{"name":"ail","qty":"3 gousses"},{"name":"cumin","qty":"2 cc"},{"name":"paprika fumé","qty":"1 cc"},{"name":"piment en poudre","qty":"1 cc"}]',
  '["Faire revenir oignon et ail.","Ajouter la viande et dorer.","Incorporer épices, tomates, haricots.","Mijoter 40 min à feu doux.","Servir avec riz, crème sûre, cheddar."]'
),
(
  'Quesadillas au fromage',
  'Tortillas de blé grillées farcies au fromage fondant, jalapeño et poivrons grillés.',
  'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80&fit=crop',
  'mexicaine', 15, 'facile', 360, false, false,
  '[{"name":"tortillas de blé","qty":"4 grandes"},{"name":"cheddar","qty":"200g"},{"name":"jalapeño","qty":"2"},{"name":"poivrons grillés","qty":"1"},{"name":"crème sûre","qty":"100g"},{"name":"salsa","qty":"100g"}]',
  '["Réchauffer les poivrons.","Répartir fromage et garnitures sur la moitié.","Plier et faire griller 3 min par côté.","Découper en triangles.","Servir avec crème sûre et salsa."]'
),

-- ── Indienne ─────────────────────────────────────────────────
(
  'Butter Chicken',
  'Poulet mariné dans le yaourt et épices, mijoté dans une sauce tomate beurrée au fenugrec.',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80&fit=crop',
  'indienne', 60, 'moyen', 510, false, true,
  '[{"name":"poulet (hauts de cuisse)","qty":"700g"},{"name":"yaourt","qty":"150g"},{"name":"tomates concassées","qty":"400g"},{"name":"beurre","qty":"60g"},{"name":"crème","qty":"15cl"},{"name":"garam masala","qty":"2 cc"},{"name":"cumin","qty":"1 cc"},{"name":"fenugrec","qty":"1 cc"},{"name":"gingembre","qty":"2 cm"},{"name":"ail","qty":"4 gousses"}]',
  '["Mariner le poulet dans yaourt et épices 2h.","Faire griller le poulet.","Préparer la sauce : oignons, ail, gingembre, tomates.","Mixer la sauce et remettre sur feu.","Ajouter beurre, crème, fenugrec.","Incorporer le poulet et mijoter 15 min."]'
),
(
  'Palak Paneer',
  'Fromage indien frais dans une sauce aux épinards fraîchement mixée, aromatisée au garam masala.',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&fit=crop',
  'indienne', 40, 'facile', 320, true, true,
  '[{"name":"paneer","qty":"300g"},{"name":"épinards","qty":"500g"},{"name":"oignon","qty":"1"},{"name":"tomate","qty":"1"},{"name":"gingembre","qty":"1 cm"},{"name":"ail","qty":"2 gousses"},{"name":"garam masala","qty":"1 cc"},{"name":"cumin","qty":"1 cc"},{"name":"crème","qty":"5 cs"}]',
  '["Blanchir les épinards et mixer en purée.","Dorer le paneer et réserver.","Faire revenir oignon, ail, gingembre, épices.","Ajouter tomate puis purée d''épinards.","Incorporer crème et paneer, chauffer."]'
),
(
  'Biryani d''agneau',
  'Riz basmati parfumé au safran en alternance avec de l''agneau mariné aux épices, cuit en dum.',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80&fit=crop',
  'indienne', 120, 'difficile', 620, false, true,
  '[{"name":"agneau","qty":"800g"},{"name":"riz basmati","qty":"400g"},{"name":"yaourt","qty":"200g"},{"name":"safran","qty":"1 dose"},{"name":"oignons frits","qty":"3"},{"name":"gingembre","qty":"3 cm"},{"name":"ail","qty":"4 gousses"},{"name":"ghee","qty":"60g"},{"name":"épices entières","qty":"assortiment"}]',
  '["Mariner l''agneau dans yaourt et épices 4h.","Cuire l''agneau.","Cuire le riz basmati à moitié.","Alterner riz et viande dans la casserole.","Couvrir et cuire dum 25 min.","Servir avec raita."]'
),
(
  'Dal Makhani',
  'Lentilles noires et haricots rouges mijotés toute la nuit avec beurre, crème et épices.',
  'https://images.unsplash.com/photo-1546069901-522a32781b52?w=800&q=80&fit=crop',
  'indienne', 480, 'facile', 380, true, true,
  '[{"name":"lentilles noires (urad)","qty":"200g"},{"name":"haricots rouges","qty":"50g"},{"name":"tomates","qty":"2"},{"name":"beurre","qty":"50g"},{"name":"crème","qty":"10cl"},{"name":"garam masala","qty":"1 cc"},{"name":"gingembre","qty":"1 cm"},{"name":"ail","qty":"3 gousses"}]',
  '["Faire tremper les légumineuses 8h.","Cuire jusqu''à tendreté (2h).","Préparer le tadka : beurre, ail, gingembre, tomates.","Mélanger avec les lentilles.","Ajouter crème et beurre, mijoter 30 min."]'
),
(
  'Naan fromage ail',
  'Pain moelleux au fromage fondu et ail, cuit au tandoor. Incontournable à côté d''un curry.',
  'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80&fit=crop',
  'indienne', 90, 'moyen', 290, false, false,
  '[{"name":"farine","qty":"400g"},{"name":"yaourt","qty":"100g"},{"name":"levure","qty":"7g"},{"name":"beurre","qty":"40g"},{"name":"mozzarella","qty":"150g"},{"name":"ail","qty":"4 gousses"},{"name":"coriandre","qty":"1/2 bouquet"}]',
  '["Préparer la pâte avec farine, yaourt, levure.","Laisser lever 1h.","Farcir chaque naan de fromage.","Cuire dans une poêle très chaude.","Badigeonner de beurre à l''ail et coriandre."]'
),

-- ── Américaine ────────────────────────────────────────────────
(
  'Smash Burger',
  'Deux steaks écrasés sur la plancha, cheddar fondu, cornichons, oignons et sauce burger maison.',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&fit=crop',
  'américaine', 20, 'facile', 680, false, false,
  '[{"name":"bœuf haché 20%","qty":"300g"},{"name":"cheddar","qty":"4 tranches"},{"name":"brioche","qty":"2 pains"},{"name":"cornichons","qty":"6"},{"name":"oignon","qty":"1"},{"name":"tomate","qty":"1"},{"name":"laitue","qty":"2 feuilles"},{"name":"sauce burger","qty":"4 cs"}]',
  '["Former 2 boules de 75g par burger.","Écraser à la spatule sur plancha très chaude.","Saler et laisser croûter 2 min.","Retourner, ajouter cheddar, couvrir.","Assembler sur brioche toastée."]'
),
(
  'Mac & Cheese',
  'Macaroni dans une sauce béchamel ultra-crémeuse au cheddar aged, gratiné de panko.',
  'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&q=80&fit=crop',
  'américaine', 40, 'facile', 590, false, false,
  '[{"name":"macaroni","qty":"400g"},{"name":"cheddar aged","qty":"300g"},{"name":"beurre","qty":"60g"},{"name":"farine","qty":"60g"},{"name":"lait entier","qty":"80cl"},{"name":"moutarde","qty":"1 cc"},{"name":"panko","qty":"50g"}]',
  '["Cuire les macaroni al dente.","Préparer la béchamel avec beurre, farine, lait.","Faire fondre le cheddar dans la béchamel.","Mélanger avec les pâtes.","Couvrir de panko et gratiner."]'
),
(
  'BBQ Ribs',
  'Travers de porc marinés, cuits lentement au four puis laqués à la sauce barbecue fumée.',
  'https://images.unsplash.com/photo-1544025162-d76594e8389c?w=800&q=80&fit=crop',
  'américaine', 240, 'moyen', 740, false, true,
  '[{"name":"travers de porc","qty":"1.5 kg"},{"name":"sauce barbecue","qty":"30cl"},{"name":"paprika fumé","qty":"2 cs"},{"name":"cassonade","qty":"2 cs"},{"name":"ail en poudre","qty":"1 cs"},{"name":"cumin","qty":"1 cc"},{"name":"sel","qty":"2 cc"}]',
  '["Appliquer le dry rub sur les travers.","Emballer dans papier alu et cuire 3h à 150°C.","Déballer, napper de sauce barbecue.","Passer 10 min sous le gril à haute température.","Laisser reposer 5 min avant de trancher."]'
),
(
  'Pancakes & sirop d''érable',
  'Pancakes moelleux à la vanille, bacon croustillant et vrai sirop d''érable canadien.',
  'https://images.unsplash.com/photo-1551529834-525807d6b4f3?w=800&q=80&fit=crop',
  'américaine', 20, 'facile', 450, false, false,
  '[{"name":"farine","qty":"200g"},{"name":"lait","qty":"25cl"},{"name":"œufs","qty":"2"},{"name":"levure","qty":"1 cs"},{"name":"sucre","qty":"2 cs"},{"name":"vanille","qty":"1 cc"},{"name":"sirop d''érable","qty":"8 cs"},{"name":"bacon","qty":"8 tranches"}]',
  '["Mélanger ingrédients secs puis humides.","Cuire les pancakes 2 min par côté dans une poêle légèrement beurrée.","Faire griller le bacon.","Empiler les pancakes, napper de sirop."]'
),
(
  'Chicken Wings Buffalo',
  'Ailes de poulet frites croustillantes nappées de sauce Buffalo épicée, servies avec blue cheese.',
  'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80&fit=crop',
  'américaine', 40, 'facile', 520, false, true,
  '[{"name":"ailes de poulet","qty":"1 kg"},{"name":"sauce piquante","qty":"10cl"},{"name":"beurre","qty":"60g"},{"name":"ail en poudre","qty":"1 cc"},{"name":"paprika","qty":"1 cc"},{"name":"blue cheese","qty":"100g"},{"name":"céleri","qty":"2 branches"}]',
  '["Sécher les ailes et assaisonner.","Frire à 180°C pendant 12 min.","Préparer la sauce Buffalo (sauce piquante + beurre fondu).","Enrober les ailes de sauce.","Servir avec dip au blue cheese et céleri."]'
),

-- ── Asiatique ────────────────────────────────────────────────
(
  'Pad Thaï aux crevettes',
  'Nouilles de riz sautées avec crevettes, œufs, pousses de soja, cacahuètes et citron vert.',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80&fit=crop',
  'asiatique', 25, 'moyen', 480, false, true,
  '[{"name":"nouilles de riz","qty":"300g"},{"name":"crevettes","qty":"300g"},{"name":"œufs","qty":"3"},{"name":"pousses de soja","qty":"150g"},{"name":"cacahuètes","qty":"80g"},{"name":"sauce pad thai","qty":"5 cs"},{"name":"oignons verts","qty":"3"},{"name":"citrons verts","qty":"2"}]',
  '["Tremper les nouilles dans l''eau tiède.","Faire sauter les crevettes et réserver.","Brouiller les œufs dans le wok.","Ajouter nouilles et sauce pad thai.","Incorporer les crevettes, soja, oignons.","Servir avec cacahuètes et citron vert."]'
),
(
  'Bo Bun vietnamien',
  'Vermicelles de riz froids, bœuf grillé, rouleaux de printemps, herbes fraîches et sauce nuoc mam.',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80&fit=crop',
  'asiatique', 35, 'facile', 420, false, true,
  '[{"name":"vermicelles de riz","qty":"300g"},{"name":"bœuf (rumsteak)","qty":"300g"},{"name":"rouleaux de printemps","qty":"8"},{"name":"laitue","qty":"4 feuilles"},{"name":"concombre","qty":"1"},{"name":"menthe","qty":"1 bouquet"},{"name":"sauce nuoc mam","qty":"6 cs"},{"name":"citron vert","qty":"1"},{"name":"cacahuètes","qty":"50g"}]',
  '["Cuire et refroidir les vermicelles.","Mariner et griller le bœuf en lamelles.","Préparer la sauce nuoc mam citronnée.","Assembler : vermicelles, légumes, herbes.","Poser le bœuf et les rouleaux.","Napper de sauce et parsemer de cacahuètes."]'
),
(
  'Poulet Général Tso',
  'Poulet frit croustillant laqué d''une sauce sucrée-épicée à l''ail, gingembre et piment.',
  'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&q=80&fit=crop',
  'asiatique', 35, 'moyen', 560, false, false,
  '[{"name":"poulet (cuisse)","qty":"600g"},{"name":"maïzena","qty":"80g"},{"name":"sauce soja","qty":"4 cs"},{"name":"vinaigre de riz","qty":"2 cs"},{"name":"sucre","qty":"2 cs"},{"name":"ail","qty":"3 gousses"},{"name":"gingembre","qty":"2 cm"},{"name":"piments séchés","qty":"4"}]',
  '["Couper et enrober le poulet de maïzena.","Frire à 180°C jusqu''à croustillance.","Préparer la sauce dans le wok.","Enrober le poulet de sauce et sauter 2 min.","Servir avec riz vapeur."]'
),
(
  'Nasi Goreng',
  'Riz frit indonésien épicé à la pâte de crevettes, œuf au plat, chips de crevette et satay.',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&fit=crop',
  'asiatique', 20, 'facile', 490, false, true,
  '[{"name":"riz cuit (veille)","qty":"400g"},{"name":"œufs","qty":"2"},{"name":"poulet","qty":"200g"},{"name":"kecap manis","qty":"3 cs"},{"name":"pâte de crevettes","qty":"1 cc"},{"name":"ail","qty":"2 gousses"},{"name":"échalote","qty":"2"},{"name":"krupuk","qty":"50g"}]',
  '["Faire revenir ail, échalote, pâte de crevettes.","Ajouter le poulet et sauter.","Incorporer le riz froid.","Assaisonner avec kecap manis.","Servir avec œuf au plat et krupuk."]'
),
(
  'Bibimbap',
  'Bol coréen : riz, légumes assaisonnés, bœuf mariné, œuf et sauce gochujang. Tout se mélange.',
  'https://images.unsplash.com/photo-1546069901-522a32781b52?w=800&q=80&fit=crop',
  'asiatique', 45, 'moyen', 510, false, true,
  '[{"name":"riz à sushi","qty":"300g"},{"name":"bœuf haché","qty":"200g"},{"name":"épinards","qty":"100g"},{"name":"carottes","qty":"1"},{"name":"courgette","qty":"1"},{"name":"pousses de soja","qty":"100g"},{"name":"œuf","qty":"2"},{"name":"gochujang","qty":"3 cs"},{"name":"huile de sésame","qty":"2 cs"}]',
  '["Cuire le riz.","Préparer chaque légume séparément assaisonné.","Faire sauter le bœuf avec soja et sésame.","Cuire les œufs au plat.","Assembler dans un bol : riz, légumes en secteurs, bœuf, œuf.","Arroser de gochujang et mélanger."]'
),

-- ── Méditerranéenne ────────────────────────────────────────────
(
  'Moussaka grecque',
  'Gratin d''aubergines, de viande d''agneau et de sauce béchamel. Un classique de la cuisine grecque.',
  'https://images.unsplash.com/photo-1540189549336-e6e99de663ad?w=800&q=80&fit=crop',
  'méditerranéenne', 90, 'moyen', 520, false, true,
  '[{"name":"aubergines","qty":"3"},{"name":"agneau haché","qty":"500g"},{"name":"tomates concassées","qty":"400g"},{"name":"oignon","qty":"1"},{"name":"cannelle","qty":"1/2 cc"},{"name":"lait","qty":"50cl"},{"name":"beurre","qty":"60g"},{"name":"farine","qty":"60g"},{"name":"parmesan","qty":"60g"}]',
  '["Trancher et dorer les aubergines.","Préparer la viande avec oignon, tomate, cannelle.","Préparer la béchamel.","Alterner couches : aubergines, viande, béchamel.","Saupoudrer de parmesan et cuire 40 min à 180°C."]'
),
(
  'Falafel & houmous',
  'Boulettes de pois chiches aux herbes, frites croustillantes, avec houmous crémeux et pain pita.',
  'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=800&q=80&fit=crop',
  'méditerranéenne', 30, 'facile', 350, true, true,
  '[{"name":"pois chiches crus trempés","qty":"300g"},{"name":"oignon","qty":"1"},{"name":"ail","qty":"3 gousses"},{"name":"coriandre","qty":"1 bouquet"},{"name":"persil","qty":"1 bouquet"},{"name":"cumin","qty":"1 cc"},{"name":"tahini","qty":"80g"},{"name":"citron","qty":"1"},{"name":"pita","qty":"4"}]',
  '["Mixer les pois chiches crus avec herbes et épices.","Former des boulettes et réfrigérer 30 min.","Frire à 175°C jusqu''à dorure.","Préparer le houmous avec tahini, citron, ail.","Servir avec pita, houmous et légumes marinés."]'
),
(
  'Shakshuka',
  'Œufs pochés dans une sauce de tomates et poivrons épicée au cumin et paprika. Spécialité tunisienne.',
  'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=800&q=80&fit=crop',
  'méditerranéenne', 30, 'facile', 280, true, true,
  '[{"name":"œufs","qty":"4"},{"name":"tomates concassées","qty":"400g"},{"name":"poivrons","qty":"2"},{"name":"oignon","qty":"1"},{"name":"ail","qty":"3 gousses"},{"name":"cumin","qty":"1 cc"},{"name":"paprika fumé","qty":"1 cc"},{"name":"piment","qty":"1/2 cc"},{"name":"feta","qty":"80g"}]',
  '["Faire revenir oignon, ail, poivrons.","Ajouter épices et tomates, mijoter 10 min.","Creuser des puits pour les œufs.","Casser les œufs et couvrir 5-8 min.","Parsemer de feta et servir avec pain pita."]'
),
(
  'Paella valenciana',
  'Riz à la poêle, poulet, lapin, haricots verts, tomate et safran. La vraie recette de Valence.',
  'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&q=80&fit=crop',
  'méditerranéenne', 60, 'difficile', 540, false, true,
  '[{"name":"riz à paella","qty":"400g"},{"name":"poulet","qty":"500g"},{"name":"lapin","qty":"300g"},{"name":"haricots verts","qty":"200g"},{"name":"tomates","qty":"2"},{"name":"safran","qty":"2 doses"},{"name":"paprika doux","qty":"1 cs"},{"name":"bouillon","qty":"1.2L"},{"name":"huile d''olive","qty":"6 cs"}]',
  '["Dorer viandes dans l''huile.","Ajouter tomates, paprika, safran.","Incorporer le riz et nacrer.","Mouiller avec le bouillon chaud.","Cuire 18 min sans remuer.","Laisser reposer 5 min sous torchon."]'
),
(
  'Dolmades',
  'Feuilles de vigne farcies de riz, herbes et citron. Servies froides en mezze avec yaourt.',
  'https://images.unsplash.com/photo-1565557623262-b51e2b0f55bb?w=800&q=80&fit=crop',
  'méditerranéenne', 90, 'moyen', 210, true, true,
  '[{"name":"feuilles de vigne","qty":"30"},{"name":"riz rond","qty":"200g"},{"name":"oignon","qty":"1"},{"name":"menthe fraîche","qty":"1 bouquet"},{"name":"aneth","qty":"1 bouquet"},{"name":"citrons","qty":"2"},{"name":"huile d''olive","qty":"8 cs"}]',
  '["Blanchir les feuilles de vigne.","Préparer la farce riz, herbes, oignon, huile.","Rouler les feuilles bien serrées.","Cuire dans un bouillon citronné 40 min.","Servir tiède ou froid avec yaourt."]'
),

-- ── Végétarienne / Healthy ────────────────────────────────────
(
  'Buddha Bowl',
  'Bol coloré : quinoa, pois chiches rôtis, avocat, légumes grillés, tahini-citron.',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&fit=crop',
  'végétarienne', 30, 'facile', 420, true, true,
  '[{"name":"quinoa","qty":"200g"},{"name":"pois chiches","qty":"200g"},{"name":"avocat","qty":"1"},{"name":"patate douce","qty":"1"},{"name":"épinards","qty":"60g"},{"name":"concombre","qty":"1/2"},{"name":"tahini","qty":"3 cs"},{"name":"citron","qty":"1"},{"name":"graines de sésame","qty":"1 cs"}]',
  '["Cuire le quinoa.","Rôtir les pois chiches à 200°C 20 min.","Rôtir la patate douce.","Préparer le dressing tahini-citron.","Assembler le bol et arroser de dressing."]'
),
(
  'Curry de pois chiches',
  'Pois chiches dans une sauce curry crémeuse à la noix de coco, tomates et épinards.',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80&fit=crop',
  'végétarienne', 30, 'facile', 360, true, true,
  '[{"name":"pois chiches cuits","qty":"400g"},{"name":"lait de coco","qty":"40cl"},{"name":"tomates concassées","qty":"200g"},{"name":"épinards","qty":"100g"},{"name":"oignon","qty":"1"},{"name":"ail","qty":"3 gousses"},{"name":"curry en poudre","qty":"2 cs"},{"name":"cumin","qty":"1 cc"}]',
  '["Faire revenir oignon, ail, épices.","Ajouter tomates et lait de coco.","Incorporer les pois chiches.","Mijoter 15 min.","Ajouter les épinards et servir avec riz basmati."]'
),
(
  'Pizza végétarienne',
  'Base tomate, mozzarella, poivrons grillés, champignons, olives et roquette fraîche.',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80&fit=crop',
  'végétarienne', 30, 'facile', 390, false, false,
  '[{"name":"pâte à pizza","qty":"1"},{"name":"sauce tomate","qty":"100g"},{"name":"mozzarella","qty":"150g"},{"name":"poivrons grillés","qty":"1"},{"name":"champignons","qty":"100g"},{"name":"olives noires","qty":"50g"},{"name":"roquette","qty":"30g"},{"name":"parmesan","qty":"30g"}]',
  '["Préchauffer le four à 250°C.","Étaler la pâte et garnir de sauce.","Ajouter mozzarella, légumes, olives.","Cuire 10 min.","Garnir de roquette et parmesan à la sortie."]'
),
(
  'Salade César végétarienne',
  'Romaine, croûtons à l''ail, parmesan copeaux, œufs durs et sauce César au citron.',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&fit=crop',
  'végétarienne', 20, 'facile', 310, false, false,
  '[{"name":"romaine","qty":"1"},{"name":"croûtons","qty":"80g"},{"name":"parmesan","qty":"50g"},{"name":"œufs","qty":"2"},{"name":"anchois","qty":"4"},{"name":"ail","qty":"1 gousse"},{"name":"citron","qty":"1"},{"name":"moutarde","qty":"1 cc"},{"name":"huile d''olive","qty":"6 cs"}]',
  '["Préparer la sauce César en émulsion.","Cuire les œufs durs.","Tailler la romaine et égoutter.","Mélanger avec la sauce.","Ajouter croûtons, parmesan en copeaux, œuf tranché."]'
),
(
  'Soupe miso tofu',
  'Bouillon dashi délicat, miso blanc, tofu soyeux, wakame et oignons verts. Zen et réconfortant.',
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80&fit=crop',
  'végétarienne', 15, 'facile', 120, true, true,
  '[{"name":"dashi (kombu + shiitaké)","qty":"1L"},{"name":"miso blanc","qty":"4 cs"},{"name":"tofu soyeux","qty":"200g"},{"name":"wakame séché","qty":"10g"},{"name":"oignons verts","qty":"3"}]',
  '["Préparer le dashi végétal.","Réhydrater le wakame.","Porter le bouillon à frémissement.","Diluer le miso hors du feu.","Ajouter tofu en dés et wakame.","Servir immédiatement avec oignons verts."]'
);
