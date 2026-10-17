/**
 * Alphabet Sprint answer banks: culture and people.
 *
 * Each list is assembled from small themed groups so it stays easy to review.
 * "*" marks a common answer; "|" separates spellings of one answer (canonical first).
 */
import type { AlphabetCategory } from '../types';

/* ---------------- Cities ---------------- */

const westernEuropeCities = [
  '*london', '*paris', '*rome', '*berlin', '*madrid', '*amsterdam', '*vienna', '*athens',
  '*lisbon', '*dublin', '*brussels', '*barcelona', '*milan', '*venice', '*florence', '*naples',
  '*munich', '*hamburg', '*frankfurt', 'cologne|koln', 'stuttgart', 'düsseldorf|dusseldorf',
  'dresden', 'leipzig', 'hanover|hannover', 'bremen', 'nuremberg', 'bonn', 'heidelberg',
  '*edinburgh', '*glasgow', '*manchester', '*liverpool', 'birmingham', 'leeds', 'bristol',
  'oxford', 'cambridge', 'york', 'belfast', 'cardiff', 'sheffield', 'newcastle', 'nottingham',
  'southampton', 'brighton', 'aberdeen', 'bath', 'inverness', 'cork', 'galway', 'limerick',
  'lyon|lyons', 'marseille|marseilles', '*nice', 'bordeaux', 'toulouse', 'lille', 'strasbourg',
  'nantes', 'montpellier', 'cannes', 'avignon', '*geneva', '*zurich', 'bern|berne', 'basel',
  'lausanne', 'lucerne', '*salzburg', 'innsbruck', 'graz', 'linz',
];

const southernEuropeCities = [
  '*seville', '*valencia', 'málaga|malaga', 'bilbao', 'granada', 'zaragoza', 'palma',
  'córdoba|cordoba', 'san sebastian', 'toledo', 'salamanca', 'pamplona', 'alicante',
  '*porto|oporto', 'faro', 'coimbra', 'funchal', '*turin', 'genoa', 'bologna', 'verona',
  'palermo', 'pisa', 'bari', 'siena', 'catania', 'trieste', 'padua', 'thessaloniki',
  'heraklion', 'valletta', 'nicosia', 'andorra la vella', 'san marino', 'vaduz', 'monaco',
  '*istanbul', 'ankara', 'izmir', 'antalya', 'bursa', 'tbilisi', 'yerevan', 'baku',
];

const northernEasternEuropeCities = [
  '*rotterdam', 'the hague|hague', 'utrecht', 'eindhoven', '*antwerp', 'ghent', 'bruges',
  'liège|liege', 'luxembourg', '*prague', '*budapest', '*warsaw', 'kraków|krakow|cracow',
  'gdańsk|gdansk', 'wrocław|wroclaw', 'poznań|poznan', 'łódź|lodz', 'brno', 'bratislava',
  'ljubljana', 'zagreb', 'split', 'dubrovnik', 'belgrade', 'novi sad', 'sarajevo', 'mostar',
  'podgorica', 'skopje', 'tirana', 'sofia', 'plovdiv', 'bucharest', 'cluj-napoca|cluj',
  'chișinău|chisinau', '*kyiv|kiev', 'kharkiv|kharkov', 'odesa|odessa', 'lviv', 'minsk',
  'vilnius', 'riga', 'tallinn', '*moscow', '*saint petersburg|st petersburg', 'novosibirsk',
  'yekaterinburg', 'kazan', 'vladivostok', 'volgograd', 'sochi', 'murmansk', 'irkutsk',
  'omsk', '*stockholm', '*oslo', '*copenhagen', '*helsinki', 'reykjavík|reykjavik', 'bergen',
  'trondheim', 'tromso', 'gothenburg', 'malmö|malmo', 'uppsala', 'aarhus', 'odense', 'turku',
  'tampere',
];

const eastAsiaCities = [
  '*tokyo', '*beijing', '*shanghai', '*hong kong', '*seoul', '*osaka', '*kyoto', '*yokohama',
  'nagoya', 'sapporo', '*kobe', 'fukuoka', 'hiroshima', 'nagasaki', 'sendai', 'nara', 'naha',
  '*busan|pusan', 'incheon', 'daegu', 'pyongyang', '*taipei', 'kaohsiung', 'taichung', 'macau|macao',
  '*guangzhou|canton', '*shenzhen', 'chengdu', 'chongqing', 'wuhan', 'xian|xi an', 'nanjing',
  'hangzhou', 'tianjin', 'harbin', 'qingdao', 'suzhou', 'kunming', 'dalian', 'shenyang',
  'xiamen', 'lhasa', 'urumqi', 'changsha', 'zhengzhou', 'jinan', 'guilin', 'ulaanbaatar|ulan bator',
];

const southSoutheastAsiaCities = [
  '*bangkok', '*singapore', '*jakarta', '*manila', '*kuala lumpur', '*hanoi', '*ho chi minh city|saigon',
  'da nang', 'hue', 'phnom penh', 'siem reap', 'vientiane', 'luang prabang', 'yangon|rangoon',
  'mandalay', 'naypyidaw', 'chiang mai', 'phuket', 'pattaya', 'denpasar','surabaya',
  'bandung', 'medan', 'yogyakarta', 'makassar', 'cebu', 'davao', 'quezon city', 'penang|george town',
  'malacca|melaka', 'kota kinabalu', 'kuching', 'bandar seri begawan', 'dili',
  '*delhi', '*mumbai|bombay', '*new delhi', 'kolkata|calcutta', 'chennai|madras', 'bangalore|bengaluru',
  'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'agra', 'varanasi', 'lucknow', 'kanpur', 'panaji',
  'kochi|cochin', 'amritsar', 'udaipur', 'jodhpur', 'mysore|mysuru', 'nagpur', 'surat', 'indore',
  'bhopal', 'patna', 'chandigarh', 'shimla', 'darjeeling', '*karachi', '*lahore', 'islamabad',
  'peshawar', 'rawalpindi', 'quetta', 'multan', 'faisalabad', '*dhaka|dacca', 'chittagong',
  '*kathmandu', 'pokhara', 'thimphu', '*colombo', 'kandy', 'malé|male',
];

const westCentralAsiaCities = [
  '*dubai', 'abu dhabi', 'sharjah', '*doha', '*riyadh', 'jeddah', '*mecca|makkah', 'medina',
  'muscat', 'manama', 'kuwait city', '*baghdad', 'basra', 'mosul', 'erbil', '*tehran', 'isfahan',
  'shiraz', 'tabriz', 'mashhad', '*jerusalem', '*tel aviv', 'haifa', 'nazareth', 'bethlehem',
  'ramallah', 'gaza', 'amman', 'aqaba', '*beirut', '*damascus', 'aleppo', 'homs',
  'sanaa', 'aden', '*kabul', 'kandahar', 'herat', 'tashkent', 'samarkand', 'bukhara', 'almaty',
  'astana', 'bishkek', 'dushanbe', 'ashgabat',
];

const africaCities = [
  '*cairo', 'alexandria', 'giza', 'luxor', 'aswan', 'port said', 'tripoli', 'benghazi', '*tunis',
  '*algiers', 'oran', '*casablanca', 'rabat', '*marrakesh|marrakech', 'fez|fes', 'tangier',
  'khartoum', 'omdurman', 'juba', '*addis ababa', 'asmara', 'djibouti', 'mogadishu', 'hargeisa',
  '*nairobi', 'mombasa', 'kampala', 'kigali', 'bujumbura', 'dodoma', 'dar es salaam', 'zanzibar',
  'arusha', '*lagos', 'abuja', 'kano', 'ibadan', '*accra', 'kumasi', '*dakar', 'abidjan',
  'yamoussoukro', 'bamako', 'timbuktu', 'niamey', 'ouagadougou', 'conakry', 'freetown', 'monrovia',
  'banjul', 'bissau', 'nouakchott', 'lomé|lome', 'porto-novo|porto novo', 'cotonou', 'praia',
  'douala', 'yaoundé|yaounde', 'libreville', 'malabo', "n'djamena|ndjamena", 'bangui',
  '*kinshasa', 'brazzaville', 'lubumbashi', 'luanda', 'lusaka', '*harare', 'bulawayo', 'lilongwe',
  'blantyre', 'maputo', 'gaborone', 'windhoek', '*johannesburg', '*cape town', '*durban',
  '*pretoria', 'port elizabeth|gqeberha', 'bloemfontein', 'soweto', 'maseru', 'mbabane',
  'antananarivo', 'port louis', 'victoria', 'moroni', 'são tomé|sao tome',
];

const northAmericaCities = [
  '*new york', '*los angeles', '*chicago', '*houston', '*miami', '*boston', '*san francisco',
  '*washington', '*seattle', '*las vegas', '*philadelphia', '*phoenix', 'san antonio', 'san diego',
  '*dallas', '*austin', 'jacksonville', 'san jose', 'fort worth', 'columbus', 'charlotte',
  'indianapolis', '*denver', '*nashville', '*detroit', 'portland', 'memphis', 'louisville',
  'baltimore', 'milwaukee', 'albuquerque', 'tucson', 'fresno', 'sacramento', 'kansas city',
  '*atlanta', 'omaha', 'raleigh', 'minneapolis', 'saint paul|st paul', 'tulsa', 'cleveland',
  '*new orleans', 'tampa', '*orlando', 'pittsburgh', 'cincinnati', 'st louis|saint louis',
  '*salt lake city', '*honolulu', 'anchorage', 'juneau', 'buffalo', 'richmond', 'boise',
  'oklahoma city', 'el paso', 'des moines', 'hartford', 'providence', 'savannah', 'charleston',
  'albany', 'annapolis', 'olympia', 'berkeley', 'oakland', 'yonkers', 'quincy', 'xenia',
  'ithaca', 'utica', 'urbana', 'knoxville', 'yuma', 'zanesville',
  '*toronto', '*montreal', '*vancouver', '*ottawa', '*calgary', 'edmonton', 'winnipeg', '*quebec city|quebec',
  'halifax', 'regina', 'saskatoon', 'hamilton', 'yellowknife', 'whitehorse', 'iqaluit',
  "st john's", 'charlottetown', 'fredericton', 'kingston', 'nuuk',
];

const latinAmericaCities = [
  '*mexico city', 'guadalajara', 'monterrey', 'cancún|cancun', 'tijuana', 'puebla', 'acapulco',
  'oaxaca', 'mérida|merida', 'veracruz', 'juárez|juarez', 'león|leon', 'querétaro|queretaro',
  'guatemala city', 'antigua', 'san salvador', 'tegucigalpa', 'managua', 
  'panama city', '*havana', 'santiago de cuba', 'montego bay',
  'santo domingo', 'port-au-prince|port au prince', 'san juan', 'nassau', 'bridgetown',
  'port of spain', 'castries', "st george's", 'willemstad', 'belmopan', 'belize city',
  '*rio de janeiro|rio', '*são paulo|sao paulo', '*buenos aires', 'brasília|brasilia', 'salvador',
  'fortaleza', 'belo horizonte', 'manaus', 'recife', 'porto alegre', 'curitiba', 'belém|belem',
  'florianópolis|florianopolis', 'natal', '*santiago', 'valparaíso|valparaiso', '*lima', 'cusco|cuzco',
  'arequipa', 'bogotá|bogota', 'medellín|medellin', 'cali', 'cartagena', 'barranquilla', '*caracas',
  'maracaibo', '*quito', 'guayaquil', 'la paz', 'sucre', 'santa cruz', 'asunción|asuncion',
  '*montevideo', 'punta del este', 'rosario', 'mendoza',
  'ushuaia', 'georgetown', 'paramaribo', 'cayenne',
];

const oceaniaCities = [
  '*sydney', '*melbourne', '*brisbane', '*perth', '*adelaide', '*canberra', 'hobart', 'darwin',
  'gold coast', 'cairns', 'wollongong', 'geelong', 'townsville',
  'alice springs', 'launceston', 'ballarat', 'bendigo', 'toowoomba', '*auckland', '*wellington',
  '*christchurch', 'queenstown', 'dunedin', 'rotorua', 'napier', 'nelson', 'invercargill',
  'suva', 'nadi', 'port moresby', 'apia', "nuku'alofa|nukualofa", 'port vila', 'honiara',
  'nouméa|noumea', 'papeete', 'tarawa', 'majuro', 'palikir', 'funafuti', 'yaren', 'hagatna|agana',
];

/* ---------------- Jobs ---------------- */

const healthJobs = [
  '*doctor', '*nurse', '*dentist', '*surgeon', '*vet|veterinarian', '*pharmacist', '*paramedic',
  '*midwife', 'physiotherapist|physical therapist', 'optician', 'optometrist', 'radiographer',
  'radiologist', 'anaesthetist|anesthetist|anesthesiologist', 'psychiatrist', '*psychologist',
  'therapist', 'counsellor|counselor', 'chiropractor', 'osteopath', 'podiatrist|chiropodist',
  'dietitian|dietician', 'nutritionist', 'pediatrician|paediatrician', 'cardiologist',
  'dermatologist', 'neurologist', 'oncologist', 'gynaecologist|gynecologist', 'obstetrician',
  'orthodontist', 'hygienist', 'pathologist', 'audiologist', 'phlebotomist', 'sonographer',
  'carer|caregiver', 'orderly', 'porter', 'coroner', 'medic', 'herbalist', 'acupuncturist',
  'masseuse|masseur', 'massage therapist', 'occupational therapist', 'speech therapist',
  'epidemiologist', 'virologist', 'urologist', 'ophthalmologist', 'gp', 'locum',
];

const tradeJobs = [
  '*plumber', '*electrician', '*carpenter', '*builder', '*mechanic', '*painter', '*baker',
  '*butcher', '*farmer', '*gardener', 'joiner', 'bricklayer', 'plasterer', 'roofer', 'tiler',
  'glazier', 'welder', 'blacksmith', 'locksmith', 'goldsmith', 'silversmith', 'jeweller|jeweler',
  'watchmaker', 'clockmaker', 'cobbler', 'shoemaker', '*tailor', 'seamstress', 'dressmaker',
  'upholsterer', 'stonemason|mason', 'thatcher', 'cooper', 'wheelwright', 'saddler', 'tanner',
  'weaver', '*potter', 'glassblower', 'carpet fitter', 'decorator', 'handyman', 'scaffolder',
  'surveyor', 'machinist', 'fitter', 'turner', 'toolmaker', 'engraver', 'printer', 'bookbinder',
  '*florist', 'fishmonger', 'greengrocer', 'grocer', 'brewer', 'distiller', 'vintner', 'winemaker',
  'cheesemaker', 'chandler', 'farrier', '*shepherd', 'rancher', 'cowboy', '*fisherman|fisher',
  'lumberjack', 'logger', 'forester', '*miner', 'quarryman', '*beekeeper|apiarist', 'groom',
  'stable hand', 'dairyman', 'crofter', 'gamekeeper',
];

const officeJobs = [
  '*accountant', '*lawyer', '*banker', '*secretary', '*manager', '*engineer', '*architect',
  '*programmer', 'solicitor', 'barrister', 'attorney', 'paralegal', 'notary', '*judge',
  'magistrate', '*clerk', '*receptionist', 'administrator', 'auditor', 'actuary', 'economist',
  'analyst', '*consultant', 'stockbroker', 'broker', 'trader', 'underwriter', '*cashier',
  'teller', 'bookkeeper', 'treasurer', 'executive', 'director', 'chairman|chairperson|chair',
  'entrepreneur', 'recruiter', 'headhunter', '*developer', 'coder', '*software engineer',
  'web designer', 'data scientist', 'statistician', 'technician', 'typist', 'stenographer',
  'translator', 'interpreter', 'lobbyist', 'diplomat', 'ambassador', 'politician', 'senator',
  'mayor', 'councillor|councilor', 'civil servant', 'bureaucrat', 'registrar', 'archivist',
  '*librarian', 'curator', '*estate agent|realtor|real estate agent', 'landlord', 'valuer|appraiser',
  'assessor', 'insurer', 'loss adjuster', 'quantity surveyor', 'planner', 'project manager',
  'marketer', 'publicist', 'copywriter', 'proofreader', '*editor', 'publisher', 'salesman|salesperson',
];

const serviceJobs = [
  '*teacher', '*police officer|policeman|policewoman', '*firefighter|fireman', '*chef', '*cook',
  '*waiter|waitress', '*pilot', '*soldier', '*driver', '*postman|postwoman|mail carrier|postal worker|mailman|mailwoman',
  '*cleaner', '*hairdresser', '*barber', 'barista', 'bartender|barman|barmaid', 'sommelier',
  '*butler', 'maid', 'housekeeper', '*nanny', 'au pair', 'babysitter', 'childminder', 'governess',
  '*tutor', '*lecturer', '*professor', 'headteacher|headmaster|headmistress|principal', 'dean',
  'teaching assistant', '*coach', 'instructor', 'trainer', 'personal trainer', '*lifeguard',
  '*security guard', 'bouncer', 'bodyguard', '*detective', 'sheriff', 'constable', 'inspector',
  'warden', 'prison officer|jailer|jailor', 'probation officer', 'customs officer', 'spy',
  '*sailor', 'marine', 'airman', 'admiral', 'general', '*captain', 'navigator', '*flight attendant|stewardess|steward',
  'air traffic controller', '*conductor', 'train driver', 'engine driver', '*bus driver',
  '*taxi driver|cabbie|cab driver', 'chauffeur', '*courier', 'trucker|lorry driver|truck driver',
  'delivery driver', 'dispatcher', 'ferryman', 'boatman', 'gondolier', 'docker|stevedore|longshoreman',
  'removal man|mover', 'refuse collector|garbage collector|binman', '*janitor|caretaker',
  'concierge', 'doorman', 'bellhop', 'valet', 'hotelier', 'innkeeper', 'publican', 'shopkeeper',
  'retailer', 'vendor', 'hawker', 'pedlar|peddler', 'auctioneer', 'pawnbroker', 'undertaker|mortician',
  'funeral director', 'embalmer', 'gravedigger', 'chimney sweep', 'window cleaner', 'zookeeper',
  'dog walker', 'groomer', 'kennel worker', 'beautician', 'manicurist', 'stylist', 'makeup artist',
  'tattooist|tattoo artist', '*social worker', 'youth worker', 'volunteer', 'nun', 'monk',
  '*priest', 'vicar', 'rabbi', 'imam', 'minister', 'pastor', 'chaplain', 'missionary', 'bishop',
];

const creativeScienceJobs = [
  '*actor|actress', '*singer', '*artist', '*writer', '*author', '*journalist', '*photographer',
  '*astronaut', '*scientist', '*musician', '*dancer', 'ballerina', 'choreographer', '*comedian',
  '*magician', 'juggler', '*clown', 'acrobat', 'stuntman|stunt performer', '*model', 'presenter',
  'newsreader|newscaster|anchor', '*reporter', 'columnist', 'critic', 'blogger', 'vlogger',
  'youtuber', 'influencer', '*poet', '*novelist', 'playwright|dramatist', 'screenwriter',
  'lyricist', '*composer', 'songwriter', 'pianist', 'guitarist', 'drummer', 'violinist',
  'organist', 'dj|disc jockey', 'producer', 'film director', 'cameraman|camera operator',
  'cinematographer', 'animator', 'illustrator', 'cartoonist', 'sculptor', '*designer',
  'fashion designer', 'graphic designer', 'interior designer', 'game designer', 'quality inspector', 'quartermaster',
  '*chemist', '*physicist', '*biologist', 'botanist', 'zoologist', 'geologist', '*astronomer',
  '*archaeologist', 'anthropologist', 'historian', 'linguist', 'mathematician', 'meteorologist',
  'oceanographer', 'ecologist', 'geneticist', '*inventor', 'researcher',
  'philosopher', 'sociologist', 'cartographer', 'pharmacologist', 'veterinary nurse',
  'umpire', '*referee', '*jockey', '*athlete', 'footballer', 'cricketer', 'boxer', 'wrestler',
  'golfer', 'swimmer', 'caddie|caddy', 'explorer', 'xylophonist',
  'yoga teacher|yoga instructor',
];

/* ---------------- Instruments ---------------- */

const stringInstruments = [
  '*guitar', '*violin', '*cello|violoncello', '*harp', '*banjo', '*ukulele|ukelele', '*bass',
  '*viola', '*double bass|contrabass', '*bass guitar', '*electric guitar', 'acoustic guitar',
  '*mandolin', '*lute', '*lyre', '*sitar', 'sarod', 'veena|vina', 'tanpura|tambura', 'santoor|santur',
  'zither', 'dulcimer', 'hammered dulcimer', 'balalaika', 'bouzouki', 'oud', 'koto', 'shamisen',
  'erhu', 'pipa', 'guzheng', 'guqin', 'kora', 'charango', 'cuatro', 'cavaquinho', 'viol',
  'viola da gamba', 'rebec', 'hurdy-gurdy|hurdy gurdy', 'psaltery', 'kantele', '*fiddle',
  'autoharp', 'pedal steel guitar', 'lap steel guitar', 'twelve-string guitar', 'theorbo',
  'cittern', 'bandura', 'gusli', 'kanun|qanun', 'rebab', 'saz|baglama', 'tar', 'dombra',
  'sarangi', 'morin khuur', 'gayageum|kayagum', 'biwa', 'yueqin', 'berimbau', 'ektara',
  'dobro', 'resonator guitar', 'nyckelharpa', 'vihuela', 'guitarron', 'tres', 'washtub bass',
];

const windInstruments = [
  '*flute', '*trumpet', '*clarinet', '*saxophone|sax', '*trombone', '*recorder', '*bagpipes|bagpipe',
  '*harmonica|mouth organ', '*tuba', '*oboe', '*bassoon', 'contrabassoon', 'cor anglais|english horn',
  '*piccolo', '*french horn|horn', '*cornet', 'flugelhorn', '*bugle', 'euphonium', 'sousaphone',
  'baritone horn', 'tenor horn', 'alto saxophone', 'tenor saxophone', 'bass clarinet', 'fife',
  '*panpipes|pan flute|pan pipes', '*ocarina', '*kazoo', '*didgeridoo|didjeridu', 'shakuhachi',
  'bansuri', 'shehnai', 'duduk', 'zurna', 'ney', 'tin whistle|penny whistle', 'uilleann pipes',
  'quena', 'sheng', 'suona', 'dizi', 'crumhorn', 'shawm', 'sackbut', 'serpent', 'ophicleide',
  'alphorn', 'conch', 'shofar', 'vuvuzela', 'melodica', '*accordion', 'concertina', 'bandoneon',
  '*harmonium', 'pipe organ|organ', 'post horn', 'natural trumpet', 'slide whistle', 'xaphoon',
  'zampogna', 'launeddas', 'gaita', 'nose flute',
];

const percussionKeyboardInstruments = [
  '*drum', '*piano', '*xylophone', '*tambourine', '*triangle', '*cymbal', '*keyboard', '*bongo|bongos',
  'snare drum', 'bass drum', 'kettledrum|timpani', 'tom-tom|tom tom', 'drum kit|drum set',
  '*conga', 'djembe', '*tabla', 'mridangam', 'dhol', 'bodhran', 'cajón|cajon', '*castanets',
  '*maracas|maraca', 'claves', 'cowbell', '*gong', 'tam-tam', '*glockenspiel', '*marimba',
  'vibraphone', 'celesta', 'tubular bells|chimes', 'steelpan|steel drum|steel pan', 'washboard',
  'spoons', 'woodblock|wood block', 'guiro', 'cabasa', 'shaker', 'rainstick', 'agogo',
  'timbales', 'taiko', 'darbuka|darbouka|doumbek', 'frame drum', 'hang drum|handpan', 'kalimba|mbira|thumb piano',
  'balafon', 'gamelan', 'tabor', 'jaw harp|jew harp', 'flexatone', 'vibraslap', 'ratchet',
  'anvil', 'whip|slapstick', '*harpsichord', 'clavichord', 'spinet', 'virginal', 'grand piano',
  'upright piano', '*synthesizer|synth', 'electric piano', 'hammond organ', 'mellotron',
  'theremin', 'ondes martenot', 'drum machine', 'sampler', 'keytar', 'calliope', 'carillon',
  'handbell', 'sleigh bells', 'hi-hat|hi hat', 'quijada', 'udu', 'ipu', 'zills|finger cymbals',
];

/* ---------------- Sports & games ---------------- */

const ballSports = [
  '*football|soccer', '*basketball', '*tennis', '*golf', '*cricket', '*rugby', '*baseball',
  '*volleyball', '*hockey', '*netball', '*badminton', '*american football', 'rugby league',
  'rugby union', 'australian rules football|aussie rules', 'gaelic football', 'hurling', 'camogie',
  '*lacrosse', 'field hockey', '*ice hockey', '*handball', 'water polo', '*polo', '*squash', 'racquetball',
  '*table tennis|ping pong', '*softball', 'rounders', 'dodgeball', 'kickball', 'korfball', 'pickleball',
  'padel', 'beach volleyball', 'sepak takraw', 'footvolley', 'futsal', 'shinty',
  'jai alai|pelota', 'fives', 'real tennis', 'croquet', 'bowls|lawn bowls', '*bowling|tenpin bowling',
  'skittles', 'pétanque|petanque', 'boules', 'bocce', '*snooker', '*pool', 'billiards', '*darts',
  'kabaddi', 'ultimate frisbee|ultimate', 'frisbee golf|disc golf', 'quidditch|quadball',
  'tchoukball', 'teqball', 'goalball', 'wheelchair basketball', 'sitting volleyball', 'stoolball',
  'paddleball', 'wiffle ball', 'tee-ball|t-ball|tee ball', 'bandy', 'floorball', '*curling',
  'roller hockey', 'underwater hockey', 'canoe polo', 'bossaball',
];

const otherSports = [
  '*swimming', '*running', '*cycling', '*boxing', '*skiing', '*surfing', '*athletics', '*gymnastics',
  '*judo', '*karate', '*wrestling', '*fencing', '*rowing', '*sailing', '*diving', '*triathlon',
  '*marathon', 'decathlon', 'heptathlon', 'pentathlon', 'biathlon', 'javelin', 'discus', 'shot put',
  'hammer throw', 'high jump', 'long jump', 'triple jump', 'pole vault', 'hurdles', 'sprinting',
  'relay', 'steeplechase', 'cross-country|cross country', 'orienteering', 'hiking', 'climbing|rock climbing',
  'bouldering', 'mountaineering', 'abseiling|rappelling', '*archery', 'shooting', '*taekwondo',
  '*kung fu', '*kickboxing', 'muay thai', 'jujitsu|jiu-jitsu|jiu jitsu', 'aikido', 'sumo', 'kendo',
  'capoeira', 'mma|mixed martial arts', 'weightlifting', 'powerlifting', 'bodybuilding', 'crossfit',
  '*snowboarding', '*ice skating|skating', 'figure skating', 'speed skating', 'bobsleigh|bobsled',
  'luge', 'skeleton', 'ski jumping', '*canoeing', '*kayaking', 'rafting', 'windsurfing', 'kitesurfing',
  'waterskiing|water skiing', 'wakeboarding', 'paddleboarding', 'bodyboarding', 'snorkelling|snorkeling',
  'scuba diving', 'equestrian', 'horse racing', 'show jumping', 'dressage', 'rodeo', 'motor racing',
  'formula one', 'rallying', 'karting', 'motocross', 'nascar', '*skateboarding', 'bmx',
  'parkour', 'skydiving', 'paragliding', 'hang gliding', 'bungee jumping', '*yoga', 'pilates',
  'zumba', 'aerobics', 'dancing', '*cheerleading', 'trampolining', 'jogging', 'walking', '*fishing',
  'angling', 'hunting', 'falconry', 'jousting', 'tug of war', 'yachting', 'track cycling',
  'zorbing', 'quoits', 'unicycling', 'inline skating|rollerblading', 'roller derby', 'esports',
];

const boardCardGames = [
  '*chess', '*checkers|draughts', '*monopoly', '*scrabble', '*poker', '*bridge', '*snap', '*backgammon',
  '*cluedo|clue', 'go', '*mahjong|mah-jong|mahjongg', '*dominoes|domino', '*ludo', '*snakes and ladders|chutes and ladders',
  '*battleship|battleships', 'connect four', '*risk', 'trivial pursuit', 'pictionary', 'operation',
  'mousetrap', 'othello|reversi', 'stratego', 'yahtzee', 'boggle', '*jenga', 'catan|settlers of catan',
  'carcassonne', 'ticket to ride', 'pandemic', 'diplomacy', 'mancala', "nine men's morris|nine mens morris",
  'shogi', 'xiangqi|chinese chess', 'chinese checkers', 'halma', 'parcheesi|pachisi', 'sorry',
  'cribbage', '*rummy', 'gin rummy', 'canasta', '*blackjack|twenty-one|pontoon', 'baccarat', 'whist',
  'hearts', 'spades', 'euchre', '*solitaire|patience', 'old maid', '*go fish', '*uno', 'pinochle',
  'bezique', 'piquet', 'cheat', 'crazy eights', 'war', 'beggar my neighbour', 'skat', 'tarot|tarock',
  'belote', 'faro', 'craps', '*roulette', '*bingo', 'dice', '*tic-tac-toe|noughts and crosses|tic tac toe',
  '*hangman', '*charades', '*twister', 'guess who', 'kerplunk', 'hungry hippos', 'quarto', 'qwirkle',
  'quoridor', 'zilch', 'zatre', 'kalah', 'nim', 'marbles', 'jacks', '*hopscotch',
  'tag', 'hide and seek', 'leapfrog', 'skipping', 'kite flying', 'yo-yo|yoyo',
];

/* ---------------- Scientists ---------------- */

const physicsScientists = [
  '*einstein', '*newton', '*galileo', '*hawking', '*curie', '*tesla', '*edison', '*faraday',
  '*bohr', '*planck', '*heisenberg', 'schrödinger|schrodinger', 'dirac', 'pauli', 'fermi', '*feynman',
  '*oppenheimer', '*rutherford', 'thomson', 'chadwick', '*maxwell', '*kelvin', 'joule', '*watt',
  '*volta', 'ampère|ampere', '*ohm', 'coulomb', 'hertz', 'doppler', 'boltzmann', 'röntgen|roentgen|rontgen',
  'becquerel', 'geiger', 'higgs', 'gell-mann|gell mann', 'born', 'compton', 'millikan', 'michelson',
  'lorentz', 'mach', 'kirchhoff', 'carnot', 'fresnel', 'huygens', 'hooke', 'boyle', '*pascal',
  'torricelli', 'fahrenheit', 'celsius', 'meitner', 'noether', 'wu', 'yukawa', 'raman', 'bose',
  'chandrasekhar', 'sakharov', 'landau', 'cherenkov', 'tyndall', 'young', 'franklin', 'gilbert',
  'ørsted|oersted|orsted', 'henry', 'weber', 'zeeman', 'wilson', 'penrose', 'kapitsa',
];

const astronomyMathScientists = [
  '*copernicus', '*kepler', 'brahe', '*halley', 'herschel', '*hubble', '*sagan', 'messier', 'cassini',
  'leavitt', 'eddington', 'lemaître|lemaitre', 'hoyle', 'tombaugh', 'kuiper', 'oort', 'ptolemy',
  'hipparchus', 'aristarchus', 'eratosthenes', '*pythagoras', '*euclid', '*archimedes',
  'euler', 'gauss', 'riemann', 'fermat', 'descartes', 'leibniz', '*lovelace', '*babbage', '*turing',
  'von neumann|neumann', 'gödel|godel', 'hilbert', 'cantor', 'poincaré|poincare', 'laplace',
  'lagrange', 'fourier', 'cauchy', 'galois', 'abel', 'jacobi', 'bernoulli', 'napier', '*fibonacci',
  'ramanujan', 'nash', 'boole', 'shannon', 'mandelbrot', 'conway',
  'hypatia', 'al-khwarizmi|khwarizmi', 'brahmagupta', 'aryabhata', 'perelman', 'wiles',
  '*nightingale', 'mercator', 'kolmogorov', 'markov', 'lobachevsky', 'chebyshev', 'erdős|erdos',
  'hamilton', 'venn', 'zeno', 'thales', 'diophantus', 'apollonius', 'hopper', 'berners-lee|berners lee',
];

const lifeChemInventorScientists = [
  '*darwin', '*pasteur', '*mendel', '*fleming', '*lister', '*jenner', 'koch', 'harvey', 'hippocrates',
  'galen', 'vesalius', 'linnaeus', 'lamarck', 'wallace', 'huxley', 'haeckel', 'leeuwenhoek',
  '*watson', '*crick', 'mcclintock', '*pavlov', '*freud', 'jung', 'salk', 'sabin',
  'banting', '*goodall', 'carson', '*attenborough', '*dawkins', 'audubon', 'cuvier', 'humboldt',
  '*mendeleev', 'lavoisier', 'dalton', 'avogadro', 'priestley', 'cavendish', 'davy', '*nobel',
  'pauling', 'hodgkin', 'haber', 'bunsen', 'arrhenius', 'kekulé|kekule', 'berzelius', 'scheele',
  '*bell', '*marconi', '*morse', 'baird', '*wright', 'diesel', 'daimler', 'benz',
  'stephenson', 'brunel', '*gutenberg', 'whitney', 'westinghouse', 'dyson',
  'zuse', 'wozniak', 'lumière|lumiere', 'daguerre', 'niépce|niepce',
  'yalow', 'ziegler', 'quetelet', 'urey', 'ulam', 'van allen',
  'vavilov', 'virchow', 'ibn sina|avicenna', 'ibn al-haytham|alhazen', 'ivanovsky', 'kinsey',
  'lyell', 'agassiz', 'wegener', 'hutton', '*aristotle', 'democritus', 'empedocles',
];

/* ---------------- Feelings ---------------- */

const positiveFeelings = [
  '*happy', '*joy', '*love', '*excited', '*calm', '*proud', '*grateful', '*hopeful', '*relieved',
  'happiness', 'joyful', 'glad', '*cheerful', '*content', 'contentment', '*delighted', 'delight',
  'elated', 'elation', 'euphoric', 'euphoria', 'ecstatic', 'ecstasy', 'bliss', 'blissful', 'jubilant',
  '*thrilled', 'overjoyed', '*pleased', 'satisfied', 'satisfaction', 'pride', 'gratitude', 'thankful',
  'hope', 'optimistic', 'optimism', 'relief', 'peaceful', 'serene', 'serenity', 'relaxed', 'tranquil',
  'carefree', '*confident', 'confidence', '*brave', 'courageous', 'inspired', 'inspiration', 'motivated',
  'enthusiastic', 'enthusiasm', 'eager', '*excitement', '*curious', 'curiosity', '*amused', 'amusement',
  'playful', 'loving', 'affection', 'affectionate', 'tender', 'compassion', 'compassionate',
  'empathy', 'sympathy', 'warm', 'admiration', 'awe', 'wonder', 'amazed', 'astonished', '*surprised',
  'surprise', 'nostalgic', 'nostalgia', 'zealous', 'zest', 'upbeat', 'yearning',
  'giddy', 'merry', 'jolly', 'buoyant', 'exhilarated', 'exuberant', 'triumphant', 'victorious',
  'secure', 'safe', 'trusting', 'trust', '*loved', 'appreciated', 'fulfilled', 'refreshed', 'energetic',
];

const negativeFeelings = [
  '*sad', '*angry', '*scared', '*afraid', '*lonely', '*bored', '*tired', '*nervous', '*worried',
  '*jealous', '*anxious', '*embarrassed', '*upset', '*fear', '*anger', 'sadness', 'sorrow', 'grief',
  'unhappy', '*miserable', 'misery', '*depressed', 'gloomy', 'glum', 'melancholy', 'heartbroken',
  'despair', 'desperate', 'hopeless', 'despondent', 'dejected', 'downcast', 'forlorn', 'blue',
  'mad', '*furious', 'fury', 'rage', 'irate', 'livid', 'cross', 'irritated', '*annoyed', 'annoyance',
  '*frustrated', 'frustration', 'resentful', 'resentment', 'bitter', 'hostile', 'indignant',
  'outraged', 'exasperated', '*grumpy', 'cranky', 'moody', 'sulky', '*terrified', 'terror', 'frightened',
  'panic', 'panicked', 'dread', 'horror', 'horrified', 'alarmed', 'uneasy', 'apprehensive', 'tense',
  '*stressed', 'stress', 'anxiety', 'worry', 'jittery', 'restless', 'insecure', '*shy', 'timid',
  '*ashamed', 'shame', '*guilty', 'guilt', 'regret', 'remorse', 'remorseful', 'humiliated',
  'embarrassment', 'envy', '*envious', 'jealousy', 'disgust', '*disgusted', 'contempt', 'loathing',
  'hatred', '*hate', 'boredom', 'apathy', 'apathetic', 'indifferent', 'weary', '*exhausted', 'drained',
  'lonesome', 'loneliness', 'isolated', 'abandoned', 'rejected', '*hurt', 'wounded', 'betrayed',
  '*confused', 'confusion', 'bewildered', 'puzzled', 'perplexed', '*overwhelmed', 'helpless',
  'vulnerable', '*disappointed', 'disappointment', 'discouraged', 'disheartened', 'disillusioned',
  'distressed', 'distraught', 'agitated', 'aggrieved', 'queasy', 'vexed', 'wistful',
  '*homesick', 'impatient', 'irritable', 'listless', 'numb',
  'ornery', 'petrified', 'sullen', 'troubled', 'unsettled', 'vengeful', 'woeful',
];

const mixedFeelings = [
  'jaded', 'jumpy', 'joyous', 'keen', 'kindness', 'quizzical', 'qualm', 'longing', 'lust', 'lovesick',
  'infatuated', 'intrigued', 'interested', 'indecisive', 'ambivalent', 'nonchalant', 'pensive',
  'reflective', 'sentimental', 'sheepish', 'smug', 'sleepy', 'drowsy', 'hungry', 'sick', 'excitable',
  'flustered', 'frazzled', 'fed up', 'giddiness', 'hesitant', 'reluctant', 'mischievous', 'nervousness',
  'determined', 'defiant', 'suspicious', 'sceptical|skeptical', 'startled', '*shocked', 'shock',
  'stunned', 'dazed', 'dumbfounded', 'flabbergasted', 'zen',
];

export const CULTURE_CATEGORIES: AlphabetCategory[] = [
  {
    id: 'cities',
    prompt: 'a city',
    title: 'Cities',
    answers: [
      ...westernEuropeCities,
      ...southernEuropeCities,
      ...northernEasternEuropeCities,
      ...eastAsiaCities,
      ...southSoutheastAsiaCities,
      ...westCentralAsiaCities,
      ...africaCities,
      ...northAmericaCities,
      ...latinAmericaCities,
      ...oceaniaCities,
    ],
  },
  {
    id: 'jobs',
    prompt: 'a job',
    title: 'Jobs',
    answers: [...healthJobs, ...tradeJobs, ...officeJobs, ...serviceJobs, ...creativeScienceJobs],
  },
  {
    id: 'instruments',
    prompt: 'a musical instrument',
    title: 'Instruments',
    answers: [...stringInstruments, ...windInstruments, ...percussionKeyboardInstruments],
  },
  {
    id: 'sports',
    prompt: 'a sport or game',
    title: 'Sports & games',
    answers: [...ballSports, ...otherSports, ...boardCardGames],
  },
  {
    id: 'scientists',
    prompt: 'a famous scientist (surname)',
    title: 'Scientists',
    answers: [...physicsScientists, ...astronomyMathScientists, ...lifeChemInventorScientists],
  },
  {
    id: 'feelings',
    prompt: 'a feeling',
    title: 'Feelings',
    answers: [...positiveFeelings, ...negativeFeelings, ...mixedFeelings],
  },
];
