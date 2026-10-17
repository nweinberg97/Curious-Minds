import type { AlphabetCategory } from '../types';

/*
 * Alphabet Sprint answer banks: animals, fruit & veg, and nature.
 * "*" marks a common answer; "|" separates spellings (canonical first).
 * Lists are grouped by theme, not alphabetised.
 */

/* ---------------- Animals ---------------- */

const mammalsCommon = [
  '*dog', '*cat', '*horse', '*cow', '*pig', '*sheep', '*goat', '*lion', '*tiger',
  '*elephant', '*giraffe', '*zebra', '*bear', '*wolf', '*fox', '*rabbit', '*mouse',
  '*monkey', '*kangaroo', '*deer', '*camel', '*hippopotamus|hippo', '*rhinoceros|rhino',
  '*squirrel', '*bat', '*gorilla', '*panda', '*koala', '*otter', '*beaver', '*hedgehog',
  '*donkey', '*leopard', '*cheetah', '*chimpanzee|chimp', '*raccoon|racoon', '*skunk',
  '*moose', '*buffalo', '*badger', '*hamster', '*rat', '*polar bear', '*mole', '*hare',
  'aardvark', 'aardwolf', 'alpaca', '*anteater', '*antelope', '*armadillo', '*baboon',
  '*bison', 'bobcat', 'bonobo', 'capybara', 'caribou', 'chinchilla', '*chipmunk',
  '*cougar', '*coyote', 'dingo', 'dormouse', 'echidna', '*elk', 'ermine', '*ferret',
  '*gazelle', '*gerbil', 'gibbon', 'gnu', 'gopher', '*guinea pig', '*hyena|hyaena',
];

const mammalsWild = [
  'ibex', 'impala', 'jackal', '*jaguar', 'jerboa', 'kinkajou', '*lemur', '*llama', '*lynx',
  'macaque', 'marmoset', 'marmot', '*meerkat', 'mink', '*mongoose', 'ocelot', 'okapi',
  'opossum', 'possum', '*orangutan|orang-utan', 'oryx', 'pangolin', '*platypus',
  'porcupine', '*puma', 'quokka', 'quoll', 'quagga', '*reindeer', '*sloth', 'stoat',
  'tapir', 'tarsier', 'vole', 'wallaby', '*warthog', '*weasel', 'wildebeest',
  'wolverine', '*wombat', '*yak', 'zebu', 'zorilla', 'serval', 'caracal', 'kudu',
  'dik-dik|dikdik', 'springbok', 'gemsbok', 'eland', 'nyala', 'bongo', 'duiker', 'xerus',
  'numbat', 'bandicoot', 'binturong', 'civet', 'genet', 'fossa', 'coati',
  'tamarin', 'howler monkey', 'mandrill', 'colobus', 'gelada', 'vicuña|vicuna',
  'guanaco', 'peccary', 'javelina', 'jaguarundi', 'margay', 'uakari', 'urial',
];

const mammalsMore = [
  'vervet', 'vampire bat', 'yapok', 'jackrabbit', 'shrew', 'polecat', 'pine marten',
  'mouflon', 'muntjac', 'chamois', 'tahr', 'markhor', 'saiga', 'takin', 'musk ox|muskox',
  'red panda', 'snow leopard', 'grizzly bear', 'sun bear', 'sloth bear', 'black bear',
  'brown bear', 'arctic fox', 'fennec fox', 'red fox', 'hartebeest', 'topi', 'sable antelope',
  'gerenuk', 'dromedary', 'bactrian camel', 'lemming', 'hyrax', 'tenrec', 'aye-aye|aye aye',
  'loris', 'galago|bushbaby', 'flying fox', 'sugar glider', 'tasmanian devil', 'wallaroo',
  'pademelon', 'bilby', 'cuscus', 'degu', 'agouti', 'paca', 'mara', 'viscacha',
  'coypu|nutria', 'muskrat', 'pika', 'prairie dog', 'groundhog|woodchuck', 'zebra duiker',
  'gaur', 'banteng', 'water buffalo', 'zorse', '*mule', '*pony', '*panther', 'ass', 'onager', 'kiang',
];

const seaMammalsAndFish = [
  '*whale', '*dolphin', '*seal', '*walrus', '*shark', '*octopus', '*jellyfish', '*crab',
  '*lobster', '*starfish', '*salmon', '*goldfish', '*tuna', '*cod', '*trout', '*squid',
  '*shrimp', '*seahorse', '*clownfish', '*eel', '*stingray',
  '*orca', '*narwhal', 'beluga', '*manatee', 'dugong', '*porpoise', '*sea lion', 'sea otter',
  'humpback whale', 'blue whale', 'sperm whale', 'minke whale', 'fin whale',
  'anchovy', 'angelfish', 'anglerfish', 'barracuda', 'bass', 'bream', '*carp', '*catfish',
  'chub', 'dace', 'flounder', 'grouper', 'gudgeon', '*guppy', '*haddock', 'hake', '*halibut',
  '*herring', 'john dory', '*koi', 'lamprey', 'ling', '*mackerel', 'marlin', 'minnow',
  'monkfish', 'mullet', 'perch', '*pike', '*piranha', 'plaice', 'pollock|pollack', 'pufferfish',
  'roach', 'sailfish', '*sardine', 'skate', 'snapper', 'sole', 'sprat', 'sturgeon',
];

const fishMore = [
  '*swordfish', 'tench', 'tilapia', 'turbot', 'whiting', 'wrasse', 'zander', 'yellowtail',
  'yellowfin tuna', 'unicornfish', 'viperfish', 'wahoo', 'walleye', 'goby', 'blenny',
  'hammerhead shark', 'great white shark', 'whale shark', 'tiger shark', 'nurse shark',
  'basking shark', 'mako shark', 'dogfish', 'manta ray', 'electric eel', 'moray eel',
  'barramundi', 'bluefish', 'char', 'grayling', 'kingfish', 'lungfish', 'mahi-mahi|mahi mahi',
  'parrotfish', 'pilchard', 'rudd', 'shad', 'smelt', 'stickleback', 'tarpon', 'tetra',
  'triggerfish', 'zebrafish', 'oarfish', 'sunfish', 'loach', 'bitterling', 'coelacanth',
  'gar', 'bleak', 'capelin', 'opah',
  'hagfish', 'flying fish', 'lionfish', 'swordtail', 'molly', 'platy', 'betta', 'discus',
  'oscar', 'sea bass', 'red mullet', 'redfish', 'zebra shark', 'quillback', 'queen angelfish',
];

const invertebratesSea = [
  'abalone', 'anemone|sea anemone', 'barnacle', '*clam', 'conch', 'coral', 'cowrie|cowry',
  '*crayfish|crawfish', 'cuttlefish', 'krill', 'limpet', '*mussel', 'nautilus', '*oyster',
  '*prawn', 'scallop', 'sea cucumber', 'sea urchin|urchin', 'sponge', 'whelk', 'winkle|periwinkle',
  '*cockle', 'hermit crab', 'king crab', 'spider crab', 'langoustine', 'nudibranch',
  'sea slug', 'sea squirt', 'brittle star', 'portuguese man o\' war|portuguese man-of-war',
  'horseshoe crab', 'mantis shrimp', 'razor clam', 'quahog', 'geoduck', 'yabby',
  'box jellyfish', 'sand dollar', 'lugworm', 'ragworm', 'feather star', 'velella',
];

const birdsCommon = [
  '*eagle', '*owl', '*parrot', '*penguin', '*duck', '*goose', '*swan', '*chicken|hen',
  '*robin', '*sparrow', '*pigeon', '*crow', '*flamingo', '*ostrich', '*peacock|peafowl',
  '*turkey', '*hawk', '*falcon', '*seagull|gull', '*pelican', '*woodpecker', '*hummingbird',
  '*kingfisher', '*blackbird', '*vulture', '*toucan', '*emu', '*kiwi', '*magpie', '*swallow',
  '*albatross', 'auk', 'avocet', 'bittern', 'bluebird', 'blue jay', 'bullfinch', 'bunting',
  'buzzard', '*canary', 'cardinal', 'cassowary', 'chaffinch', 'chiffchaff', 'cockatoo',
  'cockatiel', '*condor', 'coot', 'cormorant', '*crane', '*cuckoo', 'curlew', 'dodo', '*dove',
  'dunnock', 'egret', 'eider', '*finch', 'fulmar', 'gannet', 'godwit', 'goldfinch', 'goshawk',
  'grebe', 'greenfinch', 'grouse', 'guillemot', 'harrier', '*heron', 'hoopoe', 'hornbill',
];

const birdsMore = [
  'ibis', 'jackdaw', 'jay', 'kestrel', 'kite', 'kittiwake', 'kookaburra', 'lapwing', '*lark',
  'linnet', 'lovebird', '*parakeet', 'lyrebird', '*macaw', 'mallard', 'martin', 'merlin', 'mockingbird',
  'moorhen', '*nightingale', 'nightjar', 'nuthatch', 'oriole', 'osprey', 'oystercatcher',
  'partridge', '*pheasant', 'plover', 'ptarmigan', '*puffin', '*quail', 'quetzal', '*raven',
  'redstart', 'rhea', 'roadrunner', 'rook', 'sandpiper', 'shearwater', 'shoebill',
  'skylark', 'snipe', 'sparrowhawk', 'spoonbill', '*starling', '*stork', 'swift', 'tern',
  'thrush', 'tit', 'blue tit', 'great tit', 'treecreeper', 'turtle dove', 'vireo', 'wagtail',
  'warbler', 'waxwing', 'weaver', 'wheatear', 'whippoorwill', 'wigeon|widgeon', 'woodcock',
  '*wren', 'yellowhammer', 'zebra finch', '*budgerigar|budgie', 'kakapo', 'kea', 'takahe',
  'tui', 'weka', 'umbrellabird', 'jacana', 'jabiru', 'junco', 'kingbird', 'xenops',
];

const birdsExtra = [
  'secretary bird', 'bald eagle', 'golden eagle', 'harpy eagle', 'barn owl', 'snowy owl',
  'tawny owl', 'eagle owl', 'peregrine falcon', 'red kite', 'goldcrest', 'firecrest',
  'bee-eater|bee eater', 'roller', 'sunbird', 'honeyeater', 'bowerbird', 'frigatebird',
  'booby', 'loon', 'teal', 'shelduck', 'pintail', 'shoveler', 'merganser', 'goosander',
  'smew', 'scaup', 'pochard', 'gadwall', 'canada goose', 'mandarin duck', 'muscovy duck',
  'whooper swan', 'black swan', 'rail', 'corncrake', 'crake', 'bustard', 'tinamou',
  'trogon', 'motmot', 'manakin', 'cotinga', 'tanager', 'grosbeak', 'crossbill', 'siskin',
  'redpoll', 'twite', 'brambling', 'fieldfare', 'redwing', 'mistle thrush', 'song thrush',
  'stonechat', 'whinchat', 'pipit', 'dipper', 'chough', 'nutcracker', 'shrike', 'flycatcher',
  'yellowthroat', 'ouzel|ousel', 'vulturine guineafowl',
  'guineafowl|guinea fowl', 'night heron', 'zitting cisticola',
];

const reptilesAmphibians = [
  '*snake', '*crocodile', '*alligator', '*lizard', '*turtle', '*tortoise', '*frog', '*toad',
  '*chameleon', '*iguana', '*python', '*cobra', '*gecko', '*rattlesnake',
  'adder', '*anaconda', 'asp', 'axolotl', 'basilisk', 'boa', 'boa constrictor', 'bullfrog',
  'caiman|cayman', 'copperhead', 'cottonmouth', 'black mamba', 'mamba', 'gharial|gavial',
  'gila monster', 'grass snake', 'king cobra', 'kingsnake', 'komodo dragon', 'krait',
  'leatherback turtle', 'loggerhead turtle', 'monitor lizard', '*newt', '*salamander',
  'skink', 'slow worm|slowworm', 'taipan', 'terrapin', 'tuatara', '*viper', 'water moccasin',
  'bearded dragon', 'frilled lizard', 'horned lizard', 'thorny devil', 'sidewinder',
  'garter snake', 'corn snake', 'milk snake', 'mud puppy|mudpuppy', 'hellbender',
  'caecilian', 'tree frog', 'poison dart frog', 'cane toad', 'natterjack toad',
  'midwife toad', 'goliath frog', 'olm', 'siren', 'yellow-bellied sea snake',
  'tokay gecko', 'uromastyx', 'anole', 'agama', 'chuckwalla', 'boomslang', 'fer-de-lance',
  'bushmaster', 'puff adder', 'gaboon viper', 'xenopus', 'zonure',
];

const insectsAndBugs = [
  '*ant', '*bee', '*butterfly', '*spider', '*ladybird|ladybug', '*wasp', '*fly', '*mosquito',
  '*beetle', '*grasshopper', '*caterpillar', '*dragonfly', '*moth', '*snail', '*worm|earthworm',
  '*cricket', '*cockroach', '*scorpion', '*slug',
  '*aphid', '*bumblebee', 'honeybee', '*hornet', '*flea', 'louse', '*termite', 'tick', 'mite',
  'earwig', '*centipede', '*millipede', 'woodlouse', '*locust', 'cicada', 'mayfly', 'damselfly',
  '*firefly', 'glow-worm|glowworm', 'gnat', 'midge', 'horsefly', 'housefly', 'hoverfly',
  'stick insect', 'praying mantis|mantis', 'katydid', 'weevil', 'stag beetle', 'dung beetle',
  'scarab', 'silverfish', 'silkworm', '*tarantula', 'black widow', 'daddy longlegs',
  'harvestman', 'lacewing', 'leafhopper', 'water boatman', 'pond skater', 'bedbug|bed bug',
  'tsetse fly', 'bluebottle', 'cranefly|crane fly', '*leech',
];

const moreBugs = [
  'red admiral', 'monarch butterfly', 'swallowtail', 'peacock butterfly',
  'tortoiseshell', 'cabbage white', 'hawkmoth|hawk moth', 'luna moth', 'atlas moth',
  'yellowjacket', 'velvet ant', 'katipo', 'jewel beetle', 'junebug|june bug', 'zebra spider',
  'wolf spider', 'jumping spider', 'orb weaver', 'trapdoor spider', 'funnel-web spider',
  'tardigrade', 'firebrat', 'thrips', 'carpenter bee', 'underwing', 'vinegar fly',
];

const animals = [
  ...mammalsCommon, ...mammalsWild, ...mammalsMore, ...seaMammalsAndFish, ...fishMore,
  ...invertebratesSea, ...birdsCommon, ...birdsMore, ...birdsExtra, ...reptilesAmphibians,
  ...insectsAndBugs, ...moreBugs,
];


/* ---------------- Fruit & veg ---------------- */

const fruitCommon = [
  '*apple', '*banana', '*orange', '*pear', '*grape', '*strawberry', '*cherry', '*peach',
  '*plum', '*lemon', '*lime', '*mango', '*pineapple', '*watermelon', '*melon', '*kiwi fruit|kiwifruit|kiwi',
  '*raspberry', '*blueberry', '*apricot', '*coconut', '*grapefruit', '*papaya', '*avocado',
  '*blackberry', '*fig', '*date', '*pomegranate', '*nectarine', '*tangerine',
  'cantaloupe', 'honeydew', '*clementine', 'satsuma', 'mandarin', 'kumquat', 'pomelo|pummelo',
  'ugli fruit|ugli', 'yuzu', 'bergamot', 'citron', 'blood orange', 'key lime',
  '*cranberry', 'gooseberry', 'redcurrant|red currant', 'blackcurrant|black currant',
  'whitecurrant|white currant', 'elderberry', 'mulberry', 'loganberry', 'boysenberry',
  'tayberry', 'cloudberry', 'lingonberry', 'huckleberry', 'bilberry', 'whortleberry',
  'dewberry', 'goji berry|goji|wolfberry', 'açaí|acai|acai berry', 'juneberry|serviceberry',
  'jostaberry', 'youngberry', 'salmonberry', 'olallieberry', 'marionberry',
];

const fruitExotic = [
  'guava', '*lychee|litchi', 'longan', 'rambutan', 'mangosteen', 'durian', 'jackfruit',
  'breadfruit', 'starfruit|carambola', 'dragon fruit|pitaya|pitahaya', '*passion fruit|passionfruit',
  'persimmon', 'quince', 'medlar', 'loquat', 'feijoa', 'tamarind', 'jabuticaba', 'jujube',
  'soursop|guanabana', 'custard apple', 'cherimoya', 'sapodilla', 'salak|snake fruit',
  'langsat', 'duku', 'mamey', 'noni', 'physalis|cape gooseberry', 'tomatillo',
  'kiwano|horned melon', 'prickly pear', 'ackee|akee', 'plantain', '*olive', 'damson',
  'greengage', 'mirabelle', 'sloe', 'crab apple', 'rhubarb', 'pawpaw', 'cupuaçu|cupuacu',
  'bael', 'carob', 'marula', 'miracle fruit', 'naranjilla',
  'ugni', 'ximenia', 'yangmei|yumberry', 'calamansi|calamondin',
  'pluot', 'tangelo', 'minneola', 'honeyberry', 'chokeberry|aronia', 'currant', '*raisin',
  'sultana', 'prune', 'muskmelon', 'galia melon', 'casaba', 'crenshaw melon', 'santol',
  'wax apple', 'rose apple', 'velvet apple', 'white sapote', 'black sapote', 'ilama',
  'babaco', 'bignay', 'quandong', 'finger lime', 'davidson plum', 'illawarra plum',
];

const vegCommon = [
  '*carrot', '*potato', '*tomato', '*onion', '*cabbage', '*broccoli', '*cauliflower',
  '*lettuce', '*cucumber', '*pea', '*bean', '*corn|sweetcorn|maize', '*spinach', '*garlic',
  '*pepper|bell pepper', '*mushroom', '*celery', '*pumpkin', '*courgette|zucchini',
  '*aubergine|eggplant', '*sweet potato', '*leek', '*radish', '*beetroot|beet', '*asparagus',
  '*kale', '*sprout|brussels sprout', '*parsnip', '*turnip', '*squash',
  'artichoke', 'jerusalem artichoke', 'chard|swiss chard', 'collard|collard greens',
  'rocket|arugula', 'watercress', 'cress', 'endive', 'chicory', 'radicchio', 'escarole',
  'frisée|frisee', 'lamb\'s lettuce|corn salad|mache', 'iceberg lettuce', 'romaine|cos lettuce',
  'butternut squash', 'acorn squash', 'spaghetti squash', 'marrow', 'gourd', 'bitter gourd|bitter melon',
  'bottle gourd|calabash', 'chayote|choko', 'okra|ladies\' fingers', 'fennel', 'kohlrabi',
  'swede|rutabaga', 'celeriac', 'salsify', 'scorzonera', 'horseradish', 'wasabi',
  'daikon|mooli', 'jicama|yam bean', 'yam', 'taro', 'cassava|manioc|yuca', 'eddo|eddoe',
  'malanga', 'oca', 'ulluco', 'yacon', 'arrowhead', 'lotus root',
];

const vegMore = [
  'bok choy|pak choi', 'choy sum', 'gai lan|chinese broccoli', 'napa cabbage|chinese cabbage',
  'savoy cabbage', 'red cabbage', 'mustard greens', 'mizuna', 'tatsoi', 'komatsuna',
  'romanesco', 'broccolini|tenderstem', 'samphire', 'sorrel', 'purslane', 'dandelion greens',
  '*nettle', 'shallot', '*spring onion|scallion|green onion', 'chive', 'ramp|wild garlic|ramsons',
  'elephant garlic', '*chilli|chili|chile', 'jalapeño|jalapeno', 'habanero', 'cayenne pepper',
  'poblano', 'pimento|pimiento', 'scotch bonnet',
  'green bean|french bean', 'runner bean', 'broad bean|fava bean', 'kidney bean',
  'black bean', 'pinto bean', 'butter bean|lima bean', 'haricot bean|navy bean',
  'mung bean', 'soybean|soya bean|edamame', 'adzuki bean|azuki bean', 'black-eyed pea',
  '*chickpea|garbanzo', '*lentil', 'split pea', 'mangetout|snow pea', 'sugar snap pea',
  'yardlong bean', 'winged bean', 'velvet bean', 'urad bean|urad',
  'bean sprout', 'alfalfa sprout', 'water chestnut', 'bamboo shoot', 'heart of palm',
];

const vegExtra = [
  'cardoon', 'celtuce', 'fiddlehead', 'sea kale', 'cherry tomato',
  'plum tomato', 'beefsteak tomato', 'new potato', 'cavolo nero',
  'button mushroom', 'portobello mushroom', 'shiitake', 'oyster mushroom', 'chanterelle',
  'porcini|cep', 'morel', 'enoki', 'truffle', 'puffball',
  '*ginger', 'turmeric', 'galangal', 'lemongrass',
  'vine leaf', 'nopal|nopales', 'xoconostle',
  'zucchetta', 'ugu', 'jute mallow|molokhia', 'kangkong|water spinach',
  'amaranth', 'drumstick|moringa',
];

const fruitveg = [...fruitCommon, ...fruitExotic, ...vegCommon, ...vegMore, ...vegExtra];

/* ---------------- Nature ---------------- */

const landforms = [
  '*mountain', '*river', '*lake', '*ocean', '*sea', '*beach', '*forest', '*desert', '*volcano',
  '*island', '*hill', '*valley', '*waterfall', '*cave', '*glacier', '*canyon', '*cliff',
  '*jungle', '*swamp', '*pond', '*stream', '*meadow', '*field',
  'archipelago', 'atoll', 'bay', 'bayou', 'bluff', 'bog', 'butte', 'caldera', 'cape',
  'cavern', 'cove', 'crater', 'creek', 'delta', 'dune|sand dune', 'escarpment', 'estuary',
  'fen', 'fjord|fiord', 'geyser', 'glade', 'gorge', 'grassland', 'gulch', 'gully', 'heath',
  '*iceberg', 'inlet', 'isthmus', 'karst', 'knoll', 'lagoon', 'marsh', 'mesa', 'moor',
  'oasis', '*peak', 'peninsula', 'plain', 'plateau', '*prairie', '*rainforest', 'rapids',
  'ravine', '*reef|coral reef', 'ridge', 'savanna|savannah', '*spring', 'steppe', 'strait',
];

const landformsMore = [
  'summit', 'taiga', 'tundra', 'wetland', 'woodland', 'arroyo', 'badlands', 'basin',
  'beck', 'brook', 'burn', 'col', 'coombe|combe', 'corrie|cirque|cwm', 'crag', 'dell', 'dale',
  'drumlin', 'esker', 'firth', 'floodplain', 'foothill', 'gap', 'glen', 'gulf', 'headland',
  'hot spring', 'ice cap', 'ice sheet', 'islet', 'kame', 'kettle lake', 'loch', 'lough',
  'mangrove', 'moraine', 'mountain range', 'mudflat', 'oxbow lake', 'pass', 'pinnacle',
  'quagmire', 'quicksand', 'rift valley', 'salt flat', 'sandbank', 'scree', 'shoal', 'shore',
  'sinkhole', 'spit', 'stalactite', 'stalagmite', 'tarn', 'tor', 'tributary', 'veld|veldt',
  'wadi', 'whirlpool', 'yardang', 'zawn', 'outcrop', '*boulder', 'pebble', '*rock', '*sand',
  '*mud', 'soil', 'pampas', 'hollow', 'vale', 'wold', 'upland', 'fumarole', 'lava', 'magma',
];

const trees = [
  '*oak', '*pine', '*maple', '*palm|palm tree', '*willow', '*birch', '*elm',
  '*ash', '*beech', '*fir', '*cedar', '*redwood', '*spruce', '*chestnut', '*holly',
  'acacia', 'alder', 'aspen', 'baobab', 'balsa', 'banyan', '*bamboo', 'cypress', 'dogwood',
  'ebony', 'eucalyptus', 'gum tree', 'hawthorn', 'hazel', 'hemlock', 'hickory', 'hornbeam',
  'ironwood', 'jacaranda', 'joshua tree', 'juniper', 'kapok', 'kauri', 'larch', 'laurel',
  'linden|lime tree', 'magnolia', 'mahogany', 'monkey puzzle',
  'olive tree', 'poplar', 'rowan|mountain ash', 'sequoia', 'sycamore', 'tamarisk', 'teak',
  'walnut', 'whitebeam', 'yew', 'yellowwood', 'zelkova', 'catalpa', 'ginkgo|gingko',
  'jarrah', 'karri', 'kowhai', 'mimosa', 'myrtle', 'neem', 'plane tree', 'quaking aspen',
  'rubber tree', 'sandalwood', 'sassafras', 'tulip tree', 'upas', 'wattle', 'wych elm',
];

const flowersPlants = [
  '*rose', '*tulip', '*daisy', '*sunflower', '*lily', '*daffodil', '*orchid', '*poppy',
  '*grass', '*moss', '*fern', '*cactus', '*ivy', '*lavender', '*dandelion', '*bluebell',
  '*violet', '*buttercup', '*clover', '*seaweed', '*mushroom|toadstool', '*leaf', '*flower',
  'anemone', 'aster', 'azalea', 'begonia', 'bindweed', 'bracken', 'bramble', 'broom',
  'buddleia|buddleja', 'camellia', 'carnation', 'chrysanthemum', 'clematis', 'columbine',
  'cornflower', 'cowslip', 'crocus', 'cyclamen', 'dahlia', 'delphinium', 'edelweiss',
  '*forget-me-not', 'foxglove', 'freesia', 'fuchsia', 'gardenia', 'geranium', 'gerbera',
  'gladiolus', 'gorse', 'heather', 'hibiscus', 'hollyhock', 'honeysuckle', 'hyacinth',
  'hydrangea', 'iris', '*jasmine', 'jonquil', 'kingcup', 'lilac', 'lotus', 'lupin|lupine',
  'marigold', 'mistletoe', 'narcissus', 'nasturtium', 'oleander', 'oxeye daisy', 'pansy',
];

const plantsMore = [
  'peony', 'periwinkle', 'petunia', 'primrose', 'protea', 'ragwort', 'rhododendron',
  'snapdragon', 'snowdrop', 'sweet pea', '*thistle', 'trillium', 'verbena', '*water lily',
  'wisteria', 'yarrow', 'zinnia', 'xeranthemum', 'yucca', 'agave', '*aloe', 'bulrush',
  'cattail', 'reed', 'rush', 'sedge', 'lichen', 'liverwort', 'algae', 'kelp', 'vine', 'creeper',
  '*nettle', 'venus flytrap', 'pitcher plant', 'sundew', 'bladderwort', 'saxifrage',
  'stonecrop', 'succulent', 'heliotrope', 'hellebore', 'impatiens|busy lizzie', 'jacob\'s ladder',
  'kniphofia|red hot poker', 'lobelia', 'mallow', 'meadowsweet',
];

const wildflowers = [
  'nigella|love-in-a-mist', 'oxalis', 'phlox', 'plumeria|frangipani',
  'quamash|camas', 'queen anne\'s lace', 'rafflesia', 'scabious', 'tansy', 'teasel',
  'valerian', 'vetch', 'wood anemone', 'wolfsbane|aconite',
  'yellow flag', 'zantedeschia|calla lily', 'arum', 'bougainvillea', 'cosmos', 'dog rose',
  'eyebright', 'feverfew', 'goldenrod', 'harebell', 'kudzu', 'lady\'s slipper', 'moonflower',
  'nightshade', 'oxlip', 'pimpernel', 'rockrose', 'sea holly', 'tiger lily',
  'thyme', 'ursinia', 'water hyacinth', 'xerophyte', 'zephyranthes|rain lily',
];

const weatherAndSky = [
  '*rain', '*snow', '*wind', '*cloud', '*sun', '*rainbow', '*storm', '*thunder', '*lightning',
  '*tornado', '*hurricane', '*fog', '*hail', '*ice', '*frost', '*earthquake', '*tide', '*wave',
  '*moon', '*star',
  'aurora|northern lights', '*avalanche', '*blizzard', 'breeze', 'cyclone', 'dew', 'downpour',
  'drizzle', 'drought', 'dust storm', 'eclipse', '*flood', 'gale', 'gust', 'haze', 'heatwave',
  'icicle', 'landslide|mudslide', 'mist', 'monsoon', 'rockfall', 'sandstorm', 'sleet',
  'smog', 'snowflake', 'squall', '*sunrise', '*sunset', '*tsunami', 'typhoon', 'thunderstorm',
  'waterspout', 'whirlwind', 'dust devil', 'hoarfrost', 'rime', 'graupel', 'jet stream',
];

const skyAndSeasons = [
  'cumulus', 'cirrus', 'stratus', 'nimbus', 'cumulonimbus', 'zephyr', 'zodiacal light',
  'mirage', 'meteor', 'comet', 'shooting star', 'moonbow', 'halo', 'sundog', 'virga',
  'chinook', 'mistral', 'sirocco', 'harmattan', 'katabatic wind', 'el niño|el nino',
  'la niña|la nina', 'updraft', 'microburst', 'black ice', 'snowdrift', 'permafrost',
  'equinox', 'solstice', 'twilight', 'dawn', 'dusk', 'undertow',
  'riptide|rip current', 'swell', 'ice storm', 'firestorm', '*wildfire|bushfire', 'whiteout',
];

const nature = [
  ...landforms, ...landformsMore, ...trees, ...flowersPlants, ...plantsMore, ...wildflowers, ...weatherAndSky, ...skyAndSeasons,
];

// Everyday words people say first: animal groups and young animals.
const everydayAnimals = [
  '*bird', '*fish', '*bug', '*insect', 'mammal', 'reptile', 'amphibian', 'bull', '*bunny', 'boar', 'rooster', 'ape',
  '*puppy', '*kitten', 'calf', 'lamb', 'ox', 'piglet', 'foal', 'chick', 'duckling', 'tadpole', 'cub', 'dinosaur',
  'stallion', 'mare', 'pup', 'kitty', 'hound', 'gosling', 'cygnet', 'fawn', 'joey', 'larva',
];
const animalsAll = [...animals, ...everydayAnimals.filter((w) => !animals.some((a) => a.replace(/^\*/, '').split('|').includes(w.replace(/^\*/, ''))))];

export const NATURE_CATEGORIES: AlphabetCategory[] = [
  { id: 'animals', prompt: 'an animal', title: 'Animals', answers: animalsAll },
  { id: 'fruitveg', prompt: 'a fruit or vegetable', title: 'Fruit & veg', answers: fruitveg },
  { id: 'nature', prompt: 'something in nature', title: 'Nature', answers: nature },
];
