import type { Language } from '../stores/useSettingsStore'

interface SoundInfoEntry {
  description: Record<Language, string>
  bestFor: Record<Language, string>
  tip?: Record<Language, string>
}

const t = (en: string, ro: string, ru: string, es: string): Record<Language, string> => ({ en, ro, ru, es })

export const soundInfo: Record<string, SoundInfoEntry> = {
  // ═══ BABY SLEEP ═══
  'lullaby-xylophone': {
    description: t('Gentle xylophone melody with soft mallets. Classic lullaby arrangement.', 'Melodie delicata de xilofon cu baghete moi. Aranjament clasic de leagan.', 'Нежная мелодия ксилофона с мягкими палочками. Классическая колыбельная.', 'Suave melodia de xilofono con mazos suaves. Arreglo clasico de cuna.'),
    bestFor: t('Newborns to toddlers, bedtime routine', 'Nou-nascuti si copii mici, rutina de somn', 'Новорожденные и малыши, ритуал перед сном', 'Recien nacidos a ninos pequenos, rutina para dormir'),
  },
  'baby-harp': {
    description: t('Magical harp and mallets creating a fairytale atmosphere.', 'Harpa magica si baghete care creeaza o atmosfera de basm.', 'Волшебная арфа и колокольчики, создающие сказочную атмосферу.', 'Arpa magica y mazos creando una atmosfera de cuento de hadas.'),
    bestFor: t('Creating a calm, dreamy environment', 'Crearea unui mediu calm si visator', 'Создание спокойной, мечтательной обстановки', 'Crear un ambiente tranquilo y sonador'),
  },
  heartbeat: {
    description: t('Rhythmic heartbeat at ~72 BPM. Mimics the sound heard in the womb.', 'Batai ritmice ale inimii la ~72 BPM. Imita sunetul auzit in uter.', 'Ритмичное сердцебиение ~72 уд/мин. Имитирует звук в утробе матери.', 'Latido ritmico a ~72 BPM. Imita el sonido escuchado en el utero.'),
    bestFor: t('Newborns (0-3 months). 80% of newborns fall asleep faster with womb sounds.', 'Nou-nascuti (0-3 luni). 80% din nou-nascuti adorm mai repede cu sunete din uter.', 'Новорожденные (0-3 мес). 80% новорожденных засыпают быстрее со звуками утробы.', 'Recien nacidos (0-3 meses). El 80% se duerme mas rapido con sonidos del utero.'),
    tip: t('Keep volume low. AAP recommends max 50dB for infants.', 'Volumul sa fie scazut. AAP recomanda max 50dB pentru bebelusi.', 'Громкость низкая. AAP рекомендует макс. 50дБ для младенцев.', 'Mantener volumen bajo. AAP recomienda max 50dB para bebes.'),
  },
  shush: {
    description: t('Continuous shushing sound. One of Dr. Harvey Karp\'s "5 S\'s" for calming babies.', 'Sunet continuu de "shhh". Una din cele "5 S-uri" ale Dr. Harvey Karp pentru calmarea bebelusilor.', 'Непрерывный звук "шшш". Один из "5 С" доктора Харви Карпа для успокоения детей.', 'Sonido continuo de "shh". Uno de los "5 S" del Dr. Harvey Karp para calmar bebes.'),
    bestFor: t('Immediate soothing of crying babies', 'Calmarea imediata a bebelusilor care plang', 'Немедленное успокоение плачущих детей', 'Calmar inmediatamente a bebes que lloran'),
    tip: t('Start louder than the crying, then gradually reduce.', 'Incepe mai tare decat plansul, apoi reduce treptat.', 'Начните громче плача, затем постепенно уменьшайте.', 'Empieza mas fuerte que el llanto, luego reduce gradualmente.'),
  },
  womb: {
    description: t('Low-frequency rumble with muffled heartbeat, replicating womb acoustics (~80-90dB in utero).', 'Vibratie de frecventa joasa cu batai inabuse ale inimii, replicand acustica uterului.', 'Низкочастотный гул с приглушённым сердцебиением, воспроизводящий акустику утробы.', 'Vibración de baja frecuencia con latido amortiguado, replicando la acustica del utero.'),
    bestFor: t('Newborns adjusting to the outside world', 'Nou-nascuti care se adapteaza la lumea exterioara', 'Новорожденные, адаптирующиеся к внешнему миру', 'Recien nacidos adaptandose al mundo exterior'),
    tip: t('Most effective for babies under 3 months.', 'Cel mai eficient pentru bebelusi sub 3 luni.', 'Наиболее эффективно для детей до 3 месяцев.', 'Mas efectivo para bebes menores de 3 meses.'),
  },
  'baby-pink': {
    description: t('Pink noise: more bass, less treble than white. Closest to actual womb sound spectrum.', 'Zgomot roz: mai mult bas, mai putine inalte decat albul. Cel mai aproape de spectrul real al uterului.', 'Розовый шум: больше баса, меньше высоких. Ближе всего к реальному спектру звуков утробы.', 'Ruido rosa: mas graves, menos agudos que el blanco. Lo mas cercano al espectro real del utero.'),
    bestFor: t('Sleep for all ages. Gentler on developing ears than white noise.', 'Somn pentru toate varstele. Mai bland pentru urechile in dezvoltare.', 'Сон для всех возрастов. Мягче для развивающегося слуха.', 'Sueno para todas las edades. Mas suave para oidos en desarrollo.'),
    tip: t('Pediatricians increasingly recommend pink over white noise for infants.', 'Pediatrii recomanda din ce in ce mai mult zgomotul roz in locul celui alb.', 'Педиатры всё чаще рекомендуют розовый шум вместо белого.', 'Los pediatras recomiendan cada vez mas el ruido rosa sobre el blanco.'),
  },

  // ═══ NOISE COLORS ═══
  'white-noise': {
    description: t('Equal energy across all frequencies (20Hz-20kHz). Like TV static or rushing waterfall.', 'Energie egala pe toate frecventele (20Hz-20kHz). Ca staticul TV sau o cascada.', 'Равная энергия на всех частотах (20Гц-20кГц). Как помехи ТВ или водопад.', 'Energia igual en todas las frecuencias (20Hz-20kHz). Como estatica de TV o cascada.'),
    bestFor: t('Masking sudden sounds (traffic, doors). Most studied for sleep.', 'Mascarea sunetelor bruste (trafic, usi). Cel mai studiat pentru somn.', 'Маскировка резких звуков (трафик, двери). Наиболее изучен для сна.', 'Enmascarar sonidos repentinos (trafico, puertas). El mas estudiado para dormir.'),
  },
  'pink-noise': {
    description: t('Energy decreases 3dB/octave as frequency rises. More bass, less treble. Sounds like steady rain.', 'Energia scade cu 3dB/octava. Mai mult bas, mai putine inalte. Suna ca o ploaie constanta.', 'Энергия уменьшается на 3дБ/октаву. Больше баса. Звучит как ровный дождь.', 'Energia disminuye 3dB/octava. Mas graves, menos agudos. Suena como lluvia constante.'),
    bestFor: t('Sleep and relaxation. Studies show it may improve deep sleep quality.', 'Somn si relaxare. Studii arata ca poate imbunatati calitatea somnului profund.', 'Сон и расслабление. Исследования показывают улучшение глубокого сна.', 'Sueno y relajacion. Estudios muestran que mejora la calidad del sueno profundo.'),
  },
  'brown-noise': {
    description: t('Energy decreases 6dB/octave. Very bass-heavy. Named after Brownian motion, not the color.', 'Energia scade cu 6dB/octava. Foarte bogat in bas. Numit dupa miscarea Browniana, nu culoarea.', 'Энергия уменьшается на 6дБ/октаву. Очень басовитый. Назван по броуновскому движению.', 'Energia disminuye 6dB/octava. Muy grave. Nombrado por el movimiento browniano.'),
    bestFor: t('Deep focus, tinnitus relief, ADHD concentration. Trending on TikTok.', 'Focus profund, ameliorarea tinitusului, concentrare ADHD. Trending pe TikTok.', 'Глубокий фокус, помощь при тиннитусе, концентрация при СДВГ. Тренд в TikTok.', 'Enfoque profundo, alivio de tinnitus, concentracion TDAH. Tendencia en TikTok.'),
  },
  'fan-noise': {
    description: t('Smooth brown noise mimicking a bedroom fan. Consistent, warm hum.', 'Zgomot maro lin care imita un ventilator de dormitor.', 'Плавный коричневый шум, имитирующий комнатный вентилятор.', 'Ruido marron suave imitando un ventilador de dormitorio.'),
    bestFor: t('People who grew up sleeping with a fan. Very popular sleep sound.', 'Persoane care au crescut dormind cu ventilator. Foarte popular.', 'Люди, привыкшие спать с вентилятором. Очень популярный звук.', 'Personas que crecieron durmiendo con ventilador. Muy popular.'),
    tip: t('One of the most requested sleep sounds worldwide.', 'Unul din cele mai cautate sunete de somn din lume.', 'Один из самых востребованных звуков для сна в мире.', 'Uno de los sonidos para dormir mas solicitados del mundo.'),
  },
  'vacuum-noise': {
    description: t('White noise with vacuum cleaner character. Surprisingly effective for babies.', 'Zgomot alb cu caracter de aspirator. Surprinzator de eficient pentru bebelusi.', 'Белый шум с характером пылесоса. Удивительно эффективен для детей.', 'Ruido blanco con caracter de aspiradora. Sorprendentemente efectivo para bebes.'),
    bestFor: t('Emergency colic soothing. Many parents report instant calming.', 'Calmare de urgenta a colicilor. Multi parinti raporteaza calmare instantanee.', 'Экстренное успокоение колик. Многие родители сообщают о мгновенном эффекте.', 'Calmar colicos de emergencia. Muchos padres reportan calma instantanea.'),
  },

  // ═══ BINAURAL BEATS ═══
  'binaural-delta': {
    description: t('Delta waves (2Hz): Two tones create a 2Hz pulse. Deepest sleep stages (N3/N4).', 'Unde delta (2Hz): Doua tonuri creeaza un puls de 2Hz. Stadiile cele mai profunde ale somnului.', 'Дельта-волны (2Гц): Два тона создают пульс 2Гц. Глубочайшие стадии сна (N3/N4).', 'Ondas delta (2Hz): Dos tonos crean un pulso de 2Hz. Etapas mas profundas del sueno.'),
    bestFor: t('Deep dreamless sleep, physical healing, growth hormone release.', 'Somn profund fara vise, vindecare fizica, eliberare hormon de crestere.', 'Глубокий сон без сновидений, физическое исцеление, гормон роста.', 'Sueno profundo sin suenos, sanacion fisica, liberacion de hormona de crecimiento.'),
    tip: t('Use headphones - binaural beats only work with stereo separation.', 'Foloseste casti - undele binaurale functioneaza doar cu separare stereo.', 'Используйте наушники - бинауральные биты работают только в стерео.', 'Usa auriculares - los binaurales solo funcionan con separacion estereo.'),
  },
  'binaural-theta': {
    description: t('Theta waves (6Hz): The "twilight zone" between wakefulness and sleep.', 'Unde theta (6Hz): "Zona crepusculara" intre trezie si somn.', 'Тета-волны (6Гц): "Сумеречная зона" между бодрствованием и сном.', 'Ondas theta (6Hz): La "zona crepuscular" entre vigilia y sueno.'),
    bestFor: t('Falling asleep, light meditation, visualization.', 'Adormire, meditatie usoara, vizualizare.', 'Засыпание, лёгкая медитация, визуализация.', 'Conciliar el sueno, meditacion ligera, visualizacion.'),
    tip: t('Use headphones - binaural beats only work with stereo separation.', 'Foloseste casti - undele binaurale functioneaza doar cu separare stereo.', 'Используйте наушники - бинауральные биты работают только в стерео.', 'Usa auriculares - los binaurales solo funcionan con separacion estereo.'),
  },
  'binaural-alpha': {
    description: t('Alpha waves (10Hz): Classic relaxation frequency. Eyes-closed wakefulness.', 'Unde alfa (10Hz): Frecventa clasica de relaxare. Trezie cu ochii inchisi.', 'Альфа-волны (10Гц): Классическая частота расслабления. Бодрствование с закрытыми глазами.', 'Ondas alfa (10Hz): Frecuencia clasica de relajacion. Vigilia con ojos cerrados.'),
    bestFor: t('General relaxation, study background, post-workout recovery.', 'Relaxare generala, fundal pentru studiu, recuperare dupa antrenament.', 'Общее расслабление, фон для учёбы, восстановление после тренировки.', 'Relajacion general, fondo de estudio, recuperacion post-ejercicio.'),
  },
  'binaural-beta': {
    description: t('Beta waves (15Hz): Active thinking, concentration, problem solving.', 'Unde beta (15Hz): Gandire activa, concentrare, rezolvarea problemelor.', 'Бета-волны (15Гц): Активное мышление, концентрация, решение задач.', 'Ondas beta (15Hz): Pensamiento activo, concentracion, resolucion de problemas.'),
    bestFor: t('Study sessions, focused work, analytical tasks.', 'Sesiuni de studiu, munca focusata, sarcini analitice.', 'Учебные сессии, сосредоточенная работа, аналитические задачи.', 'Sesiones de estudio, trabajo enfocado, tareas analiticas.'),
    tip: t('Not recommended before sleep - promotes wakefulness.', 'Nu e recomandat inainte de somn - promoveaza trezia.', 'Не рекомендуется перед сном - способствует бодрствованию.', 'No recomendado antes de dormir - promueve la vigilia.'),
  },
  'binaural-gamma40': {
    description: t('Gamma waves (40Hz): The "binding frequency" linked to consciousness, memory and learning.', 'Unde gamma (40Hz): "Frecventa de legare" asociata cu constiinta, memoria si invatarea.', 'Гамма-волны (40Гц): "Частота связывания", связанная с сознанием, памятью и обучением.', 'Ondas gamma (40Hz): La "frecuencia de enlace" vinculada a conciencia, memoria y aprendizaje.'),
    bestFor: t('Peak mental state. Studies show Alzheimer\'s patients benefit from 40Hz stimulation.', 'Stare mentala de varf. Studii arata ca pacientii Alzheimer beneficiaza de stimulare 40Hz.', 'Пиковое ментальное состояние. Исследования: пациенты с Альцгеймером реагируют на 40Гц.', 'Estado mental pico. Estudios muestran que pacientes con Alzheimer se benefician de 40Hz.'),
  },
  'binaural-schumann': {
    description: t('Schumann resonance (7.83Hz): Earth\'s electromagnetic "heartbeat" - the frequency between Earth\'s surface and ionosphere.', 'Rezonanta Schumann (7.83Hz): "Bataile inimii" electromagnetice ale Pamantului.', 'Резонанс Шумана (7,83Гц): Электромагнитное "сердцебиение" Земли.', 'Resonancia Schumann (7.83Hz): El "latido" electromagnetico de la Tierra.'),
    bestFor: t('Grounding, connection to nature, deep meditation.', 'Impamantare, conexiune cu natura, meditatie profunda.', 'Заземление, связь с природой, глубокая медитация.', 'Conexion a tierra, conexion con la naturaleza, meditacion profunda.'),
    tip: t('Some researchers believe humans evolved in sync with this frequency.', 'Unii cercetatori cred ca oamenii au evoluat in sincronizare cu aceasta frecventa.', 'Некоторые исследователи считают, что люди эволюционировали в синхронизации с этой частотой.', 'Algunos investigadores creen que los humanos evolucionaron en sincronia con esta frecuencia.'),
  },
}

/** Get info for a sound in a specific language, with fallback to English */
export function getSoundInfo(id: string, lang: Language): { description: string; bestFor: string; tip?: string } | null {
  const entry = soundInfo[id]
  if (!entry) return null
  return {
    description: entry.description[lang] ?? entry.description.en,
    bestFor: entry.bestFor[lang] ?? entry.bestFor.en,
    tip: entry.tip ? (entry.tip[lang] ?? entry.tip.en) : undefined,
  }
}
