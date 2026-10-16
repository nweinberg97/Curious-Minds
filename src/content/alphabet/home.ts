import type { AlphabetCategory } from '../types';

/* ---------------- Food ---------------- */

const fruits = [
  '*apple', '*banana', '*orange', '*grape', '*pear', '*peach', '*plum', '*cherry', '*lemon', '*lime',
  '*mango', '*pineapple', '*strawberry', '*watermelon', '*kiwi', '*apricot', 'nectarine', '*raspberry',
  '*blueberry', 'blackberry', 'cranberry', 'gooseberry', 'elderberry', 'boysenberry', 'loganberry',
  'mulberry', 'huckleberry', 'lingonberry', 'cloudberry', '*grapefruit', '*tangerine', 'clementine',
  'mandarin', 'satsuma', 'kumquat', 'yuzu', 'pomelo', 'ugli fruit', 'papaya', 'guava', 'lychee|litchi',
  'longan', 'rambutan', 'durian', 'jackfruit', 'mangosteen', 'dragon fruit', 'passion fruit',
  'star fruit', 'persimmon', 'pomegranate', '*fig', '*date', 'quince', 'medlar', 'cantaloupe',
  'honeydew', '*melon', 'feijoa', 'tamarind', 'soursop', 'cherimoya', 'jabuticaba', 'acerola',
  'açaí|acai', '*olive', '*avocado', 'damson', 'greengage', 'rhubarb', 'currant', '*raisin', 'sultana',
  'prune', 'kiwano', 'ackee', 'loquat', 'nashi',
];

const vegetables = [
  '*carrot', '*potato', '*tomato', '*onion', '*broccoli', '*cabbage', '*lettuce', '*cucumber',
  '*pea', '*corn', '*mushroom', '*pepper', '*garlic', '*spinach', '*celery', '*cauliflower',
  '*courgette|zucchini', '*aubergine|eggplant', '*asparagus', 'artichoke', 'beetroot|beet', '*kale',
  '*leek', 'shallot', 'scallion', '*radish', '*turnip', 'swede|rutabaga', '*parsnip', 'yam',
  '*sweet potato', 'cassava', 'taro', 'okra', 'fennel', 'kohlrabi', 'chard', 'watercress', 'rocket|arugula',
  'endive', 'chicory', 'radicchio', 'bok choy|pak choi', 'brussels sprout', 'squash', '*pumpkin',
  'butternut squash', 'marrow', 'gourd', 'jicama', 'jerusalem artichoke', 'celeriac', 'salsify',
  'horseradish', 'wasabi', 'daikon', 'edamame', '*green bean', 'runner bean', 'broad bean|fava bean',
  '*lentil', 'chickpea|garbanzo', 'kidney bean', 'black bean', 'mung bean', 'soybean', 'bean sprout',
  'bamboo shoot', 'water chestnut', 'lotus root', 'mangetout|snow pea', 'sugar snap pea', 'samphire',
  'nettle', 'sorrel', 'tomatillo', 'jalapeño|jalapeno', 'habanero', '*chilli|chili', 'plantain',
  '*ginger', 'iceberg lettuce', 'romaine', 'yardlong bean', 'ulluco', 'kai lan', '*quinoa',
];

const breadsAndGrains = [
  '*bread', '*rice', '*pasta', '*bagel', '*toast', '*pancake', '*waffle', '*croissant', '*muffin',
  '*baguette', 'brioche', 'ciabatta', 'focaccia', 'sourdough', 'rye bread', 'pumpernickel', 'challah',
  '*naan', '*pitta|pita', 'chapati', 'roti', 'paratha', 'puri', '*tortilla', 'crumpet', 'english muffin',
  '*scone', 'bap', '*bun', '*roll', '*pretzel', 'flatbread', 'lavash', 'injera', 'arepa', 'bannock',
  'soda bread', 'cornbread', 'zwieback', 'rusk', '*cracker', 'oatcake', 'crispbread', 'matzo|matzah',
  'grissini', 'barley', '*oats', '*porridge', '*oatmeal', 'muesli', 'granola', 'couscous', 'bulgur',
  'polenta', 'grits', 'semolina', 'millet', 'buckwheat', 'spelt', 'freekeh', 'farro', 'sorghum',
  'teff', 'amaranth', 'wild rice', '*noodle', '*spaghetti', '*macaroni', 'penne', 'fusilli', 'farfalle',
  'linguine', 'fettuccine', 'tagliatelle', 'pappardelle', 'rigatoni', 'orzo', 'vermicelli', 'udon',
  'soba', '*ramen', 'gnocchi', '*ravioli', 'tortellini', 'cannelloni', 'ziti', 'orecchiette', 'bao',
  'kaiser roll', 'yeast', 'flour', 'wheat', '*cereal', 'cornflakes',
];

const cheesesAndDairy = [
  '*cheese', '*butter', '*yoghurt|yogurt', '*egg', '*cream', '*cheddar', '*brie', 'camembert', 'stilton',
  'gouda', 'edam', 'emmental', 'gruyère|gruyere', '*parmesan', '*mozzarella', 'ricotta', 'mascarpone',
  '*feta', 'halloumi', 'paneer', 'gorgonzola', 'roquefort', 'manchego', 'pecorino', 'provolone',
  'jarlsberg', 'wensleydale', 'red leicester', 'double gloucester', 'cottage cheese', 'cream cheese',
  'quark', 'labneh', 'burrata', 'taleggio', 'fontina', 'havarti', 'monterey jack', 'colby', 'comté|comte',
  'reblochon', 'raclette', 'limburger', 'boursin', 'queso fresco', 'oaxaca cheese', 'skyr', 'kefir',
  'crème fraîche|creme fraiche', 'clotted cream', 'sour cream', 'buttermilk', 'ghee', 'curd', 'whey',
  'vacherin', 'xynotyro', 'urda', 'yarg', 'kashkaval', 'cambozola', 'zamorano',
];

const meatAndFish = [
  '*chicken', '*beef', '*pork', '*bacon', '*ham', '*sausage', '*steak', '*burger|hamburger',
  '*fish', '*salmon', '*tuna', '*lamb', 'mutton', 'veal', 'venison', '*turkey', '*duck', 'goose',
  'quail', 'pheasant', 'rabbit', 'goat', 'bison', 'kangaroo', 'ostrich', 'mince', '*meatball',
  'meatloaf', '*salami', '*pepperoni', 'chorizo', 'prosciutto', 'pancetta', 'mortadella', 'bresaola',
  'pastrami', 'corned beef', 'brisket', 'jerky', 'biltong', 'frankfurter', '*hot dog', 'bratwurst',
  'kielbasa', 'black pudding', 'haggis', 'liver', 'kidney', 'tripe', 'oxtail', 'spare rib', '*cod',
  'haddock', 'halibut', 'plaice', 'sole', 'mackerel', 'herring', 'kipper', 'sardine', 'anchovy',
  '*trout', 'tilapia', 'catfish', 'snapper', 'sea bass', 'monkfish', 'swordfish', 'pollock', 'eel',
  '*prawn', '*shrimp', '*lobster', '*crab', 'crayfish', 'scampi', 'langoustine', 'mussel', 'oyster',
  'clam', 'scallop', 'squid', 'calamari', 'octopus', 'caviar', 'roe', 'whitebait', '*tofu', 'tempeh',
  'seitan', 'quorn', 'yellowtail', 'whiting', 'dover sole', 'zander', 'pigeon', 'nduja', 'gammon',
];

const dishes = [
  '*pizza', '*sandwich', '*soup', '*salad', '*curry', '*lasagne|lasagna', '*omelette|omelet', '*taco',
  '*sushi', '*fries', '*chips', '*stew', '*pie', '*risotto', 'paella', 'pho', 'bibimbap', '*burrito',
  '*enchilada', '*quesadilla', 'fajita', '*nachos', 'tamale', 'chimichanga', 'tostada', 'mole',
  '*guacamole', 'salsa', 'ceviche', 'empanada', 'feijoada', 'churrasco', 'moussaka', 'souvlaki',
  'gyro', 'spanakopita', 'tzatziki', 'dolma', '*hummus', '*falafel', 'tabbouleh', 'shakshuka', '*kebab',
  'shawarma', 'kofta', 'baba ganoush', 'fattoush', 'tagine', 'jollof rice', 'bobotie', 'bunny chow',
  'fufu', 'ugali', 'biryani', 'dal|dhal', 'korma', 'vindaloo', 'tikka masala', '*samosa', 'pakora',
  'bhaji', 'dosa', 'idli', 'vada', 'pilau|pilaf', 'kedgeree', 'dim sum', '*dumpling', 'wonton',
  '*spring roll', 'chow mein', '*fried rice', 'kung pao chicken', 'mapo tofu', 'peking duck', 'congee',
  'xiaolongbao', 'jiaozi', 'tempura', 'teriyaki', 'yakitori', 'sashimi', 'onigiri', 'okonomiyaki',
  'takoyaki', 'gyoza', 'katsu', 'miso soup', 'kimchi', 'bulgogi', 'japchae', 'tteokbokki', '*pad thai',
];

const dishes2 = [
  'tom yum', 'green curry', 'satay', 'nasi goreng', 'rendang', 'laksa', 'adobo', 'lumpia', 'banh mi',
  'goulash', 'pierogi', 'borscht', 'blini', 'stroganoff', 'schnitzel', 'sauerkraut', 'spätzle|spatzle',
  'fondue', 'rösti|rosti', 'ratatouille', 'bouillabaisse', 'cassoulet', 'coq au vin', '*quiche',
  '*crêpe|crepe', 'croque monsieur', 'gazpacho', 'tortilla española|tortilla espanola', 'tapas',
  'carbonara', 'bolognese', 'minestrone', 'ossobuco', 'arancini', 'bruschetta', 'calzone',
  'polpette', '*fish and chips', 'shepherd’s pie|shepherd\'s pie|shepherds pie',
  'cottage pie', 'toad in the hole', 'bangers and mash', 'yorkshire pudding', 'roast dinner',
  'ploughman’s lunch|ploughman\'s lunch|ploughmans lunch', 'scotch egg', 'pork pie', 'pasty',
  'welsh rarebit', 'bubble and squeak', 'beef wellington', 'hotpot', 'chowder', 'gumbo', 'jambalaya',
  'chili con carne', 'mac and cheese', 'pot roast', 'barbecue', 'coleslaw',
  'poutine', 'hash brown', 'nasi lemak', 'roti canai', 'haleem', 'nihari',
  'jalfrezi', 'xacuti', 'zarzuela', 'zuppa toscana', 'zrazy', 'yakisoba', 'yassa', 
  'umeboshi', 'upma', 'quiche lorraine', 'queso dip', 'kibbeh', 'knish', 'kugel', 'latke', 'lox',
  'gefilte fish', 'vol-au-vent', 'velouté|veloute', 'vichyssoise', 'waldorf salad', 'welsh cake',
  'wiener schnitzel', 'casserole', '*stir fry', 'sloppy joe', 'club sandwich', 'bento', 'mezze|meze',
];

const sweets = [
  '*cake', '*cookie', '*biscuit', '*chocolate', '*ice cream', '*doughnut|donut', '*brownie',
  '*cupcake', '*jelly', '*custard', '*trifle', 'tiramisu', '*cheesecake', 'gateau', 'pavlova',
  '*meringue', 'éclair|eclair', 'profiterole', 'macaron', 'macaroon', 'madeleine', 'mille-feuille|mille feuille',
  'tarte tatin', 'crème brûlée|creme brulee', 'crème caramel|creme caramel', '*mousse', 'soufflé|souffle',
  'panna cotta', 'cannoli', 'gelato', '*sorbet', 'sherbet', 'affogato', 'zabaglione', 'zeppole',
  'baklava', 'halva|halwa', 'turkish delight', 'kulfi', 'gulab jamun', 'jalebi', 'barfi', 'ladoo',
  'mochi', 'dorayaki', 'churro', 'flan', 'tres leches', 'alfajor', 'brigadeiro', '*apple pie',
  'apple crumble', 'cobbler', 'strudel', 'sachertorte', 'black forest gateau', 'stollen', 'lebkuchen',
  'panettone', 'pandoro', 'battenberg', 'victoria sponge', 'bakewell tart', 'eccles cake',
  'jam roly-poly|jam roly poly', 'spotted dick', 'sticky toffee pudding', 'bread and butter pudding',
  'rice pudding', 'eton mess', 'fool', 'syllabub', 'banoffee pie', 'key lime pie', 'pecan pie',
  'pumpkin pie', 'lemon meringue pie', 'shortbread', 'flapjack', '*gingerbread', 'parkin',
  'fruitcake', 'carrot cake', 'red velvet cake', 'angel food cake', 'pound cake', 'swiss roll',
];

const sweets2 = [
  'jam tart', 'treacle tart', 'mince pie', 'christmas pudding', 'yule log', 'kouign-amann|kouign amann',
  'pain au chocolat', 'danish pastry', 'cinnamon roll', 'chelsea bun', 'hot cross bun', 'beignet',
  'cronut', 'whoopie pie', 'snickerdoodle', 'biscotti', 'amaretti', 'florentine', 'tuile',
  'wafer', '*fudge', '*toffee', '*caramel', 'butterscotch', 'nougat', 'marzipan', 'praline', 'truffle',
  '*marshmallow', '*lollipop', 'candy floss|cotton candy', 'gobstopper', 'liquorice|licorice',
  '*jelly bean', 'gummy bear', 'humbug', 'rock', 'brittle', 'honeycomb', 'popsicle', 'ice lolly',
  'sundae', 'banana split', 'knickerbocker glory', 'semifreddo', 'granita', 'frozen yoghurt|frozen yogurt',
  '*pudding', '*tart', '*crumble', 'roulade', 'vanilla slice', 'yum yum', 'lamington', 'anzac biscuit',
  'jaffa cake', 'bara brith', 'clafoutis', 'far breton', 'galette', 'kheer', 'kolache',
  'queen of puddings', 'rugelach', 'hamantash', 
];

const snacksAndCondiments = [
  '*crisps', '*popcorn', '*peanut butter', '*jam', '*honey', '*ketchup', '*mustard', '*mayonnaise',
  '*nut', '*peanut', '*almond', 'cashew', '*walnut', 'pecan', 'hazelnut', 'pistachio', 'macadamia',
  'brazil nut', 'chestnut', 'pine nut', '*coconut', 'sunflower seed', 'pumpkin seed', 'sesame seed',
  'chia seed', 'flaxseed|linseed', 'trail mix', 'pork scratching', 'tortilla chip', 'pretzel stick',
  'rice cake', 'marmalade', 'marmite', 'vegemite', 'nutella', 'lemon curd', 'chutney', 'relish',
  '*pickle', 'gherkin', 'piccalilli', '*pesto', '*gravy', 'aioli', 'vinaigrette',
  'hollandaise', 'béarnaise|bearnaise', 'béchamel|bechamel', 'tartare sauce', 'soy sauce',
  'worcestershire sauce', 'tabasco', 'sriracha', 'harissa', 'tahini', 'miso', 'fish sauce',
  'hoisin', 'oyster sauce', 'ponzu', 'gochujang', 'chimichurri', 'romesco', 'zhoug', 'ras el hanout',
  'za’atar|za\'atar|zaatar', 'olive oil', '*vinegar', '*salt', '*sugar', 'syrup', 'maple syrup', 'treacle',
  'molasses', 'stock', 'broth', 'croûton|crouton', 'tapenade', 'xo sauce', 
];

const herbsAndSpices = [
  '*basil', 'oregano', 'thyme', 'rosemary', 'sage', 'parsley', 'coriander|cilantro', '*mint', 'dill',
  'chive', 'tarragon', 'bay leaf', 'marjoram', 'lemongrass', '*cinnamon', 'nutmeg', 'clove', 'cumin',
  'turmeric', 'paprika', 'saffron', 'cardamom', 'star anise', 'fenugreek', 'allspice', 'vanilla',
  'mace', 'sumac', 'juniper berry', 'caraway', 'garam masala', 'curry powder', 'cayenne', 'peppercorn',
  'mustard seed', 'nigella seed', 'asafoetida', 'galangal', 'kaffir lime leaf', 'lovage', 'angelica',
  'borage', 'chervil', 'epazote', 'yarrow', 'zest',
];

const foods = [
  ...fruits, ...vegetables, ...breadsAndGrains, ...cheesesAndDairy, ...meatAndFish,
  ...dishes, ...dishes2, ...sweets, ...sweets2, ...snacksAndCondiments, ...herbsAndSpices,
];

/* ---------------- Around the house ---------------- */

const furniture = [
  '*chair', '*table', '*bed', '*sofa', '*desk', '*wardrobe', '*bookcase', '*shelf', '*stool', '*bench',
  '*armchair', '*couch', 'settee', 'futon', 'ottoman', 'pouffe|pouf', 'footstool', 'recliner',
  'rocking chair', 'beanbag', 'chaise longue', 'divan', 'daybed', 'bunk bed', 'cot|crib', 'cradle',
  'high chair', 'headboard', '*mattress', '*dresser', 'chest of drawers', 'nightstand|bedside table',
  'sideboard', '*cabinet', '*cupboard', 'hutch', 'armoire', 'tallboy', 'credenza',
  'console table', '*coffee table', 'dining table', 'side table', 'trestle table', 'dressing table',
  'vanity', 'bureau', 'escritoire', 'writing desk', 'filing cabinet', 'hat stand', 'coat rack',
  'umbrella stand', 'shoe rack', 'magazine rack', 'plant stand', 'room divider', 'screen',
  '*hammock', 'deckchair', 'sun lounger', 'barstool', 'whatnot', 'étagère|etagere',
  'lowboy', 'highboy', 'kitchen island', 'trunk', 'blanket box', 'toy box', 'wine rack', 'tv stand',
  'loveseat', 'sofa bed', 'murphy bed', 'water bed',
];

const appliances = [
  '*fridge|refrigerator', '*freezer', '*oven', '*microwave', '*kettle', '*toaster', '*dishwasher',
  '*washing machine', '*television|tv', '*lamp', '*vacuum cleaner|vacuum', 'tumble dryer|dryer',
  '*cooker', '*stove', 'hob', 'range', 'grill', 'air fryer', 'slow cooker', 'pressure cooker',
  'rice cooker', '*blender', 'food processor', '*mixer', 'stand mixer', 'juicer', 'coffee maker',
  'coffee machine', 'espresso machine', 'coffee grinder', 'bread maker', 'sandwich toaster',
  'waffle iron', 'deep fryer', 'ice cream maker', 'yoghurt maker|yogurt maker', 'dehydrator',
  'water filter', 'water heater', 'boiler', '*radiator', '*heater', '*fan', 'air conditioner',
  'humidifier', 'dehumidifier', 'air purifier', 'thermostat', 'smoke alarm', '*doorbell', 'intercom',
  '*iron', 'steamer', 'sewing machine', 'hair dryer|hairdryer', 'hair straightener', 'curling iron',
  'electric toothbrush', 'shaver', '*radio', 'stereo', 'speaker', 'record player|turntable',
  '*computer', '*laptop', 'printer', 'router', '*telephone|phone', 'answering machine', '*alarm clock',
  'games console', 'dvd player', 'projector', 'camera', 'tablet', 'extractor fan', 'trouser press',
  'robot vacuum', 'wine cooler', 'chest freezer', 
];

const kitchenware = [
  '*spoon', '*fork', '*knife', '*plate', '*bowl', '*cup', '*mug', '*glass', '*pan', '*pot',
  '*saucepan', '*frying pan|skillet', 'wok', 'casserole dish', 'dutch oven', 'roasting tin',
  'baking tray', 'cake tin', 'muffin tin', 'loaf tin', 'pie dish', 'ramekin', '*colander', 'sieve',
  'strainer', '*whisk', '*spatula', '*ladle', 'tongs', '*grater', 'peeler', 'masher', 'rolling pin',
  'chopping board|cutting board', 'measuring jug', 'measuring cup', 'measuring spoon', 'mixing bowl',
  'scales', 'timer', 'can opener|tin opener', 'bottle opener', 'corkscrew', 'nutcracker',
  'garlic press', 'pestle', 'mortar', 'zester', 'mandoline', 'salad spinner', 'funnel',
  'baster', 'skewer', 'oven glove|oven mitt', 'trivet', '*teapot', 'teaspoon',
  'tablespoon', 'saucer', 'tumbler', 'wine glass', 'goblet', '*jug|pitcher', 'carafe', 'decanter',
  'gravy boat', 'butter dish', 'sugar bowl', 'salt shaker', 'pepper mill', 'cruet', 'eggcup|egg cup',
  'tureen', 'platter', 'serving dish', 'cake stand', 'bread bin', 'bread knife', 'cleaver',
  'chopsticks', '*napkin', 'placemat', 'coaster', 'tablecloth', 'tea towel|dish towel', '*tray',
];

const kitchenware2 = [
  'kitchen roll', 'cling film|plastic wrap', 'tin foil|aluminium foil', 'baking paper', 'tupperware',
  'lunchbox', 'thermos|flask', 'water bottle', '*jar', 'kilner jar|mason jar', 'canister', 'spice rack',
  'knife block', 'dish rack', 'draining board', 'washing-up bowl|washing up bowl', 'scourer',
  '*sponge', 'dishcloth', '*bin|trash can', 'pedal bin', 'recycling bin', 'compost bin', 'piping bag',
  'pastry brush', 'cookie cutter', 'icing bag', 'meat thermometer', 'ice cube tray', 'jelly mould|jelly mold',
  'spoon rest', 'egg timer', 'egg slicer', 'pizza cutter', 'apple corer', 'melon baller',
  'potato ricer', 'quiche dish', 'quaich', 'urn', 'tea caddy', 'tea strainer', 'cafetière|cafetiere',
  'percolator', 'moka pot', 'samovar', 'yixing teapot', 'tagine pot', 'fondue set', 'crock pot',
];

const bedroomBathroom = [
  '*pillow', '*blanket', '*towel', '*mirror', '*toothbrush', '*soap', '*sheet', '*duvet', '*quilt',
  'eiderdown', 'bedspread', 'throw', '*cushion', 'bolster', '*pillowcase', 'valance', 'mattress topper',
  'electric blanket', 'hot water bottle', 'nightlight', 'bedside lamp', 'alarm', '*hanger|coat hanger',
  'laundry basket', 'hamper', 'clothes horse', 'airer', 'washing line|clothesline', 'clothes peg|clothespin',
  'ironing board', '*toilet', '*bath|bathtub', '*shower', '*sink', 'basin', '*tap|faucet', 'bidet', 'plunger',
  'toilet brush', 'toilet roll|toilet paper', 'bath mat', 'shower curtain', 'towel rail', 'flannel|washcloth',
  'loofah', 'bath sponge', '*toothpaste', 'dental floss', 'mouthwash', '*shampoo', 'conditioner',
  'shower gel', '*razor', '*comb', '*hairbrush', 'tweezers', 'nail clippers', 'nail file', 'cotton bud',
  'bathroom scale', 'medicine cabinet', 'first aid kit', 'plaster|band-aid', 'thermometer',
  'tissue', 'deodorant', 'perfume', 'moisturiser|moisturizer', 'sunscreen', 'make-up bag|makeup bag',
  'jewellery box|jewelry box', 'vanity mirror', 'wash bag', 'potty', 'nappy|diaper',
];

const decor = [
  '*clock', '*rug', '*curtain', '*carpet', '*picture', '*vase', '*candle', 'blind', 'roller blind',
  'venetian blind', 'shutter', 'pelmet', 'curtain rail', 'curtain pole', 'net curtain', 'doormat',
  'runner', 'tapestry', '*painting', 'poster', '*photo frame|picture frame', 'print', 'ornament',
  'figurine', 'sculpture', 'statue', 'bust', 'potpourri', 'candlestick',
  'candelabra', 'chandelier', 'lampshade', 'lantern', 'fairy lights', 'floor lamp|standard lamp',
  'desk lamp', '*light bulb', 'light switch', 'socket', '*plug', 'extension lead|extension cord',
  'wallpaper', 'mural', 'houseplant|pot plant', 'plant pot', 'flowerpot', 'cactus', 'terrarium',
  'fish tank|aquarium', 'birdcage', 'dog bed', 'cat flap', 'litter tray|litter box', 'grandfather clock',
  'cuckoo clock', 'wall clock', 'mantelpiece|mantel', '*fireplace', 'fire guard|fireguard', 'poker',
  'coal scuttle', 'log basket', 'bellows', 'wind chime', 'dreamcatcher', 'globe', 'snow globe',
  'ashtray', 'incense', 'diffuser', '*piano', 'keyboard', 'yucca', 
];

const toolsAndCleaning = [
  '*hammer', '*screwdriver', '*broom', '*mop', '*bucket', '*ladder', '*scissors', '*saw', '*drill',
  '*spanner|wrench', '*pliers', 'chisel', 'mallet', '*tape measure', 'spirit level', 'stepladder',
  'stepstool', 'toolbox', '*nail', '*screw', 'bolt', 'washer', 'allen key', 'stanley knife|utility knife',
  'sandpaper', 'paintbrush', 'paint roller', 'glue gun', 'staple gun', '*stapler', 'hacksaw', 'vice|vise',
  'workbench', 'clamp', 'crowbar', '*torch|flashlight', 'battery', 'fuse', 'duct tape', 'sticky tape',
  '*dustpan', 'brush', 'feather duster', 'duster', 'squeegee', 'scrubbing brush', 'rubber gloves',
  'bleach', 'detergent', 'washing powder', 'fabric softener', 'spray bottle', 'dustbin', 'carpet beater',
  'lint roller', 'mousetrap', 'fly swatter', 'lawnmower|lawn mower', '*rake', '*spade', 'shovel', 'hoe',
  'trowel', 'garden fork', 'shears', 'secateurs|pruners', '*hose|hosepipe', 'watering can', 'wheelbarrow',
  'strimmer', 'leaf blower', 'hedge trimmer', 'sprinkler', 'barbecue grill', 'parasol', 'garden gnome',
  'bird feeder', 'bird bath', 'kennel', 'shed', 'greenhouse', 'compost heap', 'jack', 'jigsaw', 'level',
];

const miscHome = [
  '*door', '*window', '*key', '*book', '*pen', '*pencil', '*umbrella', '*bag', '*box', 'keyring',
  '*padlock', '*lock', 'latch', 'hinge', 'knob', 'doorknob', 'door handle', 'doorstop',
  'letterbox|mailbox', 'knocker', 'peephole', 'safe', 'money box|piggy bank', 'wallet', 'purse',
  '*notebook', 'notepad', 'diary', '*calendar', 'address book', '*envelope', 'stamp', 'paperclip',
  'drawing pin|thumbtack', '*rubber|eraser', '*ruler', 'sharpener', 'highlighter', 'marker', 'crayon',
  'felt-tip pen|felt tip pen', 'glue stick', 'hole punch', 'calculator', '*remote control|remote',
  'charger', 'cable', 'headphones', 'board game', 'jigsaw puzzle', 'playing cards', 'dice', 'teddy bear',
  'doll', 'yo-yo|yoyo', 'kite', '*basket', '*suitcase', 'rucksack|backpack', 'holdall', 'sleeping bag',
  'tent', 'airbed', 'bucket and spade', '*needle', 'thread', 'thimble', 'pin cushion|pincushion',
  'knitting needle', 'crochet hook', 'tape', 'string', 'twine', 'rope', '*matches', 'lighter',
  'fire extinguisher', 'fire blanket', 'carbon monoxide detector', 'burglar alarm', 'baby gate',
  'pram', 'pushchair|stroller', 'playpen', 'baby monitor', 'mobile', 'rattle', 'dummy|pacifier',
  'quilt cover', 'quill', 'vacuum flask', 'video recorder|vcr', 'ukulele', 'zip tie|cable tie',
  'zimmer frame|walking frame', 'walking stick', 'wheelchair', 'yardstick', 'wreath',
  'newspaper', 'magazine', 'cookbook', 'photo album', 'scrapbook', 'easel', 'guitar', 'violin', 'drum',
];

const household = [
  ...furniture, ...appliances, ...kitchenware, ...kitchenware2, ...bedroomBathroom, ...decor,
  ...toolsAndCleaning, ...miscHome,
];

/* ---------------- Things you wear ---------------- */

const tops = [
  '*shirt', '*t-shirt|t shirt|tshirt|tee shirt', '*jumper|sweater', '*jacket', '*coat', '*dress', '*skirt',
  '*blouse', '*hoodie', '*cardigan', '*vest', 'polo shirt', '*tank top', 'camisole', 'crop top', '*tunic',
  '*sweatshirt', 'pullover', 'turtleneck|polo neck', 'gilet', 'waistcoat', '*blazer', 'tuxedo', 'dinner jacket',
  '*suit', 'tailcoat', 'frock coat', 'morning coat', '*overcoat', '*raincoat', 'mackintosh|mac', 'trench coat',
  'parka', 'anorak', 'cagoule', 'windbreaker|windcheater', '*fleece', 'puffer jacket', 'bomber jacket',
  'leather jacket', 'denim jacket', 'duffel coat', 'pea coat|peacoat', '*cape', 'cloak', '*poncho', 'shawl',
  'stole', 'pashmina', 'bolero', 'shrug', '*kimono', 'yukata', '*sari|saree', 'salwar kameez|shalwar kameez',
  'kurta', 'dhoti', 'lungi', 'sarong', 'kaftan|caftan', 'djellaba', 'abaya', 'burqa', 'hijab', 'chador',
  'cheongsam|qipao', 'hanbok', 'dirndl', 'lederhosen', '*kilt', 'toga', 'sarape|serape', 'huipil', 'dashiki',
  'boubou', 'jerkin', 'doublet', 'corset', 'bodice', 'basque', 'smock', 'jersey', 'guernsey|gansey',
  'onesie', 'romper', '*jumpsuit', '*dungarees|overalls', 'boiler suit', 'wetsuit', 'drysuit',
];

const bottomsAndUnderwear = [
  '*trousers|pants', '*jeans', '*shorts', '*leggings', '*sock', '*pyjamas|pajamas', '*bra', '*underpants',
  'chinos', 'cargo pants', 'joggers', '*tracksuit', 'sweatpants', 'slacks', 'flares', 'culottes', 'capri pants',
  'palazzo pants', 'harem pants', 'jodhpurs', 'breeches', 'plus fours', 'knickerbockers', 'bermuda shorts',
  'hot pants', 'board shorts', 'cycling shorts', '*miniskirt', 'maxi skirt', 'pencil skirt', 'tutu', 'petticoat',
  'slip', 'knickers', 'panties', 'boxer shorts|boxers', 'briefs', 'y-fronts|y fronts', 'thong', 'g-string|g string',
  'stockings', '*tights|pantyhose', 'suspenders', 'garter', '*nightie|nightgown', 'nightshirt', '*dressing gown|bathrobe',
  '*robe', 'negligee', '*bikini', '*swimsuit', 'swimming costume', 'trunks', 'tankini', 'burkini', 'leotard',
  'unitard', 'sports bra', 'loincloth', 'thermal underwear', 'long johns', 'girdle', 'bustier', 'teddy',
  'babygro|babygrow', 'bib', 'legwarmers', 'kneesocks|knee socks', 'ankle socks',
  'jeggings', 'yoga pants', 'wrap skirt', 'zoot suit', 'sundress', 'ball gown', 'wedding dress', '*gown',
  'pinafore', '*apron', 'lab coat', '*uniform', 'cassock', 'habit', 'surplice', 'vestment', 
];

const footwear = [
  '*shoe', '*boot', '*trainer|sneaker', '*sandal', '*slipper', '*flip-flop|flip flop|thong sandal',
  '*high heel|heels', 'stiletto', 'court shoe|pump', 'wedge', 'platform shoe', 'ballet flat|ballet pump',
  '*loafer', 'moccasin', 'brogue', 'oxford', 'derby', 'monk shoe', 'boat shoe', 'deck shoe', 'espadrille',
  'mule', 'clog', 'sabot', 'geta', 'zori', 'jandal', 'plimsoll', '*wellington boot|wellies|welly',
  'galosh', 'ankle boot', 'chelsea boot', 'cowboy boot', 'hiking boot', 'walking boot', 'ski boot',
  'riding boot', 'thigh-high boot|thigh high boot', 'ugg boot', 'desert boot', 'combat boot', 
  'snow boot', 'mukluk', 'football boot|cleat', 'ballet shoe', 'tap shoe', 'pointe shoe', 'roller skate',
  '*ice skate', 'flipper', 'snowshoe', 'crampon', 'gaiter', 'spat', 'overshoe', 'jelly shoe', 'kitten heel',
  'huarache', 'creeper', 'winklepicker', 'veldskoen', 
];

const accessories = [
  '*hat', '*cap', '*scarf', '*glove', '*tie', '*belt', '*watch', '*sunglasses', '*necklace', '*ring',
  '*mitten', '*beanie', 'bobble hat', 'balaclava', '*baseball cap', '*beret', 'bowler hat', '*top hat', 'trilby',
  'fedora', 'panama hat', 'stetson', '*cowboy hat', 'sombrero', 'boater', 'deerstalker', 'flat cap',
  'fez', 'turban', '*bandana', 'headscarf', '*headband', 'hairband', 'hair clip', 'scrunchie', 'tiara',
  '*crown', 'veil', 'fascinator', 'bonnet', 'hood', '*helmet', 'hard hat', 'visor', 'sun hat', 'bucket hat',
  '*earmuffs', 'ushanka', 'tam o\'shanter|tam o shanter|tam', 'kippah|yarmulke', 'skullcap', 'mitre|miter',
  '*bow tie', 'cravat', 'ascot', 'bolo tie', 'neckerchief', 'snood', 'collar', 'cufflink', 'tie clip',
  'braces', 'cummerbund', 'sash', '*earring', '*bracelet', 'bangle', 'anklet', 'brooch', 'pendant',
  'locket', 'choker', 'chain', 'nose ring', '*glasses|spectacles', 'monocle', '*goggles', 'contact lens',
  '*mask', 'face mask', 'eye patch', '*handbag', 'clutch bag', 'satchel', 'bumbag|fanny pack', 'armband',
  'wristband', 'sweatband', 'lanyard', 'badge', 'corsage', 'boutonnière|boutonniere', 'buttonhole', 'lei',
  'feather boa|boa', 'muff', '*wig', 'toupee', 'hairnet', 'garland', 'medal', 
  'waders', 'chaps', 'kneepad', 'shin pad', 'gumshield|mouthguard', 'zucchetto', 'kufi',
  'obi', 'jabot', 'wimple', 'yashmak', 'keffiyeh|kaffiyeh', 'ihram', 'ruff', 'christmas jumper|xmas jumper',
];

const clothing = [...tops, ...bottomsAndUnderwear, ...footwear, ...accessories];

/* ---------------- Transport ---------------- */

const roadVehicles = [
  '*car', '*bus', '*bicycle|bike', '*motorbike|motorcycle', '*taxi|cab', '*lorry|truck', '*van', '*scooter',
  '*coach', 'minibus', 'trolleybus', 'double-decker bus|double decker', '*tram|streetcar', '*limousine|limo',
  '*jeep', 'suv', 'pickup truck', 'convertible', 'hatchback', 'estate car|station wagon', 'sports car',
  'hearse', '*ambulance', '*fire engine|fire truck', '*police car', 'camper van|campervan', 'motorhome|rv',
  'caravan', 'trailer', '*tractor', 'bulldozer', 'forklift', 'dumper truck|dump truck', 'tanker',
  'articulated lorry|semi', 'go-kart|go kart|kart', 'quad bike|atv', 'dune buggy|buggy', '*moped', 
  '*unicycle', '*tricycle', 'tandem', 'penny-farthing|penny farthing', 'e-bike|ebike', 'mountain bike',
  'bmx', 'recumbent bicycle', 'segway', 'hoverboard', '*skateboard', 'longboard', 'roller skates', 'rollerblades|inline skates',
  'kick scooter', 'pedicab', '*rickshaw', 'auto rickshaw', 'tuk-tuk|tuk tuk', 'jeepney', 'matatu',
  'tro-tro|trotro', 'songthaew', 'dolmuş|dolmus', 'minicab', '*tank', 'humvee',
  'snowmobile', 'snowcat', 'milk float', 'ice cream van', 'dustcart|garbage truck',
  'black cab', 'hackney carriage', 'hot rod', 'dragster', 'racing car', 'velomobile',
];

const railAirWater = [
  '*train', '*plane|aeroplane|airplane', '*boat', '*ship', '*helicopter', '*ferry', '*canoe', 
  '*underground|tube', '*subway|metro', 'monorail', 'maglev', 'bullet train', 'steam train', 'locomotive',
  'light rail', 'funicular', '*cable car', '*gondola', 'chairlift', 'ski lift', 'cog railway|rack railway',
  'handcar', '*jet', 'jumbo jet', 'airliner', 'seaplane', 'biplane', '*glider', 'hang glider', 'paraglider',
  'parachute', '*hot air balloon|balloon', 'airship', 'zeppelin', 'blimp', 'dirigible', 'microlight|ultralight',
  'gyrocopter|autogyro', 'jetpack', '*rocket', 'space shuttle', 'spacecraft|spaceship', 'drone', 'air taxi',
  '*yacht', '*sailboat|sailing boat', 'dinghy', 'catamaran', 'trimaran', '*kayak', 'rowing boat|rowboat',
  'punt', '*raft', '*barge', 'narrowboat', 'houseboat', 'tugboat|tug', '*speedboat', 'motorboat', 'jet ski',
  '*hovercraft', 'hydrofoil', '*cruise ship', 'ocean liner|liner', 'steamboat', 'paddle steamer', '*submarine',
  'pedalo|pedal boat', 'water taxi', 'vaporetto', 'junk', 'sampan', 'dhow', 'felucca', 'galleon', 'clipper',
  'schooner', 'sloop', 'ketch', 'yawl', 'longboat', 'trireme', 'coracle', 'outrigger', 'umiak', 'pirogue',
  'paddleboard', 'windsurfer', '*canal boat', '*lifeboat', 'trawler', 'xebec',
  'quinquereme', 'icebreaker', 'container ship',
];

const otherTransport = [
  '*horse', '*walking|on foot', 'pony', '*donkey', 'mule', '*camel', '*elephant', 'yak', 'llama',
  'ox cart', 'horse and cart|cart', '*carriage', 'stagecoach', 'wagon', 'chariot', 'hansom cab', 'trap',
  '*sleigh', '*sled|sledge', 'toboggan', 'bobsleigh|bobsled', 'dog sled', 'troika', 'palanquin|litter',
  'sedan chair', 'wheelchair', 'mobility scooter', 'skis', 'snowboard', 'ice skates', 'zip line|zipline',
  '*escalator', '*elevator|lift', 'travelator|moving walkway', 'hitchhiking', 'carpool', 'pogo stick',
  'stilts', 'velocipede', 'draisine', 'quadricycle', 'quadcopter', 'jinrikisha|jinricksha',
];

const transport = [...roadVehicles, ...railAirWater, ...otherTransport];

export const HOME_CATEGORIES: AlphabetCategory[] = [
  { id: 'foods', prompt: 'a food or dish', title: 'Food', answers: foods },
  { id: 'household', prompt: 'a household object', title: 'Around the house', answers: household },
  { id: 'clothing', prompt: 'something you wear', title: 'Things you wear', answers: clothing },
  { id: 'transport', prompt: 'a way to get around', title: 'Transport', answers: transport },
];
